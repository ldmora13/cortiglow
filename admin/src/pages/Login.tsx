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
    <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-[1fr_1.05fr] xl:grid-cols-2 bg-zinc-100 font-sans antialiased">
      {/* Brand panel */}
      <aside className="hidden lg:flex relative bg-zinc-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-zinc-950/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        <div className="relative z-10 flex w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
          <img src="/logo.png" alt="CortiGlow" className="h-30 xl:h-36 2xl:h-42 w-auto self-start brightness-0 invert" />

          <div className="max-w-xl">
            <h1 className="font-extrabold tracking-[-0.02em] text-balance leading-[1.05] text-[clamp(2rem,2.6vw+1rem,3.25rem)] 2xl:text-6xl">
              Maestros en iluminación y decoración de interiores.
            </h1>
            <p className="mt-4 text-base xl:text-lg font-medium leading-relaxed text-zinc-300 max-w-md">
              Gestión corporativa integral para proyectos de iluminación y cortinería de alto nivel.
            </p>
          </div>

          <p className="text-sm font-medium text-zinc-400">© {new Date().getFullYear()} CortiGlow · Panel de Administración</p>
        </div>
      </aside>

      {/* Form column */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 md:px-8 md:py-12 lg:px-10 lg:py-8 xl:px-14 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-[400px] md:max-w-[440px] 2xl:max-w-[480px]">
          {/* Compact brand  */}
          <div className="lg:hidden mb-6 md:mb-8 flex items-center gap-3 md:justify-center">
            <span className="bg-zinc-950 p-2.5 rounded-2xl shrink-0">
              <img src="/logo.png" alt="CortiGlow" className="h-8 w-8 object-contain brightness-0 invert" />
            </span>
            <span className="text-left md:text-center">
              <span className="block text-lg md:text-xl font-extrabold tracking-tight text-zinc-900 leading-none">CortiGlow</span>
              <span className="block mt-1 text-sm font-medium text-zinc-500">Panel de Administración</span>
            </span>
          </div>

          <section className="bg-white rounded-2xl border border-zinc-200 shadow-[0_24px_48px_-24px_rgb(0,0,0,0.25)] p-5 sm:p-7 md:p-8 2xl:p-10">
            <h2 className="text-xl sm:text-2xl 2xl:text-[1.75rem] font-extrabold tracking-tight text-zinc-900 text-balance">
              Acceso Administrativo
            </h2>
            <p className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-zinc-500">
              Ingresa con tu cuenta corporativa de CortiGlow
            </p>

            {error && (
              <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-rose-900">No pudimos iniciar sesión</p>
                  <p className="mt-0.5 text-sm font-medium text-rose-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4 md:space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-zinc-700 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="block w-full min-h-[48px] pl-11 pr-4 py-3 bg-white border border-zinc-300 rounded-xl text-base text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium font-medium shadow-sm hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/15 transition-colors selection:bg-zinc-900 selection:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-zinc-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <svg className="h-5 w-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full min-h-[48px] pl-11 pr-12 py-3 bg-white border border-zinc-300 rounded-xl text-base text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium font-medium shadow-sm hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/15 transition-colors selection:bg-zinc-900 selection:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-zinc-900 shadow-[0_12px_24px_-12px_rgb(0,0,0,0.5)] hover:bg-zinc-700 active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión…
                  </>
                ) : (
                  <>
                    Ingresar al Sistema
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </section>

          <p className="mt-6 text-center text-[0.8125rem] font-medium text-zinc-500">
            © {new Date().getFullYear()} CortiGlow. <span className="lg:hidden">Panel de Administración.</span>
            <span className="hidden lg:inline">Acceso restringido al personal autorizado.</span>
          </p>
        </div>
      </main>
    </div>
  );
}
