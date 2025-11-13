import api from './axios';

export const getUsersByIds = (ids: string[]) => api.post(`/user/by-ids`, {ids}).then(r => r.data);