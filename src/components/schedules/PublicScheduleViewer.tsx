import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { format, parseISO } from 'date-fns';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

interface TimeSlot {
  time: string;
  events: ScheduleEvent[];
}

interface ScheduleEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  maxParticipants?: number;
}

export const PublicScheduleViewer = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  const locations = ['Main Stage', 'Workshop Room', 'Exhibition Hall', 'Outdoor Area'];
  const eventTypes = ['Performance', 'Workshop', 'Break', 'Exhibition'];

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/schedules/public?date=${selectedDate.toISOString()}`);
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = (events: ScheduleEvent[]) => {
    return events.filter(event => {
      const typeMatch = selectedType === 'all' || event.type === selectedType;
      const locationMatch = selectedLocation === 'all' || event.location === selectedLocation;
      return typeMatch && locationMatch;
    });
  };

  const EventCard = ({ event }: { event: ScheduleEvent }) => (
    <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium text-gray-900">{event.title}</h3>
          <p class="text-sm text-gray-500">{event.location}</p>
        </div>
        <span class={`
          px-2 py-1 text-xs rounded-full
          ${event.type === 'Performance' ? 'bg-blue-100 text-blue-800' : ''}
          ${event.type === 'Workshop' ? 'bg-green-100 text-green-800' : ''}
          ${event.type === 'Break' ? 'bg-gray-100 text-gray-800' : ''}
          ${event.type === 'Exhibition' ? 'bg-purple-100 text-purple-800' : ''}
        `}>
          {event.type}
        </span>
      </div>
      {event.description && (
        <p class="text-sm text-gray-600 mt-2">{event.description}</p>
      )}
      <div class="mt-2 text-sm text-gray-500">
        {format(parseISO(event.startTime), 'HH:mm')} - 
        {format(parseISO(event.endTime), 'HH:mm')}
      </div>
      {event.maxParticipants && (
        <div class="mt-2 text-sm text-gray-500">
          Max participants: {event.maxParticipants}
        </div>
      )}
    </div>
  );

  const TimelineView = () => (
    <div class="space-y-4">
      {schedule.map((timeSlot, index) => (
        <div key={index} class="relative">
          <div class="flex items-center">
            <div class="w-24 flex-shrink-0 text-sm font-medium text-gray-500">
              {format(parseISO(timeSlot.time), 'HH:mm')}
            </div>
            <div class="flex-grow space-y-2">
              {filterEvents(timeSlot.events).map((event, eventIndex) => (
                <EventCard key={eventIndex} event={event} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const GridView = () => (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schedule.flatMap(timeSlot => 
        filterEvents(timeSlot.events).map((event, index) => (
          <EventCard key={index} event={event} />
        ))
      )}
    </div>
  );

  if (isLoading) {
    return <div class="p-4">Loading schedule...</div>;
  }

  return (
    <div class="max-w-7xl mx-auto p-4">
      {/* Фильтры */}
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="Date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date((e.target as HTMLInputElement).value))}
          />
          <Select
            label="Event Type"
            value={selectedType}
            onChange={(e) => setSelectedType((e.target as HTMLSelectElement).value)}
            options={[
              { value: 'all', label: 'All Types' },
              ...eventTypes.map(type => ({ value: type, label: type }))
            ]}
          />
          <Select
            label="Location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation((e.target as HTMLSelectElement).value)}
            options={[
              { value: 'all', label: 'All Locations' },
              ...locations.map(loc => ({ value: loc, label: loc }))
            ]}
          />
          <div class="flex items-end space-x-2">
            <Button
              onClick={() => setViewMode('timeline')}
              variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
            >
              Timeline
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            >
              Grid
            </Button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div class="bg-white rounded-lg shadow-sm p-4">
        {viewMode === 'timeline' ? <TimelineView /> : <GridView />}
      </div>
    </div>
  );
};