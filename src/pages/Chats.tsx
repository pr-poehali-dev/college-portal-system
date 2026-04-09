import { useState, useEffect, useRef } from 'react';
import { Role } from '../App';
import { AuthUser } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface Props { role: Role; user: AuthUser }

interface Chat { id: number; name: string; last_msg: string | null; last_time: string | null }
interface Message { id: number; text: string; created_at: string; user_id: number; user_name: string }

function formatTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ru', { day: '2-digit', month: '2-digit' });
}

export default function ChatsPage({ role, user }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(activeChat), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    setLoading(true);
    const data = await api.getChats();
    if (data.chats) setChats(data.chats);
    setLoading(false);
  };

  const loadMessages = async (chatId: number) => {
    setMsgLoading(true);
    const data = await api.getMessages(chatId);
    if (data.messages) setMessages(data.messages);
    setMsgLoading(false);
  };

  const sendMessage = async () => {
    if (!inputVal.trim() || !activeChat) return;
    const text = inputVal.trim();
    setInputVal('');
    await api.sendMessage(activeChat, text);
    loadMessages(activeChat);
    loadChats();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const canCall = role === 'teacher' || role === 'admin';
  const activeC = chats.find(c => c.id === activeChat);
  const filtered = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-full animate-fade-in">
      {/* Chat list */}
      <div className="w-72 shrink-0 flex flex-col border-r border-white/5" style={{ background: 'rgba(8,8,16,0.6)' }}>
        <div className="p-4 border-b border-white/5">
          <h1 className="text-lg font-bold text-white mb-3">Чаты</h1>
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white/5 border border-white/8 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
              placeholder="Поиск по чатам..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loading && (
            <div className="p-6 text-center text-white/30 text-sm">Загрузка...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-center">
              <span className="text-3xl block mb-2">💬</span>
              <p className="text-white/40 text-sm">
                {chats.length === 0 ? 'Вас пока не добавили в чаты' : 'Ничего не найдено'}
              </p>
            </div>
          )}
          {filtered.map(chat => (
            <button key={chat.id} onClick={() => setActiveChat(chat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-l-2 ${activeChat === chat.id ? 'bg-violet-500/10 border-violet-500' : 'hover:bg-white/4 border-transparent'}`}>
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-base shrink-0">
                {chat.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{chat.name}</p>
                  {chat.last_time && <span className="text-xs text-white/30 shrink-0 ml-2">{formatTime(chat.last_time)}</span>}
                </div>
                <p className="text-xs text-white/40 truncate">{chat.last_msg || 'Нет сообщений'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      {activeChat && activeC ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5" style={{ background: 'rgba(8,8,16,0.4)' }}>
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
              {activeC.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{activeC.name}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Звонок — только teacher/admin */}
              {canCall && (
                <button
                  onClick={() => setCallActive(v => !v)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${callActive ? 'text-pink-300' : 'text-emerald-300'}`}
                  style={{ background: callActive ? 'rgba(247,37,133,0.15)' : 'rgba(57,255,130,0.12)' }}
                >
                  <Icon name={callActive ? 'PhoneOff' : 'Phone'} size={13} />
                  {callActive ? 'Завершить звонок' : 'Начать звонок'}
                </button>
              )}
            </div>
          </div>

          {/* Call banner */}
          {callActive && (
            <div className="px-6 py-3 flex items-center gap-3 text-sm animate-fade-in"
              style={{ background: 'linear-gradient(135deg, rgba(57,255,130,0.1), rgba(6,214,245,0.08))', borderBottom: '1px solid rgba(57,255,130,0.15)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-emerald-300 font-medium">Звонок активен</span>
              <span className="text-white/40 text-xs">· Только {role === 'teacher' ? 'преподаватель' : 'администратор'} может начинать звонки</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
            {msgLoading && messages.length === 0 && (
              <div className="text-center text-white/30 text-sm py-8">Загрузка сообщений...</div>
            )}
            {messages.length === 0 && !msgLoading && (
              <div className="text-center text-white/30 text-sm py-8">Сообщений пока нет. Напишите первым!</div>
            )}
            {messages.map(msg => {
              const isMe = msg.user_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-xs text-white/30 px-1">{msg.user_name}</span>}
                    <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={isMe
                        ? { background: 'linear-gradient(135deg, #7c5cfc, #5a3fd4)', color: 'white', borderBottomRightRadius: '4px' }
                        : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: '4px' }
                      }>
                      {msg.text}
                    </div>
                    <span className="text-xs text-white/20 px-1">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 glass rounded-2xl px-4 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
                placeholder="Написать сообщение..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: inputVal.trim() ? 'linear-gradient(135deg, #7c5cfc, #06d6f5)' : 'rgba(255,255,255,0.08)' }}
                onClick={sendMessage}
              >
                <Icon name="Send" size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <Icon name="MessageSquare" size={28} className="text-white/20" />
          </div>
          <p className="text-white/40">Выберите чат для общения</p>
          {role === 'student' && <p className="text-white/20 text-xs">Чаты создаёт администратор</p>}
        </div>
      )}
    </div>
  );
}
