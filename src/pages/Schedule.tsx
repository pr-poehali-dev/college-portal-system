import { useState } from 'react';
import { Role } from '../App';
import Icon from '@/components/ui/icon';

interface Props { role: Role }

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
const fullDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const dates = [7, 8, 9, 10, 11];

const schedule: Record<number, { time: string; subj: string; teacher: string; room: string; type: string; color: string }[]> = {
  0: [
    { time: '08:00', subj: 'Высшая математика', teacher: 'Петров А.В.', room: '301', type: 'Лекция', color: '#7c5cfc' },
    { time: '09:40', subj: 'Физика', teacher: 'Смирнова Е.И.', room: '205', type: 'Лаб. работа', color: '#06d6f5' },
    { time: '13:00', subj: 'Программирование', teacher: 'Козлов Д.А.', room: '412', type: 'Практика', color: '#f72585' },
  ],
  1: [
    { time: '10:20', subj: 'История', teacher: 'Фёдоров Н.П.', room: '110', type: 'Лекция', color: '#f7c325' },
    { time: '12:00', subj: 'Английский язык', teacher: 'Белова И.С.', room: '204', type: 'Практика', color: '#39ff82' },
  ],
  2: [
    { time: '08:00', subj: 'Высшая математика', teacher: 'Петров А.В.', room: '301', type: 'Практика', color: '#7c5cfc' },
    { time: '09:40', subj: 'Программирование', teacher: 'Козлов Д.А.', room: '412', type: 'Лекция', color: '#f72585' },
    { time: '11:20', subj: 'Физика', teacher: 'Смирнова Е.И.', room: '205', type: 'Лекция', color: '#06d6f5' },
    { time: '13:00', subj: 'Физическая культура', teacher: 'Орлов М.В.', room: 'Спортзал', type: 'Занятие', color: '#39ff82' },
  ],
  3: [
    { time: '09:40', subj: 'История', teacher: 'Фёдоров Н.П.', room: '110', type: 'Семинар', color: '#f7c325' },
    { time: '13:00', subj: 'Программирование', teacher: 'Козлов Д.А.', room: '412', type: 'Лаб. работа', color: '#f72585' },
  ],
  4: [
    { time: '08:00', subj: 'Английский язык', teacher: 'Белова И.С.', room: '204', type: 'Практика', color: '#39ff82' },
    { time: '09:40', subj: 'Высшая математика', teacher: 'Петров А.В.', room: '301', type: 'Лекция', color: '#7c5cfc' },
    { time: '11:20', subj: 'Физика', teacher: 'Смирнова Е.И.', room: '205', type: 'Практика', color: '#06d6f5' },
  ],
};

export default function SchedulePage({ role }: Props) {
  const [activeDay, setActiveDay] = useState(3);

  const lessons = schedule[activeDay] ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Расписание</h1>
        <p className="text-white/40 text-sm">
          {role === 'student' ? 'Группа ИТ-21 · Апрель 2026' : role === 'teacher' ? 'Ваши занятия · Апрель 2026' : 'Все расписание · Апрель 2026'}
        </p>
      </div>

      {/* Week tabs */}
      <div className="glass rounded-2xl p-1.5 flex gap-1 mb-6">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all duration-200 ${
              activeDay === i ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}
            style={activeDay === i ? {
              background: 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(6,214,245,0.15))',
              border: '1px solid rgba(124,92,252,0.3)'
            } : {}}
          >
            <span className="text-xs font-medium">{d}</span>
            <span className={`text-base font-bold ${activeDay === i ? 'gradient-text' : ''}`}>{dates[i]}</span>
            {i === 3 && <span className="w-1 h-1 rounded-full bg-cyan-400"></span>}
          </button>
        ))}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{fullDays[activeDay]}, {dates[activeDay]} апреля</h2>
          <p className="text-sm text-white/40">{lessons.length} {lessons.length === 1 ? 'пара' : lessons.length < 5 ? 'пары' : 'пар'}</p>
        </div>
        {role !== 'student' && (
          <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium text-violet-300 bg-violet-500/15 hover:bg-violet-500/25 transition-colors">
            <Icon name="Plus" size={15} />
            Добавить пару
          </button>
        )}
      </div>

      {/* Lessons */}
      {lessons.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <span className="text-4xl mb-3 block">🎉</span>
          <p className="text-white font-semibold">Выходной день</p>
          <p className="text-white/40 text-sm mt-1">Занятий нет, можно отдохнуть</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {lessons.map((lesson, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-4 animate-fade-in cursor-pointer">
              <div className="flex items-start gap-4">
                {/* Time */}
                <div className="shrink-0 text-center w-12">
                  <p className="text-sm font-bold text-white">{lesson.time}</p>
                  <p className="text-xs text-white/30">90 мин</p>
                </div>

                {/* Color bar */}
                <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: lesson.color }}></div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{lesson.subj}</p>
                      <p className="text-xs text-white/40 mt-0.5">{lesson.teacher}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg shrink-0 font-medium"
                      style={{ background: `${lesson.color}22`, color: lesson.color }}>
                      {lesson.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Icon name="MapPin" size={12} />
                      Аудитория {lesson.room}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
