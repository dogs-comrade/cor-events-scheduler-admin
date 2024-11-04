import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { analyzeSchedule, optimizeSchedule, fetchSchedule } from '../api/schedules';
import { Schedule } from '../api/types';
import { Button } from '../components/common/Button';

interface Props {
  id: string;
}

export const Analysis = ({ id }: Props) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, [id]);

  const loadSchedule = async () => {
    try {
      const response = await fetchSchedule(parseInt(id));
      setSchedule(response.data);
      await performAnalysis(response.data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = async (scheduleData: Schedule) => {
    try {
      const analysisResponse = await analyzeSchedule(scheduleData);
      setAnalysis(analysisResponse.data);
    } catch (error) {
      console.error('Failed to analyze schedule:', error);
    }
  };

  const handleOptimize = async () => {
    if (!schedule) return;
    try {
      const response = await optimizeSchedule(schedule);
      setOptimization(response.data);
    } catch (error) {
      console.error('Failed to optimize schedule:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!schedule) return <div>Schedule not found</div>;

  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Schedule Analysis</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Risk Analysis</h2>
          {analysis && (
            <div>
              <p class="mb-2">
                Overall Risk Score: <span class="font-bold">{analysis.risk_score.toFixed(2)}</span>
              </p>
              <div class="mt-4">
                <h3 class="text-lg font-medium mb-2">Recommendations:</h3>
                <ul class="list-disc pl-5">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} class="mb-1">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Time Analysis</h2>
          {analysis?.time_analysis && (
            <div>
              {analysis.time_analysis.map((item: any, index: number) => (
                <div key={index} class="mb-2">
                  <p class="font-medium">{item.block}</p>
                  <p class="text-sm text-gray-600">{item.analysis}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div class="mt-6">
        <Button onClick={handleOptimize} variant="primary">
          Optimize Schedule
        </Button>
      </div>

      {optimization && (
        <div class="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Optimization Results</h2>
          <div class="space-y-4">
            {Object.entries(optimization.improvements).map(([key, value]: [string, any]) => (
              <div key={key}>
                <h3 class="font-medium">{key}</h3>
                <p class="text-sm text-gray-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};