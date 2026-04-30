import api from './axios';

export const registerForEvent = (eventId) =>
  api.post(`/registrations/${eventId}`);

export const getMyRegistrations = () =>
  api.get('/registrations/my');

export const getEventRegistrations = (eventId) =>
  api.get(`/registrations/event/${eventId}`);

export const checkIn = (qrCodeData) =>
  api.post('/registrations/checkin', { qr_code_data: qrCodeData });

export const updateCheckin = (registrationId, checked_in) =>
  api.put(`/registrations/${registrationId}/checkin`, { checked_in });
