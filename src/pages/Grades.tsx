import { Role } from '../App';
import { AuthUser } from '@/hooks/useAuth';
import Icon from '@/components/ui/icon';

interface Props { role: Role; user: AuthUser }

const studentGrades = [
  { subject: 'Высшая математика', teacher: 'Петров А.В.', grade: 4.5, items: [5,4,4,5,4], type: 'Экзамен', color: '#7c5cfc' },
  { subject: 'Физика', teacher: 'Смирнова Е.И.', grade: 3.8, items: [4,3,4,4,3], type: 'Зачёт', color: '#06d6f5' },
  { subject: 'Программирование', teacher: 'Козлов Д.А.', grade: 4.9, items: [5,5,5,4,5], type: 'Экзамен', color: '#f72585' },
  { subject: 'История', teacher: 'Фёдоров Н.П.', grade: 4.2, items: [4,4,5,4,4], type: 'Зачёт', color: '#f7c325' },
  { subject: 'Английский язык', teacher: 'Белова И.С.', grade: 4.7, items: [5,5,4,5,4], type: 'Экзамен', color: '#39ff82' },
];

const teacherGroups = [
  { group: 'ИТ-21', subject: 'Высшая математика', students: 22, avg: 4.1, top: 5, low: 2 },
  { group: 'ИТ-22', subject: 'Высшая математика', students: 19, avg: 3.9, top: 3, low: 4 },
  { group: 'МА-21', subject: 'Алгебра', students: 24, avg: 4.3, top: 7, low: 1 },
  { group: 'МА-22', subject: 'Алгебра', students: 21, avg: 4.0, top: 4, low: 3 },
];

const adminOverview = [
  { label: 'Отлично (5)', count: 142, pct: 41, color: '#39ff82' },
  { label: 'Хорошо (4)', count: 121, pct: 35, color: '#7c5cfc' },
  { label: 'Удовлет. (3)', count: 62, pct: 18, color: '#f7c325' },
  { label: 'Неудовл. (2)', count: 21, pct: 6, color: '#f72585' },
];

function GradeCircle({ value }: { value: number }) {
  const color = value >= 4.5 ? '#39ff82' : value >= 4 ? '#7c5cfc' : value >= 3.5 ? '#f7c325' : '#f72585';
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {value.toFixed(1)}
    </div>
  );
}

export default function GradesPage({ role, user: _user }: Props) {
  const avg = role === 'student'
    ? (studentGrades.reduce((s, g) => s + g.grade, 0) / studentGrades.length).toFixed(2)
    : null;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Успеваемость</h1>
        <p className="text-white/40 text-sm">
          {role === 'student' ? '2 курс · Весенний семестр 2026' : role === 'teacher' ? 'Ваши дисциплины · Весенний семестр 2026' : 'Общая статистика · Весенний семестр 2026'}
        </p>
      </div>

      {/* Student view */}
      {role === 'student' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold gradient-text mb-1">{avg}</p>
              <p className="text-xs text-white/40">Средний балл</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-white mb-1">5</p>
              <p className="text-xs text-white/40">Дисциплин</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400 mb-1">3</p>
              <p className="text-xs text-white/40">Экзамена</p>
            </div>
          </div>

          {/* Grades */}
          <div className="flex flex-col gap-3 stagger">
            {studentGrades.map((g, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-4 animate-fade-in">
                <div className="flex items-start gap-4">
                  <GradeCircle value={g.grade} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-white text-sm">{g.subject}</p>
                        <p className="text-xs text-white/40">{g.teacher}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg shrink-0"
                        style={{ background: `${g.color}22`, color: g.color }}>
                        {g.type}
                      </span>
                    </div>
                    {/* Mini grades */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">Оценки:</span>
                      <div className="flex gap-1.5">
                        {g.items.map((mark, j) => (
                          <span key={j} className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center"
                            style={{
                              background: mark === 5 ? '#39ff8222' : mark === 4 ? '#7c5cfc22' : '#f7c32522',
                              color: mark === 5 ? '#39ff82' : mark === 4 ? '#a78bfa' : '#f7c325'
                            }}>
                            {mark}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Teacher view */}
      {role === 'teacher' && (
        <div className="flex flex-col gap-4 stagger">
          {teacherGroups.map((g, i) => (
            <div key={i} className="glass glass-hover rounded-2xl p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-white">{g.group} · {g.subject}</p>
                  <p className="text-xs text-white/40">{g.students} студентов</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold gradient-text">{g.avg}</p>
                  <p className="text-xs text-white/40">средний балл</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-xl" style={{ background: '#39ff8218' }}>
                  <p className="text-lg font-bold text-emerald-400">{g.top}</p>
                  <p className="text-xs text-white/40">Отличников</p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: '#7c5cfc18' }}>
                  <p className="text-lg font-bold text-violet-400">{g.students - g.top - g.low}</p>
                  <p className="text-xs text-white/40">Хорошистов</p>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: '#f7253518' }}>
                  <p className="text-lg font-bold text-pink-400">{g.low}</p>
                  <p className="text-xs text-white/40">Отстающих</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin view */}
      {role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon name="PieChart" size={16} className="text-violet-400" />
              Распределение оценок
            </h2>
            <div className="flex flex-col gap-4">
              {adminOverview.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60">{item.label}</span>
                    <span className="font-semibold" style={{ color: item.color }}>{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Icon name="Trophy" size={16} className="text-yellow-400" />
              Лучшие факультеты
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Информационные технологии', avg: 4.4, color: '#7c5cfc' },
                { name: 'Математика', avg: 4.2, color: '#06d6f5' },
                { name: 'Физика', avg: 4.0, color: '#f72585' },
                { name: 'Гуманитарные науки', avg: 3.9, color: '#f7c325' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <span className="text-xl font-bold text-white/20">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{f.name}</p>
                    <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(f.avg / 5) * 100}%`, background: f.color }} />
                    </div>
                  </div>
                  <span className="font-bold text-sm" style={{ color: f.color }}>{f.avg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}