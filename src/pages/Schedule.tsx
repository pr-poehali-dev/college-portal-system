import { useState, useEffect } from 'react';
import { Role } from '../App';
import { AuthUser } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface Props { role: Role; user: AuthUser }

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
const FULL_DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const LESSON_COLORS = ['#7c5cfc', '#06d6f5', '#f72585', '#f7c325', '#39ff82', '#ff6b35'];

interface Lesson {
  id: number; subject: string; lesson_type: string; room: string;
  day_of_week: number; time_start: string;
  teacher_name: string; teacher_id: number;
  group_name: string; group_id: number;
}

interface Group { id: number; name: string }

const colorFor = (id: number) => LESSON_COLORS[id % LESSON_COLORS.length];

export default function SchedulePage({ role, user }: Props) {
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 || d === 6 ? 0 : d - 1;
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ group_id: '', subject: '', lesson_type: 'Лекция', room: '', day_of_week: '0', time_start: '08:00', teacher_id: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadLessons();
    if (role !== 'student') api.getGroups().then(d => { if (d.groups) setGroups(d.groups); });
  }, [role, user]);

  const loadLessons = async () => {
    setLoading(true);
    const params: Record<string, number> = {};
    if (role === 'student' && user.group_id) params.group_id = user.group_id;
    if (role === 'teacher') params.teacher_id = user.id;
    const data = await api.getSchedule(params);
    if (data.lessons) setLessons(data.lessons);
    setLoading(false);
  };

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const data = await api.addLesson({
      group_id: parseInt(form.group_id),
      subject: form.subject,
      lesson_type: form.lesson_type,
      room: form.room,
      day_of_week: parseInt(form.day_of_week),
      time_start: form.time_start,
      teacher_id: role === 'admin' && form.teacher_id ? parseInt(form.teacher_id) : user.id,
    });
    if (data.error) { setFormError(data.error); return; }
    setShowForm(false);
    setForm({ group_id: '', subject: '', lesson_type: 'Лекция', room: '', day_of_week: '0', time_start: '08:00', teacher_id: '' });
    loadLessons();
  };

  const dayLessons = lessons.filter(l => l.day_of_week === activeDay);

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
  const todayIdx = today.getDay() === 0 ? -1 : today.getDay() - 1;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Расписание</h1>
        <p className="text-white/40 text-sm">
          {role === 'student' ? `Группа · Текущая неделя` : role === 'teacher' ? 'Ваши занятия' : 'Все занятия'}
        </p>
      </div>

      {/* Week tabs */}
      <div className="glass rounded-2xl p-1.5 flex gap-1 mb-6">
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setActiveDay(i)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all duration-200 ${activeDay === i ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            style={activeDay === i ? { background: 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(6,214,245,0.15))', border: '1px solid rgba(124,92,252,0.3)' } : {}}>
            <span className="text-xs font-medium">{d}</span>
            <span className={`text-base font-bold ${activeDay === i ? 'gradient-text' : ''}`}>{weekDates[i]}</span>
            {i === todayIdx && <span className="w-1 h-1 rounded-full bg-cyan-400"></span>}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{FULL_DAYS[activeDay]}</h2>
          <p className="text-sm text-white/40">
            {loading ? 'Загрузка...' : `${dayLessons.length} ${dayLessons.length === 1 ? 'пара' : dayLessons.length < 5 ? 'пары' : 'пар'}`}
          </p>
        </div>
        {(role === 'teacher' || role === 'admin') && (
          <button onClick={() => { setShowForm(v => !v); setFormError(''); }}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-colors"
            style={{ background: showForm ? 'rgba(247,37,133,0.15)' : 'rgba(124,92,252,0.15)', color: showForm ? '#f72585' : '#a78bfa' }}>
            <Icon name={showForm ? 'X' : 'Plus'} size={15} />
            {showForm ? 'Отмена' : 'Добавить пару'}
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addLesson} className="glass rounded-2xl p-5 mb-5 animate-fade-in" style={{ border: '1px solid rgba(124,92,252,0.2)' }}>
          <h3 className="text-white font-semibold mb-4">Новая пара</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Предмет</label>
              <input required className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                placeholder="Высшая математика" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Группа</label>
              <select required className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                value={form.group_id} onChange={e => setForm(p => ({ ...p, group_id: e.target.value }))}>
                <option value="">Выберите группу</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">День недели</label>
              <select className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                value={form.day_of_week} onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value }))}>
                {FULL_DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Время начала</label>
              <input type="time" className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                value={form.time_start} onChange={e => setForm(p => ({ ...p, time_start: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Тип занятия</label>
              <select className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                value={form.lesson_type} onChange={e => setForm(p => ({ ...p, lesson_type: e.target.value }))}>
                {['Лекция', 'Практика', 'Лаб. работа', 'Семинар', 'Занятие'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Аудитория</label>
              <input className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                placeholder="301" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} />
            </div>
          </div>
          {formError && <p className="text-sm text-pink-400 mt-3">{formError}</p>}
          <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
            Добавить пару
          </button>
        </form>
      )}

      {/* Lessons list */}
      {loading ? (
        <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm">Загрузка расписания...</div>
      ) : dayLessons.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <span className="text-4xl mb-3 block">🎉</span>
          <p className="text-white font-semibold">Занятий нет</p>
          <p className="text-white/40 text-sm mt-1">{role !== 'student' ? 'Добавьте пару кнопкой выше' : 'Можно отдохнуть!'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {dayLessons.sort((a, b) => a.time_start.localeCompare(b.time_start)).map((lesson) => {
            const color = colorFor(lesson.id);
            return (
              <div key={lesson.id} className="glass glass-hover rounded-2xl p-4 animate-fade-in cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 text-center w-12">
                    <p className="text-sm font-bold text-white">{lesson.time_start}</p>
                    <p className="text-xs text-white/30">90 мин</p>
                  </div>
                  <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: color }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white text-sm">{lesson.subject}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {lesson.teacher_name} · {lesson.group_name}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg shrink-0 font-medium"
                        style={{ background: `${color}22`, color }}>
                        {lesson.lesson_type}
                      </span>
                    </div>
                    {lesson.room && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Icon name="MapPin" size={12} className="text-white/30" />
                        <span className="text-xs text-white/40">Аудитория {lesson.room}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
