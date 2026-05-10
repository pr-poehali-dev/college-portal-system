import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AuthUser } from '@/hooks/useAuth';
import Icon from '@/components/ui/icon';

interface Props { user: AuthUser }

interface UserItem {
  id: number; login: string; full_name: string;
  role: string; group_id: number | null; group_name: string | null
}
interface GroupItem { id: number; name: string; year: number }

const ROLE_LABELS: Record<string, string> = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };
const ROLE_COLORS: Record<string, string> = { student: '#7c5cfc', teacher: '#06d6f5', admin: '#f72585' };

const INPUT = 'w-full px-3 py-2 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50';
const SELECT = 'w-full px-3 py-2 rounded-xl text-sm text-white bg-[#12121e] border border-white/10 focus:outline-none focus:border-violet-500/50';

export default function AdminPage({ user }: Props) {
  const [tab, setTab] = useState<'users' | 'groups' | 'chats'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);

  // create user form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ login: '', password: '', full_name: '', role: 'student', group_id: '' });

  // edit user modal
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', role: 'student', group_id: '', password: '' });

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  // group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', year: '1' });

  // chat form
  const [showChatForm, setShowChatForm] = useState(false);
  const [chatForm, setChatForm] = useState({ name: '', member_ids: [] as number[] });

  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => { loadUsers(); loadGroups(); }, []);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3000);
  };

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

  // CREATE USER
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await api.createUser({
      login: createForm.login, password: createForm.password,
      full_name: createForm.full_name, role: createForm.role,
      group_id: createForm.group_id ? parseInt(createForm.group_id) : null,
    });
    if (data.error) { showNotice('err', data.error); return; }
    showNotice('ok', 'Пользователь создан');
    setCreateForm({ login: '', password: '', full_name: '', role: 'student', group_id: '' });
    setShowCreateForm(false);
    loadUsers();
  };

  // OPEN EDIT MODAL
  const openEdit = (u: UserItem) => {
    setEditUser(u);
    setEditForm({ full_name: u.full_name, role: u.role, group_id: u.group_id ? String(u.group_id) : '', password: '' });
  };

  // SAVE EDIT
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    const data = await api.updateUser({
      id: editUser.id,
      full_name: editForm.full_name,
      role: editForm.role,
      group_id: editForm.group_id ? parseInt(editForm.group_id) : null,
      password: editForm.password || undefined,
    });
    if (data.error) { showNotice('err', data.error); return; }
    showNotice('ok', 'Изменения сохранены');
    setEditUser(null);
    loadUsers();
  };

  // CONFIRM DELETE
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const data = await api.deleteUser(deleteTarget.id);
    if (data.error) { showNotice('err', data.error); setDeleteTarget(null); return; }
    showNotice('ok', 'Пользователь удалён');
    setDeleteTarget(null);
    loadUsers();
  };

  // GROUP CREATE
  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await api.createGroup(groupForm.name, parseInt(groupForm.year));
    if (data.error) { showNotice('err', data.error); return; }
    showNotice('ok', 'Группа создана');
    setGroupForm({ name: '', year: '1' });
    setShowGroupForm(false);
    loadGroups();
  };

  // CHAT CREATE
  const createChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await api.createChat(chatForm.name, chatForm.member_ids);
    if (data.error) { showNotice('err', data.error); return; }
    showNotice('ok', 'Чат создан');
    setChatForm({ name: '', member_ids: [] });
    setShowChatForm(false);
  };

  const toggleChatMember = (id: number) =>
    setChatForm(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(id)
        ? prev.member_ids.filter(m => m !== id)
        : [...prev.member_ids, id],
    }));

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
            {t === 'users' ? `Пользователи${users.length ? ` (${users.length})` : ''}` : t === 'groups' ? 'Группы' : 'Чаты'}
          </button>
        ))}
      </div>

      {/* Toast */}
      {notice && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4 animate-fade-in ${notice.type === 'ok' ? 'text-emerald-300' : 'text-pink-300'}`}
          style={{ background: notice.type === 'ok' ? 'rgba(57,255,130,0.1)' : 'rgba(247,37,133,0.1)', border: `1px solid ${notice.type === 'ok' ? 'rgba(57,255,130,0.2)' : 'rgba(247,37,133,0.2)'}` }}>
          <Icon name={notice.type === 'ok' ? 'CheckCircle' : 'AlertCircle'} size={14} />
          {notice.text}
        </div>
      )}

      {/* ─── USERS TAB ─── */}
      {tab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/40 text-sm">{users.length} пользователей в системе</p>
            <button onClick={() => setShowCreateForm(v => !v)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <Icon name={showCreateForm ? 'X' : 'UserPlus'} size={15} />
              {showCreateForm ? 'Отмена' : 'Добавить'}
            </button>
          </div>

          {/* Create form */}
          {showCreateForm && (
            <form onSubmit={createUser} className="glass rounded-2xl p-5 mb-4 animate-fade-in" style={{ border: '1px solid rgba(124,92,252,0.2)' }}>
              <h3 className="text-white font-semibold mb-4">Новый пользователь</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">ФИО</label>
                  <input className={INPUT} placeholder="Иванов Иван Иванович" required
                    value={createForm.full_name} onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Логин</label>
                  <input className={INPUT} placeholder="ivanov_i" required
                    value={createForm.login} onChange={e => setCreateForm(p => ({ ...p, login: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Пароль</label>
                  <input className={INPUT} placeholder="Пароль" required
                    value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Роль</label>
                  <select className={SELECT} value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="student">Студент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                {createForm.role === 'student' && (
                  <div className="col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Группа</label>
                    <select className={SELECT} value={createForm.group_id} onChange={e => setCreateForm(p => ({ ...p, group_id: e.target.value }))}>
                      <option value="">Без группы</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
                Создать пользователя
              </button>
            </form>
          )}

          {/* Users list */}
          <div className="flex flex-col gap-2">
            {loading && <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm">Загрузка...</div>}
            {!loading && users.map(u => (
              <div key={u.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role] }}>
                  {u.full_name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.full_name}</p>
                  <p className="text-xs text-white/40">@{u.login}{u.group_name ? ` · ${u.group_name}` : ''}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 hidden sm:block"
                  style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role] }}>
                  {ROLE_LABELS[u.role]}
                </span>

                {/* Actions — показываются при hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(u)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                    title="Редактировать">
                    <Icon name="Pencil" size={14} />
                  </button>
                  {u.id !== user.id && (
                    <button onClick={() => setDeleteTarget(u)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-pink-400 hover:bg-pink-400/10 transition-all"
                      title="Удалить">
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── GROUPS TAB ─── */}
      {tab === 'groups' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/40 text-sm">{groups.length} групп</p>
            <button onClick={() => setShowGroupForm(v => !v)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <Icon name={showGroupForm ? 'X' : 'Plus'} size={15} />
              {showGroupForm ? 'Отмена' : 'Добавить группу'}
            </button>
          </div>
          {showGroupForm && (
            <form onSubmit={createGroup} className="glass rounded-2xl p-5 mb-4 animate-fade-in" style={{ border: '1px solid rgba(124,92,252,0.2)' }}>
              <h3 className="text-white font-semibold mb-4">Новая группа</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Название</label>
                  <input className={INPUT} placeholder="ИТ-21" required value={groupForm.name} onChange={e => setGroupForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Курс</label>
                  <input type="number" min="1" max="6" className={INPUT} value={groupForm.year} onChange={e => setGroupForm(p => ({ ...p, year: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>Создать</button>
            </form>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.length === 0 && !loading && (
              <div className="col-span-3 glass rounded-2xl p-8 text-center">
                <span className="text-3xl block mb-2">🏛️</span>
                <p className="text-white font-medium">Групп пока нет</p>
              </div>
            )}
            {groups.map(g => (
              <div key={g.id} className="glass glass-hover rounded-2xl p-4">
                <p className="text-lg font-bold gradient-text mb-1">{g.name}</p>
                <p className="text-xs text-white/40">{g.year} курс</p>
                <p className="text-xs text-white/30 mt-2">{users.filter(u => u.group_id === g.id).length} студентов</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CHATS TAB ─── */}
      {tab === 'chats' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/40 text-sm">Создание чатов и добавление участников</p>
            <button onClick={() => { setShowChatForm(v => !v); setChatForm({ name: '', member_ids: [] }); }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <Icon name={showChatForm ? 'X' : 'Plus'} size={15} />
              {showChatForm ? 'Отмена' : 'Создать чат'}
            </button>
          </div>
          {showChatForm ? (
            <form onSubmit={createChat} className="glass rounded-2xl p-5 animate-fade-in" style={{ border: '1px solid rgba(124,92,252,0.2)' }}>
              <h3 className="text-white font-semibold mb-4">Новый чат</h3>
              <div className="mb-3">
                <label className="text-xs text-white/40 mb-1 block">Название чата</label>
                <input className={INPUT} placeholder="Группа ИТ-21" required value={chatForm.name} onChange={e => setChatForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Участники ({chatForm.member_ids.length} выбрано)</label>
                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {users.filter(u => u.id !== user.id).map(u => (
                    <label key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                      <input type="checkbox" className="w-4 h-4 accent-violet-500"
                        checked={chatForm.member_ids.includes(u.id)} onChange={() => toggleChatMember(u.id)} />
                      <span className="text-sm text-white">{u.full_name}</span>
                      <span className="text-xs text-white/30 ml-auto">{ROLE_LABELS[u.role]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>Создать чат</button>
            </form>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-white font-medium">Управление чатами</p>
              <p className="text-white/40 text-sm mt-1">Нажмите «Создать чат», чтобы добавить новый чат</p>
            </div>
          )}
        </div>
      )}

      {/* ─── EDIT MODAL ─── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md glass rounded-3xl p-6 animate-fade-in" style={{ border: '1px solid rgba(124,92,252,0.3)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Редактировать пользователя</h2>
              <button onClick={() => setEditUser(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                <Icon name="X" size={15} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: `${ROLE_COLORS[editUser.role]}22`, color: ROLE_COLORS[editUser.role] }}>
                {editUser.full_name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{editUser.full_name}</p>
                <p className="text-xs text-white/40">@{editUser.login}</p>
              </div>
            </div>

            <form onSubmit={saveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">ФИО</label>
                <input className={INPUT} required value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Роль</label>
                <select className={SELECT} value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="student">Студент</option>
                  <option value="teacher">Преподаватель</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              {editForm.role === 'student' && (
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Группа</label>
                  <select className={SELECT} value={editForm.group_id} onChange={e => setEditForm(p => ({ ...p, group_id: e.target.value }))}>
                    <option value="">Без группы</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-white/40 mb-1 block">Новый пароль <span className="text-white/20">(оставьте пустым, чтобы не менять)</span></label>
                <input className={INPUT} type="password" placeholder="••••••••"
                  value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 hover:bg-white/10 transition-colors">
                  Отмена
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm glass rounded-3xl p-6 animate-fade-in" style={{ border: '1px solid rgba(247,37,133,0.3)' }}>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-4"
              style={{ background: 'rgba(247,37,133,0.15)' }}>
              <Icon name="Trash2" size={20} className="text-pink-400" />
            </div>
            <h2 className="text-lg font-bold text-white text-center mb-1">Удалить пользователя?</h2>
            <p className="text-white/50 text-sm text-center mb-5">
              <span className="text-white font-medium">{deleteTarget.full_name}</span> будет деактивирован и потеряет доступ к системе.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 hover:bg-white/10 transition-colors">
                Отмена
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f72585, #c2185b)' }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
