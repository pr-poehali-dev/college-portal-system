import { useState } from 'react';
import { Role } from '../App';
import Icon from '@/components/ui/icon';

interface Props { role: Role }

const chats = [
  { id: 1, name: 'Группа ИТ-21', lastMsg: 'Не забудьте сдать лабораторную до пятницы!', time: '09:41', unread: 2, avatar: '👥', online: true },
  { id: 2, name: 'Петров А.В. (Матан)', lastMsg: 'Пересдача возможна в понедельник', time: '08:15', unread: 1, avatar: '👨‍🏫', online: false },
  { id: 3, name: 'Студсовет', lastMsg: 'Собрание перенесли на 16:00', time: 'Вчера', unread: 0, avatar: '🏛️', online: true },
  { id: 4, name: 'Козлов Д.А. (Прогр.)', lastMsg: 'Посмотрел ваш код, есть замечания', time: 'Вчера', unread: 0, avatar: '💻', online: true },
  { id: 5, name: 'Деканат', lastMsg: 'Приглашаем на встречу 12 апреля', time: '07.04', unread: 0, avatar: '🏢', online: false },
];

const messages = [
  { id: 1, from: 'other', name: 'Петров А.В.', text: 'Добрый день! Напоминаю, что пересдача контрольной работы состоится в понедельник в 14:00.', time: '08:10' },
  { id: 2, from: 'me', text: 'Добрый день! Спасибо, я буду.', time: '08:12' },
  { id: 3, from: 'other', name: 'Петров А.В.', text: 'Отлично. Не забудьте взять зачётную книжку. Удачи!', time: '08:15' },
  { id: 4, from: 'me', text: 'Обязательно! До встречи.', time: '08:16' },
];

export default function ChatsPage({ role }: Props) {
  const [activeChat, setActiveChat] = useState(2);
  const [inputVal, setInputVal] = useState('');

  const active = chats.find(c => c.id === activeChat)!;

  return (
    <div className="flex h-full animate-fade-in">
      {/* Chat list */}
      <div className="w-72 shrink-0 flex flex-col border-r border-white/5"
        style={{ background: 'rgba(8,8,16,0.6)' }}>
        <div className="p-4 border-b border-white/5">
          <h1 className="text-lg font-bold text-white mb-3">Чаты</h1>
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white/5 border border-white/8 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
              placeholder="Поиск по чатам..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                activeChat === chat.id ? 'bg-violet-500/10 border-l-2 border-violet-500' : 'hover:bg-white/4 border-l-2 border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-lg">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{chat.name}</p>
                  <span className="text-xs text-white/30 shrink-0 ml-2">{chat.time}</span>
                </div>
                <p className="text-xs text-white/40 truncate">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <span className="badge-neon shrink-0">{chat.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5"
          style={{ background: 'rgba(8,8,16,0.4)' }}>
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-base">
            {active.avatar}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{active.name}</p>
            <p className="text-xs text-emerald-400">{active.online ? 'онлайн' : 'был(а) недавно'}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Icon name="Phone" size={15} />
            </button>
            <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Icon name="Video" size={15} />
            </button>
            <button className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Icon name="MoreHorizontal" size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          <div className="text-center mb-4">
            <span className="text-xs text-white/20 bg-white/5 px-3 py-1 rounded-full">Сегодня</span>
          </div>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${msg.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.from === 'other' && (
                  <span className="text-xs text-white/30 px-1">{msg.name}</span>
                )}
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={msg.from === 'me'
                    ? { background: 'linear-gradient(135deg, #7c5cfc, #5a3fd4)', color: 'white', borderBottomRightRadius: '4px' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: '4px' }
                  }
                >
                  {msg.text}
                </div>
                <span className="text-xs text-white/20 px-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2">
            <button className="text-white/30 hover:text-white/60 transition-colors">
              <Icon name="Paperclip" size={17} />
            </button>
            <input
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              placeholder="Написать сообщение..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <button className="text-white/30 hover:text-white/60 transition-colors">
              <Icon name="Smile" size={17} />
            </button>
            <button
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: inputVal ? 'linear-gradient(135deg, #7c5cfc, #06d6f5)' : 'rgba(255,255,255,0.08)' }}
              onClick={() => setInputVal('')}
            >
              <Icon name="Send" size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
