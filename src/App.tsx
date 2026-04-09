import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from './pages/Dashboard';
import ChatsPage from './pages/Chats';
import SchedulePage from './pages/Schedule';
import GradesPage from './pages/Grades';
import FeedPage from './pages/Feed';
import NotificationsPage from './pages/Notifications';
import Icon from '@/components/ui/icon';

export type Role = 'student' | 'teacher' | 'admin';
export type Page = 'dashboard' | 'chats' | 'schedule' | 'grades' | 'feed' | 'notifications';

const ROLES: { id: Role; label: string; emoji: string }[] = [
  { id: 'student', label: 'Студент', emoji: '🎓' },
  { id: 'teacher', label: 'Преподаватель', emoji: '📚' },
  { id: 'admin', label: 'Администратор', emoji: '⚙️' },
];

const NAV_ITEMS: { id: Page; label: string; icon: string; badge?: number }[] = [
  { id: 'dashboard', label: 'Личный кабинет', icon: 'LayoutDashboard' },
  { id: 'chats', label: 'Чаты', icon: 'MessageSquare', badge: 3 },
  { id: 'schedule', label: 'Расписание', icon: 'CalendarDays' },
  { id: 'grades', label: 'Успеваемость', icon: 'TrendingUp' },
  { id: 'feed', label: 'Лента постов', icon: 'Rss' },
  { id: 'notifications', label: 'Уведомления', icon: 'Bell', badge: 5 },
];

export default function App() {
  const [role, setRole] = useState<Role>('student');
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentRole = ROLES.find(r => r.id === role)!;

  const renderPage = () => {
    const props = { role };
    switch (page) {
      case 'dashboard': return <DashboardPage {...props} />;
      case 'chats': return <ChatsPage {...props} />;
      case 'schedule': return <SchedulePage {...props} />;
      case 'grades': return <GradesPage {...props} />;
      case 'feed': return <FeedPage {...props} />;
      case 'notifications': return <NotificationsPage {...props} />;
      default: return <DashboardPage {...props} />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex h-screen bg-mesh overflow-hidden font-golos">
        {/* Sidebar */}
        <aside
          className={`flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
          style={{ background: 'rgba(8,8,16,0.97)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
            <div
              className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-white tracking-wide text-lg gradient-text">EduSpace</span>
            )}
            <button
              className="ml-auto text-white/30 hover:text-white/70 transition-colors"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <Icon name={sidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={16} />
            </button>
          </div>

          {/* Role switcher */}
          {sidebarOpen && (
            <div className="px-3 py-3 border-b border-white/5">
              <p className="text-[10px] text-white/30 px-1 mb-2 uppercase tracking-widest">Роль</p>
              <div className="flex flex-col gap-1">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                      role === r.id
                        ? 'text-white font-semibold'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                    style={role === r.id ? {
                      background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(6,214,245,0.08))',
                      border: '1px solid rgba(124,92,252,0.25)'
                    } : {}}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.label}</span>
                    {role === r.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  page === item.id
                    ? 'text-white font-semibold nav-active'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <Icon name={item.icon} size={17} />
                {sidebarOpen && <span>{item.label}</span>}
                {item.badge && sidebarOpen && (
                  <span className="ml-auto badge-neon">{item.badge}</span>
                )}
                {item.badge && !sidebarOpen && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500"></span>
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="avatar-glow shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-sm">{currentRole.emoji}</span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {role === 'student' ? 'Алексей Иванов' : role === 'teacher' ? 'Марина Петрова' : 'Администратор'}
                  </p>
                  <p className="text-xs text-white/40 truncate">{currentRole.label}</p>
                </div>
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
