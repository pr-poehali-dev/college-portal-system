import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ChatsPage from './pages/Chats';
import SchedulePage from './pages/Schedule';
import GradesPage from './pages/Grades';
import FeedPage from './pages/Feed';
import NotificationsPage from './pages/Notifications';
import AdminPage from './pages/Admin';
import Icon from '@/components/ui/icon';

export type Role = 'student' | 'teacher' | 'admin';
export type Page = 'dashboard' | 'chats' | 'schedule' | 'grades' | 'feed' | 'notifications' | 'admin';

const NAV_ITEMS: { id: Page; label: string; icon: string; badge?: number; roles?: Role[] }[] = [
  { id: 'dashboard', label: 'Личный кабинет', icon: 'LayoutDashboard' },
  { id: 'chats', label: 'Чаты', icon: 'MessageSquare' },
  { id: 'schedule', label: 'Расписание', icon: 'CalendarDays' },
  { id: 'grades', label: 'Успеваемость', icon: 'TrendingUp' },
  { id: 'feed', label: 'Лента постов', icon: 'Rss' },
  { id: 'notifications', label: 'Уведомления', icon: 'Bell' },
  { id: 'admin', label: 'Управление', icon: 'Settings', roles: ['admin'] },
];

const ROLE_LABELS: Record<Role, string> = {
  student: 'Студент',
  teacher: 'Преподаватель',
  admin: 'Администратор',
};

const ROLE_EMOJI: Record<Role, string> = {
  student: '🎓',
  teacher: '📚',
  admin: '⚙️',
};

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center font-golos">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }} />
          <p className="text-white/40 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <TooltipProvider>
        <Toaster />
        <LoginPage onLogin={login} />
      </TooltipProvider>
    );
  }

  const role = user.role as Role;
  const visibleNav = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(role));

  const renderPage = () => {
    const props = { role, user };
    switch (page) {
      case 'dashboard': return <DashboardPage {...props} />;
      case 'chats': return <ChatsPage {...props} />;
      case 'schedule': return <SchedulePage {...props} />;
      case 'grades': return <GradesPage {...props} />;
      case 'feed': return <FeedPage {...props} />;
      case 'notifications': return <NotificationsPage {...props} />;
      case 'admin': return role === 'admin' ? <AdminPage user={user} /> : <DashboardPage {...props} />;
      default: return <DashboardPage {...props} />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex h-screen bg-mesh overflow-hidden font-golos">
        {/* Sidebar */}
        <aside
          className={`flex flex-col transition-all duration-300 ease-in-out shrink-0 ${sidebarOpen ? 'w-64' : 'w-16'}`}
          style={{ background: 'rgba(8,8,16,0.97)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
              <span className="text-white text-xs font-bold">E</span>
            </div>
            {sidebarOpen && <span className="font-bold text-white tracking-wide text-lg gradient-text">EduSpace</span>}
            <button className="ml-auto text-white/30 hover:text-white/70 transition-colors" onClick={() => setSidebarOpen(v => !v)}>
              <Icon name={sidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
            {visibleNav.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  page === item.id ? 'text-white font-semibold nav-active' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} size={17} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="avatar-glow shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">
                  {ROLE_EMOJI[role]}
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-white/40">{ROLE_LABELS[role]}</p>
                </div>
              )}
              {sidebarOpen && (
                <button onClick={logout} className="text-white/30 hover:text-white/70 transition-colors shrink-0" title="Выйти">
                  <Icon name="LogOut" size={15} />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </TooltipProvider>
  );
}
