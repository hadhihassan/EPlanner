import api from './axios';

export const listEventsAPI = (
    q?: string,
    status?: string,
    page: number = 1,
    limit: number = 9
) => api.get('/event', {
    params: {
        q: q?.trim() || undefined,
        status: status === 'all' ? undefined : status,
        page,
        limit
    }
}).then(r => r.data);

export const getEventAPI = (id: string) =>
    api.get(`/event/${id}`).then(r => r.data);

export const createEventAPI = (payload: FormData) =>
    api.post('/event', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(r => r.data);

export const updateEventAPI = (id: string, payload: FormData) =>
    api.put(`/event/${id}`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(r => r.data);

export const deleteEventAPI = (id: string) =>
    api.delete(`/event/${id}`)
        .then(r => r.data);

export const getEligibleUsersAPI = (eventId: string) =>
    api.get(`/event/${eventId}/eligible-users`)
        .then((r) => r.data);

export const addParticipantsAPI = (
    eventId: string,
    participants: string[]
) => api.patch(`/event/${eventId}/add-participants`, { participants }).then((r) => r.data);