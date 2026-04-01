import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, SessionContextType } from './types';

const STORAGE_KEY = '@pomodoom_sessions';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value) {
          const parsed = JSON.parse(value) as Session[];
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load session history:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const persist = async (nextHistory: Session[]) => {
    try {
      setHistory(nextHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    } catch (error) {
      console.error('Failed to save session history:', error);
    }
  };

  const startSession = (payload?: Partial<Session>) => {
    const session: Session = {
      id: payload?.id || `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      start: payload?.start ?? Date.now(),
      end: payload?.end,
      duration: payload?.duration,
      notes: payload?.notes,
    };
    setActiveSession(session);
  };

  const completeSession = (notes?: string) => {
    if (!activeSession) {
      console.warn('completeSession called with no active session');
      return;
    }

    const now = Date.now();
    const finished: Session = {
      ...activeSession,
      end: now,
      duration: activeSession.duration ?? Math.max(0, Math.floor((now - activeSession.start) / 1000)),
      notes: notes ?? activeSession.notes,
    };

    const nextHistory = [finished, ...history];
    setActiveSession(null);
    persist(nextHistory);
  };

  const addSession = (session: Session) => {
    const nextHistory = [session, ...history];
    persist(nextHistory);
  };

  return (
    <SessionContext.Provider
      value={{ activeSession, history, startSession, completeSession, addSession }}>
      {loading ? null : children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
