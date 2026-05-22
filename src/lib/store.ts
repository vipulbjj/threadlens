import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ChatPlatform = "whatsapp" | "telegram" | "imessage";

export interface ChatMessage {
  date: string;
  time: string;
  sender: string;
  message: string;
}

export interface ChatSession {
  id: string;
  name: string;
  platform: ChatPlatform;
  messages: ChatMessage[];
  importedAt: string;
}

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setChat: (name: string, messages: ChatMessage[], platform: ChatPlatform) => string;
  setActiveSession: (id: string) => void;
  removeSession: (id: string) => void;
  clearAll: () => void;
}

function newSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      setChat: (name, messages, platform) => {
        const id = newSessionId();
        const session: ChatSession = {
          id,
          name,
          platform,
          messages,
          importedAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [session, ...state.sessions.filter((s) => s.id !== id)].slice(0, 12),
          activeSessionId: id,
        }));
        return id;
      },
      setActiveSession: (id) => set({ activeSessionId: id }),
      removeSession: (id) =>
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== id);
          const activeSessionId =
            state.activeSessionId === id ? sessions[0]?.id ?? null : state.activeSessionId;
          return { sessions, activeSessionId };
        }),
      clearAll: () => set({ sessions: [], activeSessionId: null }),
    }),
    {
      name: "threadlens-sessions",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions.map((s) => ({
          ...s,
          messages: s.messages.slice(-8000),
        })),
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);

export function useActiveSession() {
  return useChatStore((state) => {
    const session = state.sessions.find((s) => s.id === state.activeSessionId);
    return session ?? null;
  });
}

/** @deprecated Use useActiveSession — kept for gradual migration */
export function useLegacyChatFields() {
  const session = useActiveSession();
  return {
    activeChatName: session?.name ?? null,
    messages: session?.messages ?? [],
  };
}
