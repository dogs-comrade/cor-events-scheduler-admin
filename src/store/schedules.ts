import { create } from 'zustand';

export const useScheduleStore = create((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
}));
