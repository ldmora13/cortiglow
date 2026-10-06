import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  role: string;
  user_metadata: {
    full_name: string;
  };
}

export interface Session {
  user: User;
  access_token?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setSessionData: (session: Session) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  setSessionData: () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cortiglow_auth_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/session');
          if (data.session) {
            data.session.access_token = token; // Restore token from localStorage
            setSession(data.session);
            setUser(data.session.user);
          } else {
            localStorage.removeItem('cortiglow_auth_token');
          }
        } catch (error) {
          localStorage.removeItem('cortiglow_auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to global unauthorized events from axios interceptor
    const handleUnauthorized = () => {
      setSession(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const setSessionData = (newSession: Session) => {
    if (newSession.access_token) {
      localStorage.setItem('cortiglow_auth_token', newSession.access_token);
    }
    setSession(newSession);
    setUser(newSession.user);
  };

  const signOut = async () => {
    localStorage.removeItem('cortiglow_auth_token');
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, setSessionData, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
