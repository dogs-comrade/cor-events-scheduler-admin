import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Schedule } from '../../api/types';
import { analyzeSchedule } from '../../api/schedules';

interface Props {
  schedule: Schedule;
}

export const ScheduleAnalysis = ({ schedule }: Props) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performAnalysis();
  }, [schedule]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const response = await analyzeSchedule(schedule);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to analyze schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Analyzing schedule...</div>;

  if (!analysis) return null;

  const getRiskColor = (score: number) => {
    if (score < 0.3) return 'text-green-600';
    if (score < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Risk Analysis</h3>
        <div class="flex items-center mb-4">
          <span class="text-lg font-bold mr-2">Overall Risk Score:</span>
          <span class={`text-lg font-bold ${getRiskColor(analysis.risk_score)}`}>
            {analysis.risk_score.toFixed(2)}
          </span>
        </div>
        
        <h4 class="font-medium mb-2">Recommendations:</h4>
        <ul class="list-disc pl-5 space-y-2">
          {analysis.recommendations.map((rec: string, index: number) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Time Analysis</h3>
        <div class="space-y-4">
          {analysis.time_analysis.map((item: any, index: number) => (
            <div key={index} class="border-b pb-4">
              <h4 class="font-medium">{item.block_name}</h4>
              <p class="text-sm text-gray-600 mt-1">{item.analysis}</p>
              {item.warnings && (
                <p class="text-sm text-yellow-600 mt-1">{item.warnings}</p>
              )}
              {item.suggestions && (
                <p class="text-sm text-blue-600 mt-1">{item.suggestions}</p>
            )}
            {item.conflicts && (
              <div class="mt-2">
                <h5 class="text-sm font-medium text-red-600">Potential Conflicts:</h5>
                <ul class="list-disc pl-5">
                  {item.conflicts.map((conflict: string, idx: number) => (
                    <li key={idx} class="text-sm text-red-600">{conflict}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium mb-4">Resource Analysis</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium mb-2">Equipment Usage</h4>
          {analysis.resource_analysis?.equipment.map((item: any, index: number) => (
            <div key={index} class="mb-2">
              <div class="flex justify-between items-center">
                <span>{item.name}</span>
                <span class={`font-medium ${item.utilization > 0.8 ? 'text-red-600' : 'text-green-600'}`}>
                  {(item.utilization * 100).toFixed(1)}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class={`h-2 rounded-full ${item.utilization > 0.8 ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ width: `${item.utilization * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <h4 class="font-medium mb-2">Staff Requirements</h4>
          {analysis.resource_analysis?.staff.map((item: any, index: number) => (
            <div key={index} class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <span>{item.timeSlot}</span>
                <span class={`font-medium ${item.shortage ? 'text-red-600' : 'text-green-600'}`}>
                  {item.required}/{item.available} staff
                </span>
              </div>
              {item.shortage && (
                <p class="text-sm text-red-600">
                  Shortage: {item.shortage} staff members needed
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};