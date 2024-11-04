import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { Schedule } from '../api/types';
import { fetchSchedule, createSchedule, updateSchedule } from '../api/schedules';
import { ScheduleForm } from '../components/schedules/ScheduleForm';

interface Props {
  id?: string;
}

export const ScheduleEdit = ({ id }: Props) => {
  const [schedule, setSchedule] = useState<Schedule | undefined>();
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadSchedule();
    }
  }, [id]);

  const loadSchedule = async () => {
    try {
      const response = await fetchSchedule(parseInt(id!));
      setSchedule(response.data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Schedule) => {
    try {
      if (id) {
        await updateSchedule(parseInt(id), data);
      } else {
        await createSchedule(data);
      }
      route('/schedules');
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">
        {id ? 'Edit Schedule' : 'Create New Schedule'}
      </h1>
      <ScheduleForm initialData={schedule} onSubmit={handleSubmit} />
    </div>
  );
};