import { Role } from '../App';
import Icon from '@/components/ui/icon';

interface Props { role: Role }

const studentStats = [
  { label: 'Курсов активно', value: '6', icon: 'BookOpen', color: '#7c5cfc' },
  { label: 'Задач на неделю', value: '12', icon: 'ClipboardList', color: '#06d6f5' },
  { label: 'Средний балл', value: '4.6', icon: 'Star', color: '#f72585' },
  { label: 'Дней до сессии', value: '23', icon: 'Timer', color: '#39ff82' },
];

const teacherStats = [
  { label: 'Групп веду', value: '4', icon: 'Users', color: '#7c5cfc' },
  { label: 'Студентов', value: '87', icon: 'GraduationCap', color: '#06d6f5' },
  { label: 'Непроверенных работ', value: '14', icon: 'FileCheck', color: '#f72585' },
  { label: 'Пар сегодня', value: '3', icon: 'CalendarCheck', color: '#39ff82' },
];

const adminStats = [
  { label: 'Пользователей', value: '342', icon: 'Users', color: '#7c5cfc' },
  { label: 'Активных курсов', value: '28', icon: 'BookOpen', color: '#06d6f5' },
  { label: 'Обращений', value: '7', icon: 'MessageCircle', color: '#f72585' },
  { label: 'Групп', value: '16', icon: 'Layers', color: '#39ff82' },
];

const recentActivity = [
  { text: 'Новое задание по математике', time: '10 мин', dot: '#7c5cfc' },
  { text: 'Оценка за эссе: 5.0', time: '1 ч', dot: '#39ff82' },
  { text: 'Вебинар завтра в 10:00', time: '3 ч', dot: '#06d6f5' },
  { text: 'Обновлено расписание на пятницу', time: '5 ч', dot: '#f72585' },
];

const courses = [
  { name: 'Высшая математика', teacher: 'Петров А.В.', progress: 72, color: '#7c5cfc' },
  { name: 'Физика', teacher: 'Смирнова Е.И.', progress: 58, color: '#06d6f5' },
  { name: 'Программирование', teacher: 'Козлов Д.А.', progress: 85, color: '#f72585' },
];

export default function DashboardPage({ role }: Props) {
  const stats = role === 'student' ? studentStats : role === 'teacher' ? teacherStats : adminStats;
  const greeting = role === 'student' ? 'Алексей' : role === 'teacher' ? 'Марина Игоревна' : 'Администратор';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-end gap-4 mb-2">
          <div>
            <p className="text-white/40 text-sm mb-1">Добрый день,</p>
            <h1 className="text-3xl font-bold text-white">{greeting} <span className="gradient-text">👋</span></h1>
          </div>
          <div className="ml-auto glass rounded-2xl px-4 py-2 text-sm text-white/60">
            <span className="text-white font-medium">Четверг</span>, 9 апреля 2026
          </div>
        </div>
        <p className="text-white/40 text-sm">
          {role === 'student' && 'ИТ-21, 2 курс · Факультет информационных технологий'}
          {role === 'teacher' && 'Кафедра математики · Доцент'}
          {role === 'admin' && 'Системный администратор · Полный доступ'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {stats.map((s, i) => (
          <div key={i} className="glass glass-hover rounded-2xl p-4 animate-fade-in cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}22`, border: `1px solid ${s.color}44` }}>
                <Icon name={s.icon} size={17} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-xs text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Courses / main block */}
        {role === 'student' && (
          <div className="lg:col-span-2 glass rounded-2xl p-5 animate-fade-in">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon name="BookOpen" size={16} className="text-violet-400" />
              Мои курсы
            </h2>
            <div className="flex flex-col gap-4">
              {courses.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-white/40">{c.teacher}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: c.color }}>{c.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full progress-grad transition-all duration-700"
                      style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {role === 'teacher' && (
          <div className="lg:col-span-2 glass rounded-2xl p-5 animate-fade-in">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon name="FileCheck" size={16} className="text-cyan-400" />
              Непроверенные работы
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { student: 'Иванов А.', subject: 'Матан', task: 'Контрольная №3', date: '08.04' },
                { student: 'Смирнова В.', subject: 'Матан', task: 'Домашнее задание', date: '07.04' },
                { student: 'Козлов Д.', subject: 'Алгебра', task: 'Реферат', date: '06.04' },
              ].map((w, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300">
                    {w.student[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{w.student} · {w.task}</p>
                    <p className="text-xs text-white/40">{w.subject} · {w.date}</p>
                  </div>
                  <button className="text-xs px-3 py-1 rounded-lg font-medium text-violet-300 bg-violet-500/15 hover:bg-violet-500/25 transition-colors">
                    Открыть
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="lg:col-span-2 glass rounded-2xl p-5 animate-fade-in">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon name="Activity" size={16} className="text-cyan-400" />
              Активность платформы
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Студентов онлайн', value: 127, max: 300, color: '#7c5cfc' },
                { label: 'Преподавателей онлайн', value: 14, max: 40, color: '#06d6f5' },
                { label: 'Загруженность серверов', value: 34, max: 100, color: '#39ff82' },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60">{row.label}</span>
                    <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(row.value / row.max) * 100}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="glass rounded-2xl p-5 animate-fade-in">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Icon name="Zap" size={16} className="text-yellow-400" />
            Активность
          </h2>
          <div className="flex flex-col gap-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.dot }}></div>
                <div>
                  <p className="text-sm text-white/80">{a.text}</p>
                  <p className="text-xs text-white/30">{a.time} назад</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
