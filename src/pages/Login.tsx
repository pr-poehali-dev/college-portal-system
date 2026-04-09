import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  onLogin: (login: string, password: string) => Promise<string | null>;
}

export default function LoginPage({ onLogin }: Props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await onLogin(login, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 font-golos">
      {/* BG decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #7c5cfc, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #06d6f5, transparent)', animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-6 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #f72585, transparent)', animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}>
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1">EduSpace</h1>
          <p className="text-white/40 text-sm">Образовательная платформа</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8"
          style={{ border: '1px solid rgba(124,92,252,0.2)' }}>
          <h2 className="text-xl font-bold text-white mb-2">Добро пожаловать</h2>
          <p className="text-white/40 text-sm mb-6">Войдите с вашим логином и паролем</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Login */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wider">Логин</label>
              <div className="relative">
                <Icon name="User" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="Введите логин"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,92,252,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,92,252,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wider">Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,92,252,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,92,252,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-pink-300"
                style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.2)' }}>
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #7c5cfc, #06d6f5)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Входим...
                </span>
              ) : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Логин и пароль выдаёт администратор
        </p>
      </div>
    </div>
  );
}
