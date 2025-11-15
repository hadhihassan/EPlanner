import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IMessage } from '../../types/message.types';

interface ChatState {
  messages: { [eventId: string]: IMessage[] };
}

const initialState: ChatState = {
  messages: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<{ eventId: string; messages: IMessage[] }>) => {
      state.messages[action.payload.eventId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<{ eventId: string; message: IMessage }>) => {
      if (!state.messages[action.payload.eventId]) {
        state.messages[action.payload.eventId] = [];
      }
      state.messages[action.payload.eventId].push(action.payload.message);
    },
    clearChat: (state, action: PayloadAction<{ eventId: string }>) => {
      delete state.messages[action.payload.eventId];
    }
  }
});

export const { setMessages, addMessage, clearChat } = chatSlice.actions;

// Selectors
export const selectMessagesByEvent = (eventId: string) => (state: { chat: ChatState }) => 
  state.chat.messages[eventId] || [];

export default chatSlice.reducer;