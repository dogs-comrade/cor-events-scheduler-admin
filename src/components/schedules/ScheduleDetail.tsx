import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Schedule } from '../../api/types';
import { Button } from '../common/Button';
import { BlockTimeline } from './BlockTimeline';
import { Modal } from '../common/Modal';
import { BlockForm } from './BlockForm';
import { ScheduleAnalysis } from './Analysis';
import { formatDateTime } from '../../utils/date';
import { PublicView } from './PublicView';
import { VolunteerView } from './VolunteerView';

interface Props {
  schedule: Schedule;
  onUpdate: (schedule: Schedule) => Promise<void>;
}

export const ScheduleDetail = ({ schedule, onUpdate }: Props) => {
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'analysis' | 'public' | 'volunteer'>('timeline');
  const [isLoading, setIsLoading] = useState(false);

  const handleBlockClick = (block: any) => {
    setSelectedBlock(block);
    setIsBlockModalOpen(true);
  };

  const handleBlockUpdate = async (updatedBlock: any) => {
    if (!schedule.blocks) return;

    const blockIndex = schedule.blocks.findIndex(b => b.id === updatedBlock.id);
    const newBlocks = [...schedule.blocks];

    if (blockIndex === -1) {
      newBlocks.push(updatedBlock);
    } else {
      newBlocks[blockIndex] = updatedBlock;
    }

    try {
      setIsLoading(true);
      await onUpdate({
        ...schedule,
        blocks: newBlocks
      });
      setIsBlockModalOpen(false);
    } catch (error) {
      console.error('Failed to update block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockDelete = async (blockId: number) => {
    if (!schedule.blocks) return;

    try {
      setIsLoading(true);
      await onUpdate({
        ...schedule,
        blocks: schedule.blocks.filter(b => b.id !== blockId)
      });
      setIsBlockModalOpen(false);
    } catch (error) {
      console.error('Failed to delete block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'public', label: 'Public View' },
    { id: 'volunteer', label: 'Volunteer View' }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold">{schedule.name}</h2>
            <p class="text-gray-600 mt-1">{schedule.description}</p>
            <div class="mt-2 space-y-1">
              <p class="text-sm text-gray-600">
                Start: {formatDateTime(schedule.start_date)}
              </p>
              <p class="text-sm text-gray-600">
                End: {formatDateTime(schedule.end_date)}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
            <Button 
              variant="primary"
              onClick={() => window.location.href = `/schedules/${schedule.id}/edit`}
            >
              Edit Details
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              class={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div class="bg-white shadow rounded-lg">
        {activeTab === 'timeline' && (
          <div class="p-6">
            <BlockTimeline
              blocks={schedule.blocks || []}
              onBlockClick={handleBlockClick}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div class="p-6">
            <ScheduleAnalysis schedule={schedule} />
          </div>
        )}

        {activeTab === 'public' && schedule.id && (
          <div class="p-6">
            <PublicView scheduleId={schedule.id} />
          </div>
        )}

        {activeTab === 'volunteer' && schedule.id && (
          <div class="p-6">
            <VolunteerView scheduleId={schedule.id} />
          </div>
        )}
      </div>

      {/* Block Edit Modal */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title={selectedBlock?.id ? 'Edit Block' : 'Add Block'}
        size="lg"
      >
        <BlockForm
          block={selectedBlock || {
            name: '',
            duration: 0,
            order: (schedule.blocks?.length || 0) + 1
          }}
          onUpdate={handleBlockUpdate}
          onDelete={selectedBlock?.id ? () => handleBlockDelete(selectedBlock.id) : undefined}
        />
      </Modal>
    </div>
  );
};