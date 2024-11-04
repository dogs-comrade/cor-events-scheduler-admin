// src/pages/PublicSchedule.tsx
import { h } from 'preact';
import { PublicScheduleViewer } from '../components/schedules/PublicScheduleViewer';

export const PublicSchedule = () => {
  return (
    <div class="min-h-screen bg-gray-50">
      <PublicScheduleViewer />
    </div>
  );
};