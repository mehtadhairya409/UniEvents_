import api from './axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminEvents = () => api.get('/admin/events');
export const getAdminUsers = () => api.get('/admin/users');
