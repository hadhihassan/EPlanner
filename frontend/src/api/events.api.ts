import api from './axios';


export const listEventsAPI = (q?: string, page = 1, limit = 10) =>
    api.get('/event', { params: { q, page, limit } })
        .then(r => r.data);

export const getEventAPI = (id: string) =>
    api.get(`/event/${id}`).then(r => r.data);

export const createEventAPI = (payload: FormData) =>
    api.post('/event', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
        .then(r => r.data);

export const updateEventAPI = (payload: unknown) =>
    api.post('/event', payload)
        .then(r => r.data);

export const deleteEventAPI = (id: string) =>
    api.delete(`/event/${id}`)
        .then(r => r.data);

export const getEligibleUsersAPI = (eventId: string) =>
    api.get(`/event/${eventId}/eligible-users`)
        .then((r) => r.data);

export const addParticipantsAPI = (eventId: string, participants: string[]) =>
    api.patch(`/event/${eventId}/add-participants`, { participants }).then((r) => r.data);