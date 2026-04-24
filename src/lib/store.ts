import { create } from 'zustand';

export interface ChatMessage {
  date: string;
  time: string;
  sender: string;
  message: string;
}

interface ChatStore {
  activeChatName: string | null;
  messages: ChatMessage[];
  setChat: (name: string, messages: ChatMessage[]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChatName: null,
  messages: [],
  setChat: (name, messages) => set({ activeChatName: name, messages }),
  clearChat: () => set({ activeChatName: null, messages: [] }),
}));
