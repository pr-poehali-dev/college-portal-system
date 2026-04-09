import { useState } from 'react';
import { Role } from '../App';
import Icon from '@/components/ui/icon';

interface Props { role: Role }

type NotifType = 'grade' | 'task' | 'message' | 'event' | 'system';

interface Notif {
  id: number;
  type: NotifType;
  title: string;
  text: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
}

const notifications: Notif[] = [
  { id: 1, type: 'grade', title: 'Новая оценка', text: 'Петров А.В. поставил 5 за контрольную по математике', time: '10 мин', read: false, icon: 'Star', color: '#39ff82' },
  { id: 2, type: 'task', title: 'Новое задание', text: 'Козлов Д.А. опубликовал задание «Алгоритм Дейкстры» · срок 15.04', time: '1 ч', read: false, icon: 'ClipboardList', color: '#f72585' },
  { id: 3, type: 'message', title: 'Новое сообщение', text: 'Петров А.В.: «Пересдача возможна в понедельник»', time: '2 ч', read: false, icon: 'MessageSquare', color: '#7c5cfc' },
  { id: 4, type: 'event', title: 'Напоминание о событии', text: 'Вебинар «Введение в машинное обучение» начнётся через 30 минут', time: '3 ч', read: true, icon: 'CalendarCheck', color: '#06d6f5' },
  { id: 5, type: 'task', title: 'Срок сдачи истекает', text: 'Домашнее задание по физике нужно сдать до завтра 23:59', time: '5 ч', read: true, icon: 'AlertCircle', color: '#f7c325' },
  { id: 6, type: 'system', title: 'Обновление расписания', text: 'Лекция по истории в пятницу перенесена с 10:20 на 12:00', time: 'Вчера', read: true, icon: 'RefreshCw', color: '#06d6f5' },
  { id: 7, type: 'grade', title: 'Оценка за лабораторную', text: 'Смирнова Е.И. проверила лаб. работу №4: оценка 4', time: 'Вчера', read: true, icon: 'FileCheck', color: '#39ff82' },
];

const typeLabels: Record<NotifType, string> = {
  grade: 'Оценки',
  task: 'Задания',
  message: 'Сообщения',
  event: 'События',
  system: 'Система',
};

export default function NotificationsPage({ role }: Props) {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<NotifType | 'all'>('all');

  const unread = items.filter(n => !n.read).length;
  const filtered = filter === 'all' ? items : items.filter(n => n.type === filter);

  const markAll = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const markOne = (id: number) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            Уведомления
            {unread > 0 && <span className="badge-neon text-sm">{unread}</span>}
          </h1>
          <p className="text-white/40 text-sm">{unread > 0 ? `${unread} непрочитанных` : 'Всё прочитано'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5">
            <Icon name="CheckCheck" size={15} />
            Прочитать все
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['all', 'grade', 'task', 'message', 'event', 'system'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`shrink-0 text-sm px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              filter === t ? 'text-white' : 'text-white/40 hover:text-white/70 bg-white/5'
            }`}
            style={filter === t ? {
              background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(6,214,245,0.15))',
              border: '1px solid rgba(124,92,252,0.3)'
            } : {}}
          >
            {t === 'all' ? 'Все' : typeLabels[t]}
          </button>
        ))}
      </div>

      {/* Unread section */}
      {filter === 'all' && unread > 0 && (
        <p className="text-xs text-white/30 uppercase tracking-widest mb-3 px-1">Новые</p>
      )}

      <div className="flex flex-col gap-2 stagger">
        {filtered.map((notif, i) => (
          <div
            key={notif.id}
            onClick={() => markOne(notif.id)}
            className={`animate-fade-in flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 glass-hover border ${
              !notif.read
                ? 'border-violet-500/20 bg-violet-500/5'
                : 'border-transparent glass'
            }`}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${notif.color}22`, border: `1px solid ${notif.color}44` }}
            >
              <Icon name={notif.icon} size={17} style={{ color: notif.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className={`text-sm font-semibold ${notif.read ? 'text-white/70' : 'text-white'}`}>
                  {notif.title}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/30">{notif.time} назад</span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0"></span>
                  )}
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{notif.text}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <span className="text-4xl mb-3 block">🔔</span>
            <p className="text-white font-semibold">Нет уведомлений</p>
            <p className="text-white/40 text-sm mt-1">В этой категории пока ничего нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
