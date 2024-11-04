import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getPublicSchedule } from '../../api/schedules';
import { formatDateTime } from '../../utils/date';

interface Props {
  scheduleId: number;
}

export const PublicView = ({ scheduleId }: Props) => {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicSchedule();
  }, [scheduleId]);

  const loadPublicSchedule = async () => {
    try {
      const response = await getPublicSchedule(scheduleId);
      setSchedule(response.data);
    } catch (error) {
      console.error('Failed to load public schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading schedule...</div>;
  if (!schedule) return <div>Schedule not found</div>;

  return (
    <div class="max-w-4xl mx-auto p-6">
      <h2 class="text-3xl font-bold mb-6">{schedule.event_name}</h2>
      <div class="text-lg text-gray-600 mb-8">
        {formatDateTime(schedule.date)}
      </div>

      <div class="space-y-8">
        {schedule.items.map((item: any, index: number) => (
          <div key={index} class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold">{item.title}</h3>
              <time class="text-gray-600">{formatTime(item.time)}</time>
            </div>
            
            {item.description && (
              <p class="text-gray-700 mb-4">{item.description}</p>
            )}

            {item.sub_items && item.sub_items.length > 0 && (
              <div class="ml-6 space-y-4">
                {item.sub_items.map((subItem: any, subIndex: number) => (
                  <div key={subIndex} class="border-l-2 border-gray-200 pl-4">
                    <div class="flex justify-between items-center">
                      <h4 class="font-medium">{subItem.title}</h4>
                      <time class="text-sm text-gray-600">
                        {formatTime(subItem.time)}
                      </time>
                    </div>
                    {subItem.description && (
                      <p class="text-sm text-gray-600 mt-1">
                        {subItem.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
