import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AuthUser } from '@/hooks/useAuth';
import Icon from '@/components/ui/icon';

interface Props { user: AuthUser }

interface UserItem { id: number; login: string; full_name: string; role: string; group_id: number | null; group_name: string | null }
interface GroupItem { id: number; name: string; year: number }

const ROLE_LABELS: Record<string, string> = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };
const ROLE_COLORS: Record<string, string> = { student: '#7c5cfc', teacher: '#06d6f5', admin: '#f72585' };

export default function AdminPage({ user }: Props) {
  const [tab, setTab] = useState<'users' | 'groups' | 'chats'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [showUserForm, setShowUserForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showChatForm, setShowChatForm] = useState(false);

  const [userForm, setUserForm] = useState({ login: '', password: '', full_name: '', role: 'student', group_id: '' });
  const [groupForm, setGroupForm] = useState({ name: '', year: '1' });
  const [chatForm, setChatForm] = useState({ name: '', member_ids: [] as number[] });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadUsers();
    loadGroups();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await api.getUsers();
    if (data.users) setUsers(data.users);
    setLoading(false);
  };

  const loadGroups = async () => {
    const data = await api.getGroups();
    if (data.groups) setGroups(data.groups);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    const data = await api.createUser({
      login: userForm.login,
      password: userForm.password,
      full_name: userForm.full_name,
      role: userForm.role,
      group_id: userForm.group_id ? parseInt(userForm.group_id) : null,
    });
    if (data.error) { setFormError(data.error); return; }
    setFormSuccess('Пользователь создан!');
    setUserForm({ login: '', password: '', full_name: '', role: 'student', group_id: '' });
    setShowUserForm(false);
    loadUsers();
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    const data = await api.createGroup(groupForm.name, parseInt(groupForm.year));
    if (data.error) { setFormError(data.error); return; }
    setFormSuccess('Группа создана!');
    setGroupForm({ name: '', year: '1' });
    setShowGroupForm(false);
    loadGroups();
  };

  const createChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    const data = await api.createChat(chatForm.name, chatForm.member_ids);
    if (data.error) { setFormError(data.error); return; }
    setFormSuccess('Чат создан!');
    setChatForm({ name: '', member_ids: [] });
    setShowChatForm(false);
  };

  const toggleChatMember = (id: number) => {
    setChatForm(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(id)
        ? prev.member_ids.filter(m => m !== id)
        : [...prev.member_ids, id],
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Управление</h1>
        <p className="text-white/40 text-sm">Администрирование пользователей, групп и чатов</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['users', 'groups', 'chats'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-xl transition-all font-medium ${tab === t ? 'text-white' : 'text-white/40 hover:text-white/70 bg-white/5'}`}
            style={tab === t ? { background: 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(6,214,245,0.15))', border: '1px solid rgba(124,92,252,0.3)' } : {}}>
            {t === 'users' ? 'Пользователи' : t === 'groups' ? 'Группы' : 'Чаты'}
          </button>
        ))}
      </div>

      {/* Success/Error */}
      {formSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-emerald-300 mb-4"
          style={{ background: 'rgba(57,255,130,0.1)', border: '1px solid rgba(57,255,130,0.2)' }}>
          <Icon name="CheckCircle" size={14} />
          {formSuccess}
        </div>
      )}
      {formError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-pink-300 mb-4"
          style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.2)' }}>
          <Icon name="AlertCircle" size={14} />
          {formError}
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/40 text-sm">{users.length} пользователей</p>
            <button onClick={() => { setShowUserForm(v => !v); setFormError(''); setFormSuccess(''); }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <Icon name={showUserForm ? 'X' : 'Plus'} size={15} />
              {showUserForm ? 'Отмена' : 'Добавить пользователя'}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={createUser} className="glass rounded-2xl p-5 mb-4 animate-fade-in">
              <h3 className="text-white font-semibold mb-4">Новый пользователь</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">ФИО</label>
                  <input className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                    placeholder="Иванов Иван Иванович" required value={userForm.full_name} onChange={e => setUserForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Логин</label>
                  <input className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                    placeholder="ivanov_i" required value={userForm.login} onChange={e => setUserForm(p => ({ ...p, login: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Пароль</label>
                  <input className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                    placeholder="Пароль" required value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Роль</label>
                  <select className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                    value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="student">Студент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                {userForm.role === 'student' && (
                  <div className="col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Группа</label>
                    <select className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                      value={userForm.group_id} onChange={e => setUserForm(p => ({ ...p, group_id: e.target.value }))}>
                      <option value="">Без группы</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
                Создать
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2 stagger">
            {loading ? (
              <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm">Загрузка...</div>
            ) : users.map(u => (
              <div key={u.id} className="glass glass-hover rounded-2xl p-4 flex items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role] }}>
                  {u.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.full_name}</p>
                  <p className="text-xs text-white/40">@{u.login}{u.group_name ? ` · ${u.group_name}` : ''}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium shrink-0"
                  style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role] }}>
                  {ROLE_LABELS[u.role]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GROUPS TAB */}
      {tab === 'groups' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/40 text-sm">{groups.length} групп</p>
            <button onClick={() => { setShowGroupForm(v => !v); setFormError(''); setFormSuccess(''); }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <Icon name={showGroupForm ? 'X' : 'Plus'} size={15} />
              {showGroupForm ? 'Отмена' : 'Добавить группу'}
            </button>
          </div>

          {showGroupForm && (
            <form onSubmit={createGroup} className="glass rounded-2xl p-5 mb-4 animate-fade-in">
              <h3 className="text-white font-semibold mb-4">Новая группа</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Название группы</label>
                  <input className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                    placeholder="ИТ-21" required value={groupForm.name} onChange={e => setGroupForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Курс</label>
                  <input type="number" min="1" max="6" className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                    placeholder="1" value={groupForm.year} onChange={e => setGroupForm(p => ({ ...p, year: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
                Создать
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 stagger">
            {groups.length === 0 && !loading && (
              <div className="col-span-3 glass rounded-2xl p-8 text-center">
                <span className="text-3xl block mb-2">🏛️</span>
                <p className="text-white font-medium">Групп пока нет</p>
                <p className="text-white/40 text-sm">Создайте первую группу</p>
              </div>
            )}
            {groups.map(g => (
              <div key={g.id} className="glass glass-hover rounded-2xl p-4 animate-fade-in">
                <p className="text-lg font-bold gradient-text mb-1">{g.name}</p>
                <p className="text-xs text-white/40">{g.year} курс</p>
                <p className="text-xs text-white/30 mt-2">
                  {users.filter(u => u.group_id === g.id).length} студентов
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHATS TAB */}
      {tab === 'chats' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/40 text-sm">Создание чатов и добавление участников</p>
            <button onClick={() => { setShowChatForm(v => !v); setFormError(''); setFormSuccess(''); setChatForm({ name: '', member_ids: [] }); }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <Icon name={showChatForm ? 'X' : 'Plus'} size={15} />
              {showChatForm ? 'Отмена' : 'Создать чат'}
            </button>
          </div>

          {showChatForm && (
            <form onSubmit={createChat} className="glass rounded-2xl p-5 animate-fade-in">
              <h3 className="text-white font-semibold mb-4">Новый чат</h3>
              <div className="mb-3">
                <label className="text-xs text-white/40 mb-1 block">Название чата</label>
                <input className="w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                  placeholder="Группа ИТ-21" required value={chatForm.name} onChange={e => setChatForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Участники ({chatForm.member_ids.length} выбрано)</label>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {users.filter(u => u.id !== user.id).map(u => (
                    <label key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                      <input type="checkbox" className="w-4 h-4 accent-violet-500"
                        checked={chatForm.member_ids.includes(u.id)}
                        onChange={() => toggleChatMember(u.id)} />
                      <span className="text-sm text-white">{u.full_name}</span>
                      <span className="text-xs text-white/30 ml-auto">{ROLE_LABELS[u.role]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
                Создать чат
              </button>
            </form>
          )}

          {!showChatForm && (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-white font-medium">Управление чатами</p>
              <p className="text-white/40 text-sm mt-1">Нажмите «Создать чат», чтобы добавить новый чат и выбрать участников</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
