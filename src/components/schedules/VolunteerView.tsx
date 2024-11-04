import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getVolunteerSchedule } from '../../api/schedules';
import { formatDateTime, formatTime } from '../../utils/date';

interface Props {
  scheduleId: number;
}

export const VolunteerView = ({ scheduleId }: Props) => {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteerSchedule();
  }, [scheduleId]);

  const loadVolunteerSchedule = async () => {
    try {
      const response = await getVolunteerSchedule(scheduleId);
      setSchedule(response.data);
    } catch (error) {
      console.error('Failed to load volunteer schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading volunteer schedule...</div>;
  if (!schedule) return <div>Schedule not found</div>;

  return (
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="px-6 py-4 bg-blue-600">
          <h2 class="text-2xl font-bold text-white">{schedule.event_name}</h2>
          <div class="text-blue-100 mt-1">
            {formatDateTime(schedule.date)}
          </div>
        </div>

        {schedule.notes && schedule.notes.length > 0 && (
          <div class="bg-blue-50 px-6 py-4 border-b">
            <h3 class="text-sm font-medium text-blue-800 uppercase tracking-wide mb-2">
              Important Notes
            </h3>
            <ul class="list-disc pl-5 space-y-1">
              {schedule.notes.map((note: string, index: number) => (
                <li key={index} class="text-blue-900">{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div class="divide-y divide-gray-200">
          {schedule.items.map((item: any, index: number) => (
            <div key={index} class="px-6 py-4 hover:bg-gray-50">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center">
                    <time class="text-sm text-gray-600">
                      {formatTime(item.time)}
                    </time>
                    {item.tech_break && (
                      <span class="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        Tech Break
                      </span>
                    )}
                  </div>
                  <h3 class="text-lg font-medium mt-1">{item.title}</h3>
                  <div class="text-sm text-gray-600 mt-1">
                    Location: {item.location}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-blue-600">
                    {item.required_staff} staff needed
                  </div>
                  {item.break_duration && (
                    <div class="text-sm text-gray-600">
                      Break: {item.break_duration} min
                    </div>
                  )}
                </div>
              </div>

              {item.instructions && (
                <div class="mt-3">
                  <h4 class="text-sm font-medium text-gray-900">Instructions:</h4>
                  <p class="mt-1 text-sm text-gray-600">{item.instructions}</p>
                </div>
              )}

              {item.equipment && item.equipment.length > 0 && (
                <div class="mt-3">
                  <h4 class="text-sm font-medium text-gray-900">Equipment:</h4>
                  <div class="mt-1 flex flex-wrap gap-2">
                    {item.equipment.map((eq: string, eqIndex: number) => (
                      <span
                        key={eqIndex}
                        class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.setup_notes && (
                <div class="mt-3">
                  <h4 class="text-sm font-medium text-gray-900">Setup Notes:</h4>
                  <p class="mt-1 text-sm text-gray-600">{item.setup_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};