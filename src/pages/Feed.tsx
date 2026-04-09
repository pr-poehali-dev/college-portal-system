import { useState } from 'react';
import { Role } from '../App';
import Icon from '@/components/ui/icon';

interface Props { role: Role }

const posts = [
  {
    id: 1,
    author: 'Деканат ИТ',
    avatar: '🏛️',
    role: 'Официальное объявление',
    time: '2 ч назад',
    text: 'Уважаемые студенты! Напоминаем о переносе сессии на 20 мая. Расписание экзаменов опубликовано на сайте. Удачи на сессии!',
    tag: 'Объявление',
    tagColor: '#06d6f5',
    likes: 47,
    comments: 12,
    pinned: true,
  },
  {
    id: 2,
    author: 'Козлов Д.А.',
    avatar: '💻',
    role: 'Преподаватель · Программирование',
    time: '5 ч назад',
    text: 'Опубликовал новое задание по алгоритмам. Срок сдачи — 15 апреля. Задание включает реализацию алгоритма Дейкстры на Python. Все вопросы — в чат группы.',
    tag: 'Задание',
    tagColor: '#f72585',
    likes: 23,
    comments: 8,
    pinned: false,
  },
  {
    id: 3,
    author: 'Студсовет',
    avatar: '🎉',
    role: 'Студенческий совет',
    time: 'Вчера',
    text: '📣 Приглашаем всех на День открытых дверей! 12 апреля в 12:00 в актовом зале. Будут интересные спикеры, мастер-классы и розыгрыш призов.',
    tag: 'Мероприятие',
    tagColor: '#39ff82',
    likes: 89,
    comments: 31,
    pinned: false,
  },
  {
    id: 4,
    author: 'Петров А.В.',
    avatar: '📐',
    role: 'Преподаватель · Высшая математика',
    time: '2 дня назад',
    text: 'Результаты контрольной работы №3 опубликованы в системе. Средний балл по группе ИТ-21 — 4.1. Молодцы! Пересдача для желающих — в понедельник.',
    tag: 'Оценки',
    tagColor: '#7c5cfc',
    likes: 34,
    comments: 15,
    pinned: false,
  },
];

export default function FeedPage({ role }: Props) {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'announce', label: 'Объявления' },
    { id: 'tasks', label: 'Задания' },
    { id: 'events', label: 'Мероприятия' },
  ];

  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Лента</h1>
          <p className="text-white/40 text-sm">Новости и объявления</p>
        </div>
        {(role === 'teacher' || role === 'admin') && (
          <button
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}
          >
            <Icon name="Plus" size={15} />
            Новый пост
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 text-sm px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              filter === f.id ? 'text-white' : 'text-white/40 hover:text-white/70 bg-white/5'
            }`}
            style={filter === f.id ? {
              background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(6,214,245,0.15))',
              border: '1px solid rgba(124,92,252,0.3)'
            } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-4 stagger">
        {posts.map((post, i) => (
          <div key={post.id} className="glass glass-hover rounded-2xl p-5 animate-fade-in">
            {post.pinned && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 mb-3">
                <Icon name="Pin" size={11} />
                Закреплено
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-lg">
                {post.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{post.author}</p>
                <p className="text-xs text-white/40">{post.role} · {post.time}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: `${post.tagColor}22`, color: post.tagColor }}>
                {post.tag}
              </span>
            </div>

            {/* Text */}
            <p className="text-sm text-white/80 leading-relaxed mb-4">{post.text}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-white/5">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1.5 text-sm transition-all"
                style={{ color: liked.has(post.id) ? '#f72585' : 'rgba(255,255,255,0.35)' }}
              >
                <Icon name={liked.has(post.id) ? 'Heart' : 'Heart'} size={15} />
                {post.likes + (liked.has(post.id) ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors">
                <Icon name="MessageCircle" size={15} />
                {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors ml-auto">
                <Icon name="Share2" size={15} />
                Поделиться
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
