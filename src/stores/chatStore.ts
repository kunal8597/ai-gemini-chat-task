import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
}

export interface Chatroom {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

interface ChatState {
  chatrooms: Chatroom[];
  activeChatroomId: string | null;
  isTyping: boolean;
  createChatroom: (title: string) => void;
  deleteChatroom: (id: string) => void;
  setActiveChatroom: (id: string | null) => void;
  addMessage: (chatroomId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  getActiveChatroom: () => Chatroom | undefined;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatrooms: [],
      activeChatroomId: null,
      isTyping: false,

      createChatroom: (title) => {
        const newChatroom: Chatroom = {
          id: Date.now().toString(),
          title,
          createdAt: new Date(),
          messages: [],
        };
        set((state) => ({
          chatrooms: [...state.chatrooms, newChatroom],
          activeChatroomId: newChatroom.id,
        }));
      },

      deleteChatroom: (id) => {
        set((state) => ({
          chatrooms: state.chatrooms.filter((room) => room.id !== id),
          activeChatroomId: state.activeChatroomId === id ? null : state.activeChatroomId,
        }));
      },

      setActiveChatroom: (id) => {
        set({ activeChatroomId: id });
      },

      addMessage: (chatroomId, message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        set((state) => ({
          chatrooms: state.chatrooms.map((room) =>
            room.id === chatroomId
              ? { ...room, messages: [...room.messages, newMessage] }
              : room
          ),
        }));
      },

      setTyping: (typing) => {
        set({ isTyping: typing });
      },

      getActiveChatroom: () => {
        const { chatrooms, activeChatroomId } = get();
        return chatrooms.find((room) => room.id === activeChatroomId);
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);
