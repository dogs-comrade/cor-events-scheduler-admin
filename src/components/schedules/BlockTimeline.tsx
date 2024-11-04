import { h } from 'preact';
import { Block } from '../../api/types';
import { formatTime } from '../../utils/date';

interface Props {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
}

export const BlockTimeline = ({ blocks, onBlockClick }: Props) => {
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (!a.start_time || !b.start_time) return 0;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div class="overflow-x-auto">
      <div class="min-w-full p-4">
        <div class="relative">
          {sortedBlocks.map((block, index) => (
            <div
              key={block.id || index}
              class="flex items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => onBlockClick(block)}
            >
              <div class="w-24 flex-shrink-0 text-sm text-gray-600">
                {block.start_time ? formatTime(block.start_time) : 'Not set'}
              </div>
              <div 
                class={`
                  flex-grow p-3 rounded shadow
                  ${block.type === 'performance' ? 'bg-blue-100' : ''}
                  ${block.type === 'setup' ? 'bg-green-100' : ''}
                  ${block.type === 'break' ? 'bg-gray-100' : ''}
                `}
                style={{
                  width: `${(block.duration || 0) / 5}%`,
                  minWidth: '100px'
                }}
              >
                <div class="font-medium">{block.name}</div>
                <div class="text-sm text-gray-600">
                  {block.location} • {block.duration} min
                </div>
                {block.complexity !== undefined && (
                  <div class="mt-1">
                    <span class={`
                      text-xs px-2 py-1 rounded
                      ${block.complexity > 0.7 ? 'bg-red-200 text-red-800' : ''}
                      ${block.complexity > 0.3 && block.complexity <= 0.7 ? 'bg-yellow-200 text-yellow-800' : ''}
                      ${block.complexity <= 0.3 ? 'bg-green-200 text-green-800' : ''}
                    `}>
                      Complexity: {(block.complexity * 100).toFixed()}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};