import React, { createContext, useContext, useState } from 'react';
import type { Session, SessionContextType } from './types';

/**
 * SessionContext provides active timer session and session history.
 * Business logic should be kept minimal here; persistence belongs to services.
 */
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [history, setHistory] = useState<Session[]>([]);

  const startSession = (payload?: Partial<Session>) => {
    const session: Session = {
      ...(payload as Session ?? {}),
      id: payload?.id ?? Date.now().toString(),
      start: payload?.start ?? Date.now(),
    };
    setActiveSession(session);
  };

  const completeSession = (notes?: string) => {
    if (!activeSession) return;
    const end = Date.now();
    const completed: Session = {
      ...activeSession,
      end,
      duration: Math.round((end - activeSession.start) / 1000),
      notes: notes ?? activeSession.notes,
    };
    setHistory((prev) => [completed, ...prev]);
    setActiveSession(null);
  };

  const addSession = (session: Session) => setHistory((prev) => [session, ...prev]);

  const value: SessionContextType = { activeSession, history, startSession, completeSession, addSession };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
};

export default SessionContext;
