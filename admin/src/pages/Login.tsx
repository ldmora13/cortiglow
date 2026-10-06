// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans">
      {/* Left Column - Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Interior design with blinds" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
        </div>
        
        {/* Brand Content */}
        <div className="relative z-10 px-16 xl:px-24 max-w-2xl flex flex-col items-center text-center">
          <div className="mb-8 flex justify-center w-full">
            <img src="/logo.png" alt="CortiGlow Logo" className="h-32 lg:h-40 w-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Maestros en iluminación<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              y decoración de interiores.
            </span>
          </h1>
          <p className="text-xl text-zinc-300 font-medium leading-relaxed max-w-lg">
            Gestión corporativa integral para proyectos de iluminación y cortinería de alto nivel.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl lg:hidden"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl lg:hidden"></div>

        <div className="w-full max-w-[440px] relative z-10 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          {/* Mobile Logo & Branding */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 mb-6 flex justify-center">
              <img src="/logo.png" alt="CortiGlow Logo" className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3 leading-tight tracking-tight">
              Maestros en iluminación<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">y decoración.</span>
            </h2>
            <p className="text-zinc-500 font-medium text-base sm:text-lg px-4">
              Ingresa a tu cuenta administrativa para gestionar el negocio.
            </p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block text-left mb-10">
            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">Acceso Administrativo</h2>
            <p className="text-zinc-500 font-medium text-lg">Ingresa con tu cuenta corporativa de CortiGlow.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-5 py-4 rounded-2xl mb-8 flex items-start shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm font-semibold">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-200 rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:border-zinc-900 transition-all font-semibold shadow-sm hover:border-zinc-300"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-200 rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:border-zinc-900 transition-all font-semibold shadow-sm hover:border-zinc-300 tracking-wider"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-4 mt-2 rounded-2xl shadow-lg shadow-zinc-900/20 text-base font-bold text-white bg-zinc-900 hover:bg-zinc-800 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-zinc-900/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Ingresar al Sistema
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-zinc-400 font-medium">
            <p>© {new Date().getFullYear()} CortiGlow. Panel de Administración.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
