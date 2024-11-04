// src/components/schedules/BlockForm.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Block, Equipment, RiskFactor, BlockItem, Participant } from '../../api/types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Modal } from '../common/Modal';

interface Props {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
}

export interface CustomEventType {
  id: number;
  name: string;
  color: string;
}

const defaultEventTypes = [
  { value: 'performance', label: 'Выступление' },
  { value: 'setup', label: 'Подготовка' },
  { value: 'break', label: 'Перерыв' },
  { value: 'other', label: 'Другое' }
];

const riskTypes = [
  { value: 'weather', label: 'Погодные условия' },
  { value: 'technical', label: 'Технические проблемы' },
  { value: 'logistics', label: 'Логистика' },
  { value: 'other', label: 'Другое' }
];

export const BlockForm = ({ block, onUpdate, onDelete }: Props) => {
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
  const [newCustomType, setNewCustomType] = useState({ name: '', color: '#000000' });
  const [customTypes, setCustomTypes] = useState<CustomEventType[]>([]);

  const handleChange = (e: Event) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    const value = target.type === 'number' ? parseFloat(target.value) : target.value;
    
    onUpdate({
      ...block,
      [target.name]: value
    });
  };

  const handleEquipmentAdd = (e: Event) => {
    e.preventDefault();
    onUpdate({
      ...block,
      equipment: [...(block.equipment || []), {
        name: '',
        type: '',
        setup_time: 0,
        complexity_score: 0
      }]
    });
  };

  const handleRiskFactorAdd = (e: Event) => {
    e.preventDefault();
    onUpdate({
      ...block,
      risk_factors: [...(block.risk_factors || []), {
        type: '',
        probability: 0,
        impact: 0,
        mitigation: ''
      }]
    });
  };

  const handleBlockItemAdd = (e: Event) => {
    e.preventDefault();
    onUpdate({
      ...block,
      items: [...(block.items || []), {
        name: '',
        description: '',
        duration: 30,
        type: block.type,
        requirements: '',
        order: (block.items?.length || 0) + 1,
        equipment: [],
        participants: []
      }]
    });
  };

  const handleParticipantAdd = (e: Event, blockItemIndex: number) => {
    e.preventDefault();
    const newItems = [...(block.items || [])];
    const item = newItems[blockItemIndex];
    
    if (item) {
      item.participants = [...(item.participants || []), {
        name: '',
        role: '',
        requirements: ''
      }];
      
      onUpdate({
        ...block,
        items: newItems
      });
    }
  };

  const handleAddCustomType = (e: Event) => {
    e.preventDefault();
    const newType: CustomEventType = {
      id: customTypes.length + 1,
      name: newCustomType.name,
      color: newCustomType.color
    };
    setCustomTypes([...customTypes, newType]);
    setShowCustomTypeModal(false);
    setNewCustomType({ name: '', color: '#000000' });
  };

  const getEventTypeOptions = () => {
    const customOptions = customTypes.map(type => ({
      value: type.name.toLowerCase(),
      label: type.name
    }));

    return [...defaultEventTypes, ...customOptions];
  };

  return (
    <div class="space-y-6 bg-white rounded-lg p-6">
      {/* Основная информация о блоке */}
      <div class="border-b border-gray-200 pb-4 mb-6">
        <h3 class="text-lg font-medium text-gray-900">Основная информация</h3>
        <p class="mt-1 text-sm text-gray-500">
          Укажите основные параметры блока мероприятия
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Название блока"
          name="name"
          value={block.name}
          onChange={handleChange}
          required
          placeholder="Например: Выступление главной группы"
        />
        <Input
          label="Длительность (минуты)"
          name="duration"
          type="number"
          value={block.duration}
          onChange={handleChange}
          required
          min="1"
          placeholder="Укажите длительность в минутах"
        />
        <Input
          label="Место проведения"
          name="location"
          value={block.location}
          onChange={handleChange}
          placeholder="Например: Главная сцена"
        />
        <div>
          <div class="flex items-end gap-2">
            <div class="flex-grow">
              <Select
                label="Тип мероприятия"
                name="type"
                value={block.type}
                onChange={handleChange}
                options={getEventTypeOptions()}
                placeholder="Выберите тип мероприятия"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCustomTypeModal(true)}
              class="mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Добавить тип
            </Button>
          </div>
        </div>
        <Input
          label="Сложность (0-1)"
          name="complexity"
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={block.complexity}
          onChange={handleChange}
          placeholder="Оценка сложности от 0 до 1"
        />
        <Input
          label="Максимум участников"
          name="max_participants"
          type="number"
          value={block.max_participants}
          onChange={handleChange}
          min="0"
          placeholder="Максимальное количество участников"
        />
        <Input
          label="Необходимый персонал"
          name="required_staff"
          type="number"
          value={block.required_staff}
          onChange={handleChange}
          min="0"
          placeholder="Количество необходимого персонала"
        />
        <Input
          label="Технический перерыв (минуты)"
          name="tech_break_duration"
          type="number"
          value={block.tech_break_duration}
          onChange={handleChange}
          min="0"
          placeholder="Длительность технического перерыва"
        />
      </div>
{/* Секция суб-блоков (BlockItems) */}
<div class="mt-8">
        <div class="border-t border-gray-200 pt-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h4 class="text-lg font-medium text-gray-900">Элементы блока</h4>
              <p class="mt-1 text-sm text-gray-500">
                Добавьте отдельные элементы или части этого блока
              </p>
            </div>
            <Button 
              type="button"
              variant="secondary" 
              onClick={handleBlockItemAdd}
              class="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Добавить элемент
            </Button>
          </div>

          {block.items?.map((item, itemIndex) => (
            <div key={itemIndex} class="mb-6 p-6 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div class="flex justify-between items-center mb-4">
                <h5 class="text-lg font-medium text-gray-900">
                  Элемент {itemIndex + 1}: {item.name || 'Новый элемент'}
                </h5>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    const newItems = block.items?.filter((_, i) => i !== itemIndex);
                    onUpdate({ ...block, items: newItems });
                  }}
                >
                  Удалить
                </Button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Название элемента"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...(block.items || [])];
                    newItems[itemIndex] = { ...item, name: (e.target as HTMLInputElement).value };
                    onUpdate({ ...block, items: newItems });
                  }}
                  placeholder="Название части блока"
                />
                <Input
                  label="Длительность (минуты)"
                  type="number"
                  value={item.duration}
                  onChange={(e) => {
                    const newItems = [...(block.items || [])];
                    newItems[itemIndex] = { ...item, duration: parseInt((e.target as HTMLInputElement).value) };
                    onUpdate({ ...block, items: newItems });
                  }}
                  min="1"
                  placeholder="Время в минутах"
                />
                <Input
                  label="Описание"
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...(block.items || [])];
                    newItems[itemIndex] = { ...item, description: (e.target as HTMLInputElement).value };
                    onUpdate({ ...block, items: newItems });
                  }}
                  type="textarea"
                  placeholder="Подробное описание элемента"
                />
                <Input
                  label="Требования"
                  value={item.requirements}
                  onChange={(e) => {
                    const newItems = [...(block.items || [])];
                    newItems[itemIndex] = { ...item, requirements: (e.target as HTMLInputElement).value };
                    onUpdate({ ...block, items: newItems });
                  }}
                  type="textarea"
                  placeholder="Технические или другие требования"
                />
                <Select
                  label="Тип"
                  value={item.type}
                  onChange={(e) => {
                    const newItems = [...(block.items || [])];
                    newItems[itemIndex] = { ...item, type: (e.target as HTMLSelectElement).value };
                    onUpdate({ ...block, items: newItems });
                  }}
                  options={getEventTypeOptions()}
                  placeholder="Выберите тип элемента"
                />
                <Input
                  label="Порядковый номер"
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const newItems = [...(block.items || [])];
                    newItems[itemIndex] = { ...item, order: parseInt((e.target as HTMLInputElement).value) };
                    onUpdate({ ...block, items: newItems });
                  }}
                  min="1"
                  placeholder="Порядок выполнения"
                />
              </div>

              {/* Участники элемента */}
              <div class="mt-6 border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center mb-4">
                  <div>
                    <h6 class="font-medium text-gray-900">Участники</h6>
                    <p class="mt-1 text-sm text-gray-500">
                      Добавьте участников этого элемента
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => handleParticipantAdd(e, itemIndex)}
                    class="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Добавить участника
                  </Button>
                </div>

                <div class="space-y-4">
                  {item.participants?.map((participant, participantIndex) => (
                    <div key={participantIndex} class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
                      <Input
                        label="Имя участника"
                        value={participant.name}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          const newParticipants = [...(item.participants || [])];
                          newParticipants[participantIndex] = {
                            ...participant,
                            name: (e.target as HTMLInputElement).value
                          };
                          newItems[itemIndex] = { ...item, participants: newParticipants };
                          onUpdate({ ...block, items: newItems });
                        }}
                        placeholder="ФИО участника"
                      />
                      <Input
                        label="Роль"
                        value={participant.role}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          const newParticipants = [...(item.participants || [])];
                          newParticipants[participantIndex] = {
                            ...participant,
                            role: (e.target as HTMLInputElement).value
                          };
                          newItems[itemIndex] = { ...item, participants: newParticipants };
                          onUpdate({ ...block, items: newItems });
                        }}
                        placeholder="Роль в мероприятии"
                      />
                      <div class="relative">
                        <Input
                          label="Требования"
                          value={participant.requirements}
                          onChange={(e) => {
                            const newItems = [...(block.items || [])];
                            const newParticipants = [...(item.participants || [])];
                            newParticipants[participantIndex] = {
                              ...participant,
                              requirements: (e.target as HTMLInputElement).value
                            };
                            newItems[itemIndex] = { ...item, participants: newParticipants };
                            onUpdate({ ...block, items: newItems });
                          }}
                          placeholder="Особые требования"
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          class="absolute top-0 right-0"
                          onClick={(e) => {
                            e.preventDefault();
                            const newItems = [...(block.items || [])];
                            const newParticipants = item.participants?.filter((_, i) => i !== participantIndex);
                            newItems[itemIndex] = { ...item, participants: newParticipants };
                            onUpdate({ ...block, items: newItems });
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Секция оборудования */}
      <div class="mt-8 border-t border-gray-200 pt-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Оборудование</h4>
            <p class="mt-1 text-sm text-gray-500">
              Укажите необходимое оборудование для блока
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleEquipmentAdd}
            class="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            Добавить оборудование
          </Button>
        </div>

        <div class="space-y-4">
          {block.equipment?.map((equipment, index) => (
            <div key={index} class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
              <Input
                label="Название"
                value={equipment.name}
                onChange={(e) => {
                  const newEquipment = [...(block.equipment || [])];
                  newEquipment[index] = { ...equipment, name: (e.target as HTMLInputElement).value };
                  onUpdate({ ...block, equipment: newEquipment });
                }}
                placeholder="Название оборудования"
              />
              <Input
                label="Тип"
                value={equipment.type}
                onChange={(e) => {
                  const newEquipment = [...(block.equipment || [])];
                  newEquipment[index] = { ...equipment, type: (e.target as HTMLInputElement).value };
                  onUpdate({ ...block, equipment: newEquipment });
                }}
                placeholder="Тип оборудования"
              />
              <Input
                label="Время установки (мин)"
                type="number"
                value={equipment.setup_time}
                onChange={(e) => {
                  const newEquipment = [...(block.equipment || [])];
                  newEquipment[index] = { 
                    ...equipment, 
                    setup_time: parseInt((e.target as HTMLInputElement).value) 
                  };
                  onUpdate({ ...block, equipment: newEquipment });
                }}
                min="0"
                placeholder="Время на установку"
              />
              <div class="flex items-end">
                <Button
                  type="button"
                  variant="danger"
                  onClick={(e) => {
                    e.preventDefault();
                    const newEquipment = block.equipment?.filter((_, i) => i !== index);
                    onUpdate({ ...block, equipment: newEquipment });
                  }}
                  class="w-full"
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Секция факторов риска */}
      <div class="mt-8 border-t border-gray-200 pt-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h4 class="text-lg font-medium text-gray-900">Факторы риска</h4>
            <p class="mt-1 text-sm text-gray-500">
              Укажите возможные риски и меры их предотвращения
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRiskFactorAdd}
            class="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Добавить фактор риска
          </Button>
        </div>

        <div class="space-y-4">
          {block.risk_factors?.map((risk, index) => (
            <div key={index} class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
              <Select
                label="Тип риска"
                value={risk.type}
                onChange={(e) => {
                  const newRisks = [...(block.risk_factors || [])];
                  newRisks[index] = { ...risk, type: (e.target as HTMLSelectElement).value };
                  onUpdate({ ...block, risk_factors: newRisks });
                }}
                options={riskTypes}
                placeholder="Выберите тип риска"
              />
              <Input
                label="Вероятность (0-1)"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={risk.probability}
                onChange={(e) => {
                  const newRisks = [...(block.risk_factors || [])];
                  newRisks[index] = { 
                    ...risk, 
                    probability: parseFloat((e.target as HTMLInputElement).value) 
                  };
                  onUpdate({ ...block, risk_factors: newRisks });
                }}
                placeholder="Оценка вероятности"
              />
              <Input
                label="Влияние (0-1)"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={risk.impact}
                onChange={(e) => {
                  const newRisks = [...(block.risk_factors || [])];
                  newRisks[index] = { 
                    ...risk, 
                    impact: parseFloat((e.target as HTMLInputElement).value) 
                  };
                  onUpdate({ ...block, risk_factors: newRisks });
                }}
                placeholder="Степень влияния"
              />
              <div class="flex flex-col">
                <Input
                  label="Меры снижения"
                  value={risk.mitigation}
                  onChange={(e) => {
                    const newRisks = [...(block.risk_factors || [])];
                    newRisks[index] = { ...risk, mitigation: (e.target as HTMLInputElement).value };
                    onUpdate({ ...block, risk_factors: newRisks });
                  }}
                  placeholder="Как предотвратить риск"
                />
                <Button
                  type="button"
                  variant="danger"
                  onClick={(e) => {
                    e.preventDefault();
                    const newRisks = block.risk_factors?.filter((_, i) => i !== index);
                    onUpdate({ ...block, risk_factors: newRisks });
                  }}
                  class="mt-2"
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно для добавления кастомного типа */}
      <Modal
        isOpen={showCustomTypeModal}
        onClose={() => setShowCustomTypeModal(false)}
        title="Добавление нового типа мероприятия"
      >
        <div class="space-y-4">
          <Input
            label="Название типа"
            value={newCustomType.name}
            onChange={(e) => setNewCustomType(prev => ({
              ...prev,
              name: (e.target as HTMLInputElement).value
            }))}
            required
            placeholder="Например: Мастер-класс"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Цвет для обозначения
            </label>
            <div class="flex gap-4 items-center">
              <input
                type="color"
                value={newCustomType.color}
                onChange={(e) => setNewCustomType(prev => ({
                  ...prev,
                  color: (e.target as HTMLInputElement).value
                }))}
                class="h-10 w-20 rounded border border-gray-300"
              />
              <span class="text-sm text-gray-600">
                Выберите цвет для отображения этого типа в расписании
              </span>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                setShowCustomTypeModal(false);
              }}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddCustomType}
              disabled={!newCustomType.name}
            >
              Добавить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Кнопки управления блоком */}
      <div class="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <div class="text-sm text-gray-500">
          {block.id ? (
            <p>ID блока: {block.id}</p>
          ) : (
            <p>Новый блок</p>
          )}
        </div>
        <Button 
          type="button"
          variant="danger" 
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          class="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Удалить блок
        </Button>
      </div>
    </div>
  );
};