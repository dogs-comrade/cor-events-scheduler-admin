import { h } from 'preact';
import { ScheduleList } from '../components/schedules/ScheduleList';

export const Schedules = () => {
  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Event Schedules</h1>
      <ScheduleList />
    </div>
  );
};