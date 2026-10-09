// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSessionData } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      setSessionData(data.session);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Revisa tu correo y contraseña e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-2 bg-zinc-50 font-sans antialiased">
      {/* Brand panel — desktop */}
      <aside className="hidden lg:flex bg-zinc-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt=""
            aria-hidden="true"
            loading="eager"
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 px-10 xl:px-16 2xl:px-24 max-w-2xl flex flex-col items-center text-center">
          <div className="mb-8 flex justify-center w-full">
            <img src="/logo.png" alt="CortiGlow Logo" className="h-28 xl:h-36 2xl:h-40 w-auto drop-shadow-2xl" />
          </div>
          <h1 className="font-black text-white mb-6 leading-[1.1] tracking-tight text-balance text-4xl xl:text-5xl 2xl:text-6xl">
            Maestros en iluminación<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              y decoración de interiores.
            </span>
          </h1>
          <p className="text-lg xl:text-xl text-zinc-300 font-medium leading-relaxed max-w-lg">
            Gestión corporativa integral para proyectos de iluminación y cortinería de alto nivel.
          </p>
        </div>
      </aside>

      {/* Form column — smartphone / tablet / desktop */}
      <main className="w-full flex flex-1 items-center justify-center p-6 sm:p-8 md:p-10 relative overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        {/* Mobile Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl lg:hidden" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl lg:hidden" aria-hidden="true"></div>

        <div className="w-full max-w-[400px] md:max-w-[440px] 2xl:max-w-[480px] relative z-10">
          {/* Compact brand — smartphone + tablet only */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <span className="bg-white p-2.5 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 shrink-0">
              <img src="/logo.png" alt="CortiGlow Logo" className="h-8 w-8 object-contain drop-shadow-sm" />
            </span>
            <span className="text-left">
              <span className="block text-lg font-black tracking-tight text-zinc-900 leading-none">CortiGlow</span>
              <span className="block mt-1 text-sm font-medium text-zinc-500">Panel de Administración</span>
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight text-balance">
              Acceso Administrativo
            </h2>
            <p className="text-zinc-500 font-medium text-base mb-8">
              Ingresa con tu cuenta corporativa de CortiGlow.
            </p>

            {error && (
              <div role="alert" className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-5 py-4 rounded-2xl mb-8 flex items-start shadow-sm">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-rose-900">No pudimos iniciar sesión</p>
                  <p className="mt-0.5 text-sm font-semibold">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-zinc-700 mb-2 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full min-h-[48px] pl-12 pr-4 py-3.5 bg-white border-2 border-zinc-200 rounded-2xl text-base text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:border-zinc-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/20 transition-all font-semibold shadow-sm hover:border-zinc-300 selection:bg-amber-200 selection:text-zinc-900"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-zinc-700 mb-2 ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full min-h-[48px] pl-12 pr-12 py-3.5 bg-white border-2 border-zinc-200 rounded-2xl text-base text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:border-zinc-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/20 transition-all font-semibold shadow-sm hover:border-zinc-300 tracking-wider selection:bg-amber-200 selection:text-zinc-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] flex items-center justify-center py-4 px-4 mt-2 rounded-2xl shadow-lg shadow-zinc-900/20 text-base font-bold text-white bg-zinc-900 hover:bg-zinc-800 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Ingresar al Sistema
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-zinc-400 font-medium">
              <p>© {new Date().getFullYear()} CortiGlow. Panel de Administración.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
