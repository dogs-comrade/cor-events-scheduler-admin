// src/types/index.ts
// Add this interface
export interface ScheduleResponse {
  data: Schedule[];
  total: number;
  page: number;
  page_size: number;
}

// src/services/api.ts
import axios from 'axios';
import { Schedule } from '../types';

const API_URL = 'http://localhost:8282/api/v1';

export const scheduleApi = {
  async getAll(page = 1, pageSize = 10): Promise<ScheduleResponse> {
    try {
      const response = await axios.get<ScheduleResponse>(
        `${API_URL}/schedules?page=${page}&page_size=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      return {
        data: [],
        total: 0,
        page: page,
        page_size: pageSize
      };
    }
  },

  async getById(id: number): Promise<Schedule> {
    const response = await axios.get<Schedule>(`${API_URL}/schedules/${id}`);
    return response.data;
  },

  async create(schedule: Schedule): Promise<Schedule> {
    const response = await axios.post<Schedule>(`${API_URL}/schedules`, schedule);
    return response.data;
  },

  async update(id: number, schedule: Schedule): Promise<Schedule> {
    const response = await axios.put<Schedule>(`${API_URL}/schedules/${id}`, schedule);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/schedules/${id}`);
  },

  async arrangeItems(scheduleId: number, items: any[]): Promise<void> {
    await axios.post(`${API_URL}/schedules/arrange`, {
      schedule_id: scheduleId,
      items: items
    });
  }
};