import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setUnauthorizedHandler } from '@/services/apiClient';
import * as authService from '@/services/authService';
import { updateProfileOnApi } from '@/services/profileService';
import type { SessionUser } from '@/types';

interface ProfileUpdates {
  name: string;
  email: string;
  mobileNumber: string;
}

const SESSION_KEY = 'tilevision_web_session';
const REMEMBER_KEY = 'tilevision_web_remember_email';

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  rememberedEmail: string;
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<{ success: boolean; error?: string; user?: SessionUser }>;
  logout: () => void;
  setRememberedEmail: (email: string) => void;
  updateProfile: (updates: ProfileUpdates) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function saveSession(user: SessionUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberedEmail, setRememberedEmailState] = useState('');

  const logout = useCallback(() => {
    authService.logout();
    saveSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    (async () => {
      setRememberedEmailState(localStorage.getItem(REMEMBER_KEY) ?? '');
      const cached = loadSession();
      if (cached) setUser(cached);

      const sessionUser = await authService.fetchCurrentUser();
      if (sessionUser) {
        saveSession(sessionUser);
        setUser(sessionUser);
      } else {
        saveSession(null);
        setUser(null);
      }

      setIsLoading(false);
    })();
  }, []);

  const setRememberedEmail = useCallback((email: string) => {
    setRememberedEmailState(email);
    if (email) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const result = await authService.login(email, password);
      if ('error' in result) return { success: false, error: result.error };

      setUser(result.user);
      saveSession(result.user);

      if (remember) setRememberedEmail(result.user.email);
      else setRememberedEmail('');

      return { success: true, user: result.user };
    },
    [setRememberedEmail],
  );

  const refreshUser = useCallback(async () => {
    const sessionUser = await authService.fetchCurrentUser();
    if (sessionUser) {
      saveSession(sessionUser);
      setUser(sessionUser);
      return;
    }

    logout();
  }, [logout]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdates) => {
      if (!user) {
        return { success: false, error: 'No active session.' };
      }

      const result = await updateProfileOnApi(updates);
      if (!result.success) {
        return result;
      }

      saveSession(result.user);
      setUser(result.user);
      return { success: true };
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) {
        return { success: false, error: 'No active session.' };
      }

      if (newPassword.length < 8) {
        return { success: false, error: 'New password must be at least 8 characters.' };
      }

      return authService.changePassword(currentPassword, newPassword);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      rememberedEmail,
      login,
      logout,
      setRememberedEmail,
      updateProfile,
      changePassword,
      refreshUser,
    }),
    [
      user,
      isLoading,
      rememberedEmail,
      login,
      logout,
      setRememberedEmail,
      updateProfile,
      changePassword,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
