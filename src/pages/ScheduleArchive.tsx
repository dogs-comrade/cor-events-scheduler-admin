import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Schedule } from '../api/types';
import { fetchSchedules } from '../api/schedules';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const ScheduleArchive = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadArchiveSchedules();
  }, [page]);

  const loadArchiveSchedules = async () => {
    try {
      const response = await fetchSchedules(page, pageSize);
      // Фильтруем только завершенные расписания
      const archivedSchedules = response.data.data.filter(schedule => 
        new Date(schedule.end_date) < new Date()
      );
      setSchedules(archivedSchedules);
    } catch (error) {
      console.error('Failed to load archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Название',
      accessor: 'name',
      cell: (value: string, row: Schedule) => (
        <div class="flex flex-col">
          <span class="font-medium text-gray-900">{value}</span>
          <span class="text-sm text-gray-500">{row.description}</span>
        </div>
      )
    },
    {
      header: 'Период',
      accessor: 'start_date',
      cell: (value: string, row: Schedule) => (
        <div class="text-sm">
          <div>
            {format(new Date(value), 'd MMMM yyyy', { locale: ru })} -
          </div>
          <div>
            {format(new Date(row.end_date), 'd MMMM yyyy', { locale: ru })}
          </div>
        </div>
      )
    },
    {
      header: 'Итоговый риск',
      accessor: 'risk_score',
      cell: (value: number) => {
        const scoreClass = value >= 0.7 
          ? 'text-red-600 bg-red-100' 
          : value >= 0.4 
            ? 'text-yellow-600 bg-yellow-100' 
            : 'text-green-600 bg-green-100';
        return (
          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreClass}`}>
            {(value * 100).toFixed()}%
          </span>
        );
      }
    },
    {
      header: 'Действия',
      accessor: 'id',
      cell: (value: number) => (
        <div class="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.href = `/schedules/${value}`}
          >
            Просмотр
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Здесь можно добавить экспорт в PDF или другой формат
              console.log('Export schedule:', value);
            }}
          >
            Экспорт
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div class="flex justify-center items-center h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div class="p-6 space-y-6">
      <header class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Архив расписаний</h1>
          <p class="mt-1 text-sm text-gray-500">
            Просмотр завершенных мероприятий
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              // Добавить функционал экспорта всего архива
              console.log('Export all archives');
            }}
          >
            Экспортировать все
          </Button>
        </div>
      </header>

      {schedules.length > 0 ? (
        <div class="bg-white shadow rounded-lg">
          <Table
            data={schedules}
            columns={columns}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <div class="text-center py-12 bg-white rounded-lg shadow">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Архив пуст
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            В архиве пока нет завершенных мероприятий
          </p>
        </div>
      )}
    </div>
  );
};