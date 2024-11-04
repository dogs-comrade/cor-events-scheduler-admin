// src/api/schedules.ts
import { apiClient } from './client';
import { Schedule } from './types';

export const fetchSchedules = (page = 1, pageSize = 10) => {
  return apiClient.get('/schedules', {
    params: { page, page_size: pageSize }
  });
};

export const fetchSchedule = (id: number) => {
  return apiClient.get(`/schedules/${id}`);
};

export const createSchedule = async (schedule: Schedule) => {
  try {
    const response = await apiClient.post('/schedules', schedule);
    return response.data;
  } catch (error: any) {
    if (error.status === 400) {
      throw new Error('Неверный формат данных. Пожалуйста, проверьте введенные данные.');
    }
    throw error;
  }
};

export const updateSchedule = (id: number, schedule: Schedule) => {
  return apiClient.put(`/schedules/${id}`, schedule);
};

export const deleteSchedule = (id: number) => {
  return apiClient.delete(`/schedules/${id}`);
};

export const analyzeSchedule = (schedule: Schedule) => {
  return apiClient.post('/schedules/analyze', schedule);
};

export const optimizeSchedule = (schedule: Schedule) => {
  return apiClient.post('/schedules/optimize', schedule);
};

export const getPublicSchedule = (id: number, format: 'json' | 'text' = 'json') => {
  return apiClient.get(`/schedules/${id}/public`, {
    params: { format }
  });
};

export const getVolunteerSchedule = (id: number) => {
  return apiClient.get(`/schedules/${id}/volunteer`);
};