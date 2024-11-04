// src/components/schedules/ScheduleList.tsx
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Schedule, Block } from '../../api/types';
import { fetchSchedules, deleteSchedule, fetchSchedule } from '../../api/schedules';
import { Table } from '../common/Table';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { format, formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScheduleSummary {
  totalBlocks: number;
  totalDuration: number;
  blocksBreakdown: {
    type: string;
    count: number;
  }[];
  upcomingEvents: Block[];
  riskAnalysis: {
    highRiskCount: number;
    averageComplexity: number;
  };
}

export const ScheduleList = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState<ScheduleSummary | null>(null);

  const loadSchedules = async () => {
    try {
      const response = await fetchSchedules(page, pageSize);
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [page]);

  const handleDelete = async (e: Event, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить это расписание?')) {
      try {
        await deleteSchedule(id);
        loadSchedules();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const calculateSummary = (schedule: Schedule): ScheduleSummary => {
    const blocks = schedule.blocks || [];
    const types = new Map<string, number>();
    let totalComplexity = 0;
    let highRiskCount = 0;

    blocks.forEach(block => {
      // Count block types
      const type = block.type || 'other';
      types.set(type, (types.get(type) || 0) + 1);

      // Calculate complexity and risks
      if (block.complexity) totalComplexity += block.complexity;
      if (block.risk_factors?.some(r => r.impact * r.probability > 0.7)) {
        highRiskCount++;
      }
    });

    const now = new Date();
    const upcomingEvents = blocks
      .filter(block => block.start_time && new Date(block.start_time) > now)
      .sort((a, b) => {
        if (!a.start_time || !b.start_time) return 0;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      })
      .slice(0, 5);

    return {
      totalBlocks: blocks.length,
      totalDuration: blocks.reduce((sum, block) => sum + (block.duration || 0), 0),
      blocksBreakdown: Array.from(types.entries()).map(([type, count]) => ({
        type,
        count
      })),
      upcomingEvents,
      riskAnalysis: {
        highRiskCount,
        averageComplexity: blocks.length ? totalComplexity / blocks.length : 0
      }
    };
  };

  const handleScheduleClick = async (schedule: Schedule) => {
    try {
      const response = await fetchSchedule(schedule.id!);
      const fullSchedule = response.data;
      setSelectedSchedule(fullSchedule);
      setSummary(calculateSummary(fullSchedule));
      setShowSummaryModal(true);
    } catch (error) {
      console.error('Failed to load schedule details:', error);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600 bg-red-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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
      header: 'Период проведения',
      accessor: 'start_date',
      cell: (value: string, row: Schedule) => (
        <div class="flex flex-col">
          <span class="font-medium">
            {format(new Date(value), 'd MMMM yyyy', { locale: ru })}
          </span>
          <span class="text-sm text-gray-500">
            {`${formatDuration(
              intervalToDuration({
                start: new Date(value),
                end: new Date(row.end_date)
              }),
              { locale: ru }
            )}`}
          </span>
        </div>
      )
    },
    {
      header: 'Риск',
      accessor: 'risk_score',
      cell: (value: number) => value !== undefined && (
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskScoreColor(value)}`}>
          {(value * 100).toFixed()}%
        </span>
      )
    },
    {
      header: 'Статистика',
      accessor: 'id',
      cell: (value: number, row: Schedule) => (
        <div class="flex flex-col text-sm">
          <span>Блоков: {row.blocks?.length || 0}</span>
          <span>Буфер: {row.buffer_time || 0} мин</span>
        </div>
      )
    },
    {
      header: 'Действия',
      accessor: 'id',
      cell: (value: number, row: Schedule) => (
        <div class="flex gap-2">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/schedules/${value}/edit`;
            }}
            variant="secondary"
            size="sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Изменить
          </Button>
          <Button
            type="button"
            onClick={(e) => handleDelete(e, value)}
            variant="danger"
            size="sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Удалить
          </Button>
        </div>
      )
    }
  ];

  const ScheduleSummaryModal = () => {
    if (!selectedSchedule || !summary) return null;

    return (
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title={`Сводка по расписанию: ${selectedSchedule.name}`}
        size="lg"
      >
        <div class="space-y-6">
          {/* Основная информация */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Общая информация
              </h4>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-gray-500">Всего блоков:</dt>
                  <dd class="font-medium">{summary.totalBlocks}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Общая длительность:</dt>
                  <dd class="font-medium">
                    {formatDuration(
                      { minutes: summary.totalDuration },
                      { locale: ru }
                    )}
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Буферное время:</dt>
                  <dd class="font-medium">
                    {selectedSchedule.buffer_time} мин
                  </dd>
                </div>
              </dl>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Анализ рисков
              </h4>
              <dl class="space-y-2">
                <div class="flex justify-between">
                  <dt class="text-gray-500">Общий риск:</dt>
                  <dd class={`font-medium ${getRiskScoreColor(selectedSchedule.risk_score || 0)}`}>
                    {((selectedSchedule.risk_score || 0) * 100).toFixed()}%
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Блоков с высоким риском:</dt>
                  <dd class="font-medium">{summary.riskAnalysis.highRiskCount}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Средняя сложность:</dt>
                  <dd class="font-medium">
                    {(summary.riskAnalysis.averageComplexity * 100).toFixed()}%
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Типы блоков */}
          <div>
            <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Распределение по типам
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.blocksBreakdown.map(({ type, count }) => (
                <div key={type} class="bg-gray-50 p-3 rounded-lg">
                  <dt class="text-sm font-medium text-gray-500 capitalize">
                    {type}
                  </dt>
                  <dd class="mt-1 text-2xl font-semibold">
                    {count}
                  </dd>
                </div>
              ))}
            </div>
          </div>

          {/* Ближайшие события */}
          {summary.upcomingEvents.length > 0 && (
            <div>
              <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Ближайшие события
              </h4>
              <div class="space-y-2">
                {summary.upcomingEvents.map((event, index) => (
                  <div key={index} class="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <h5 class="font-medium">{event.name}</h5>
                      <p class="text-sm text-gray-500">{event.location}</p>
                    </div>
                    {event.start_time && (
                      <div class="text-right">
                        <div class="text-sm font-medium">
                          {format(new Date(event.start_time), 'dd MMM, HH:mm', { locale: ru })}
                        </div>
                        <div class="text-xs text-gray-500">
                          через {formatDistanceToNow(new Date(event.start_time), { locale: ru })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center min-h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div class="space-y-6 p-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Расписания мероприятий</h2>
          <p class="mt-1 text-sm text-gray-500">
            Управление и просмотр всех расписаний
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <Button
            type="button"
            onClick={() => window.location.href = '/schedules/new'}
            variant="primary"
            class="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Создать расписание
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow px-5 py-4">
          <div class="text-sm font-medium text-gray-500 truncate">
            Всего расписаний
          </div>
          <div class="mt-1 text-3xl font-semibold text-gray-900">
            {schedules.length}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow px-5 py-4">
          <div class="text-sm font-medium text-gray-500 truncate">
            Активные мероприятия
          </div>
          <div class="mt-1 text-3xl font-semibold text-gray-900">
            {schedules.filter(s => {
              const now = new Date();
              return new Date(s.start_date) <= now && new Date(s.end_date) >= now;
            }).length}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow px-5 py-4">
          <div class="text-sm font-medium text-gray-500 truncate">
            Высокий риск
          </div>
          <div class="mt-1 text-3xl font-semibold text-red-600">
            {schedules.filter(s => (s.risk_score || 0) > 0.7).length}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow px-5 py-4">
          <div class="text-sm font-medium text-gray-500 truncate">
            Предстоящие
          </div>
          <div class="mt-1 text-3xl font-semibold text-green-600">
            {schedules.filter(s => new Date(s.start_date) > new Date()).length}
          </div>
        </div>
      </div>

      {/* Таблица расписаний */}
      <div class="bg-white shadow rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  class="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleScheduleClick(schedule)}
                >
                  {columns.map((column, index) => (
                    <td key={index} class="px-6 py-4 whitespace-nowrap">
                      {column.cell
                        ? column.cell(schedule[column.accessor as keyof Schedule], schedule)
                        : schedule[column.accessor as keyof Schedule]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <Button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="secondary"
              >
                Назад
              </Button>
              <Button
                type="button"
                onClick={() => setPage(page + 1)}
                variant="secondary"
              >
                Вперёд
              </Button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Показано <span class="font-medium">{(page - 1) * pageSize + 1}</span>{' '}
                  по <span class="font-medium">{Math.min(page * pageSize, schedules.length)}</span>{' '}
                  из <span class="font-medium">{schedules.length}</span> расписаний
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    class={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  {/* Номера страниц */}
                  <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Страница {page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно с детальной информацией */}
      <ScheduleSummaryModal />

      {/* Сообщение при отсутствии данных */}
      {schedules.length === 0 && !loading && (
        <div class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Нет расписаний</h3>
          <p class="mt-1 text-sm text-gray-500">
            Начните с создания нового расписания мероприятия.
          </p>
          <div class="mt-6">
            <Button
              type="button"
              onClick={() => window.location.href = '/schedules/new'}
              variant="primary"
            >
              Создать расписание
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};