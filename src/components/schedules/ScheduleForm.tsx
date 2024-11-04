// src/components/schedules/ScheduleForm.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Schedule, Block } from '../../api/types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { BlockForm } from './BlockForm';

interface Props {
  initialData?: Schedule;
  onSubmit: (data: Schedule) => Promise<void>;
}

const formatDateForServer = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString();
};

const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);
};

export const ScheduleForm = ({ initialData, onSubmit }: Props) => {
  const [formData, setFormData] = useState<Schedule>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    buffer_time: 30,
    blocks: [],
    ...initialData,
    // Преобразуем даты для input type="datetime-local"
    start_date: initialData?.start_date ? formatDateForInput(initialData.start_date) : '',
    end_date: initialData?.end_date ? formatDateForInput(initialData.end_date) : ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название расписания обязательно';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Укажите дату начала';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Укажите дату окончания';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (start >= end) {
        newErrors.end_date = 'Дата окончания должна быть позже даты начала';
      }
    }

    if (formData.buffer_time && (formData.buffer_time < 0 || formData.buffer_time > 180)) {
      newErrors.buffer_time = 'Буферное время должно быть от 0 до 180 минут';
    }

    // Проверка блоков
    if (formData.blocks?.length) {
      formData.blocks.forEach((block, index) => {
        if (!block.name.trim()) {
          newErrors[`block_${index}_name`] = 'Укажите название блока';
        }
        if (!block.duration || block.duration <= 0) {
          newErrors[`block_${index}_duration`] = 'Длительность должна быть больше 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    let value: string | number = target.value;

    // Обработка числовых значений
    if (target.type === 'number') {
      value = target.value ? parseInt(target.value, 10) : '';
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlockAdd = (e: Event) => {
    e.preventDefault();
    const nextOrder = Math.max(0, ...(formData.blocks?.map(b => b.order || 0) || [])) + 1;
    
    setFormData(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), {
        name: '',
        duration: 30, // Значение по умолчанию
        order: nextOrder,
        type: 'other',
        complexity: 0,
        equipment: [],
        items: [],
        risk_factors: []
      }]
    }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (isSubmitting) return;

    setGlobalError('');
    if (!validateForm()) {
      setGlobalError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    try {
      setIsSubmitting(true);

      // Форматируем даты для отправки на сервер
      const dataToSubmit = {
        ...formData,
        start_date: formatDateForServer(formData.start_date),
        end_date: formatDateForServer(formData.end_date),
        blocks: formData.blocks?.map(block => ({
          ...block,
          start_time: block.start_time ? formatDateForServer(block.start_time) : undefined
        }))
      };

      await onSubmit(dataToSubmit);
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error.response?.data?.error) {
        setGlobalError(error.response.data.error);
      } else if (error.message) {
        setGlobalError(error.message);
      } else {
        setGlobalError('Произошла ошибка при сохранении расписания');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e: Event) => {
    e.preventDefault();
    if (Object.keys(formData).some(key => !!formData[key as keyof Schedule])) {
      if (confirm('Несохраненные изменения будут потеряны. Продолжить?')) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  return (
    <div class="p-6">
      <form onSubmit={handleSubmit} class="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Заголовок формы */}
        <div class="border-b border-gray-200 pb-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-1">
            {initialData ? 'Редактирование расписания' : 'Создание нового расписания'}
          </h2>
          <p class="text-sm text-gray-500">
            Заполните основную информацию о расписании мероприятия
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {globalError && (
          <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600">{globalError}</p>
          </div>
        )}

        {/* Основная информация */}
        <div class="space-y-8">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="space-y-6">
              <Input
                label="Название расписания"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Например: Летний фестиваль 2024"
                error={errors.name}
              />
              <Input
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Краткое описание мероприятия"
                type="textarea"
                error={errors.description}
              />
            </div>
            <div class="space-y-6">
              <Input
                label="Дата и время начала"
                name="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                error={errors.start_date}
              />
              <Input
                label="Дата и время окончания"
                name="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                error={errors.end_date}
              />
              <Input
                label="Буферное время (минуты)"
                name="buffer_time"
                type="number"
                value={formData.buffer_time}
                onChange={handleInputChange}
                min="0"
                max="180"
                placeholder="Время между блоками"
                error={errors.buffer_time}
              />
            </div>
          </div>

          {/* Блоки расписания */}
          <div class="mt-12">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Блоки расписания</h3>
                <p class="text-sm text-gray-500">Добавьте блоки мероприятий и их детали</p>
              </div>
              <Button
                type="button"
                onClick={handleBlockAdd}
                variant="secondary"
                class="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Добавить блок
              </Button>
            </div>

            <div class="space-y-6">
              {formData.blocks?.map((block, index) => (
                <div key={index} class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-medium text-gray-900">
                      Блок {index + 1}: {block.name || 'Новый блок'}
                    </h4>
                    <div class="flex items-center space-x-4">
                      <span class="text-sm text-gray-500">
                        Длительность: {block.duration || 0} мин
                      </span>
                      {block.type && (
                        <span class="text-sm px-2 py-1 rounded-full bg-gray-200">
                          {block.type}
                        </span>
                      )}
                    </div>
                  </div>
                  {errors[`block_${index}_name`] && (
                    <div class="mb-4 text-sm text-red-600">
                      {errors[`block_${index}_name`]}
                    </div>
                  )}
                  <BlockForm
                    block={block}
                    onUpdate={(updatedBlock) => {
                      const newBlocks = [...(formData.blocks || [])];
                      newBlocks[index] = updatedBlock;
                      setFormData(prev => ({ ...prev, blocks: newBlocks }));
                    }}
                    onDelete={() => {
                      if (confirm('Вы уверены, что хотите удалить этот блок?')) {
                        const newBlocks = formData.blocks?.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, blocks: newBlocks }));
                      }
                    }}
                  />
                </div>
              ))}

              {!formData.blocks?.length && (
                <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg 
                    class="mx-auto h-12 w-12 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">Нет блоков</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Начните с добавления первого блока расписания
                  </p>
                  <div class="mt-6">
                    <Button
                      type="button"
                      onClick={handleBlockAdd}
                      variant="secondary"
                    >
                      Добавить блок
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки управления */}
        <div class="mt-12 pt-6 border-t border-gray-200 flex justify-between">
          <div class="text-sm text-gray-500">
            {formData.id ? `ID расписания: ${formData.id}` : 'Новое расписание'}
          </div>
          <div class="flex gap-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              class="px-6"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              class="px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить расписание'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};