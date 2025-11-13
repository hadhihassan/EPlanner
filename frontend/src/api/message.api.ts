import api from './axios';

export const getMessagesByEvent = (eventId: string) => api.get(`/message/${eventId}`).then(r => r.data);
export const sendMessage = (eventId: string, text: string) => api.post(`/message/${eventId}`, { text }).then(r => r.data);