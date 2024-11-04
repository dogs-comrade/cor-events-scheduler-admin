// src/pages/Dashboard.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fetchSchedules } from '../api/schedules';
import { Schedule } from '../api/types';
import { formatDateTime } from '../utils/date';
import { Link } from 'preact-router';

interface DashboardStats {
  totalSchedules: number;
  upcomingEvents: number;
  activeEvents: number;
  averageRiskScore: number;
  highRiskSchedules: number;
}

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

export const Dashboard = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchedules: 0,
    upcomingEvents: 0,
    activeEvents: 0,
    averageRiskScore: 0,
    highRiskSchedules: 0
  });
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>({
    low: 0,
    medium: 0,
    high: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetchSchedules(1, 100); // Get more schedules for dashboard
      const scheduleData = response.data.data;
      setSchedules(scheduleData);
      calculateStats(scheduleData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (scheduleData: Schedule[]) => {
    const now = new Date();
    const upcomingEvents = scheduleData.filter(
      schedule => new Date(schedule.start_date) > now
    ).length;

    const activeEvents = scheduleData.filter(
      schedule => {
        const startDate = new Date(schedule.start_date);
        const endDate = new Date(schedule.end_date);
        return startDate <= now && endDate >= now;
      }
    ).length;

    const riskScores = scheduleData
      .filter(schedule => schedule.risk_score !== undefined)
      .map(schedule => schedule.risk_score!);

    const averageRisk = riskScores.length > 0
      ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
      : 0;

    const highRisk = scheduleData.filter(
      schedule => (schedule.risk_score || 0) > 0.7
    ).length;

    // Calculate risk distribution
    const distribution = {
      low: scheduleData.filter(s => (s.risk_score || 0) <= 0.3).length,
      medium: scheduleData.filter(s => (s.risk_score || 0) > 0.3 && (s.risk_score || 0) <= 0.7).length,
      high: scheduleData.filter(s => (s.risk_score || 0) > 0.7).length
    };

    setStats({
      totalSchedules: scheduleData.length,
      upcomingEvents,
      activeEvents,
      averageRiskScore: averageRisk,
      highRiskSchedules: highRisk
    });

    setRiskDistribution(distribution);
  };

  if (loading) {
    return (
      <div class="p-6">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-gray-200 rounded w-1/4"></div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} class="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, description, colorClass }: {
    title: string;
    value: number | string;
    description?: string;
    colorClass?: string;
  }) => (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900">{title}</h3>
          <p class={`text-3xl font-bold mt-2 ${colorClass || 'text-gray-900'}`}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}
          </p>
          {description && (
            <p class="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const RiskDistributionBar = () => {
    const total = riskDistribution.low + riskDistribution.medium + riskDistribution.high;
    const lowPercent = (riskDistribution.low / total) * 100;
    const mediumPercent = (riskDistribution.medium / total) * 100;
    const highPercent = (riskDistribution.high / total) * 100;

    return (
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
        <div class="h-4 flex rounded overflow-hidden">
          <div
            class="bg-green-500"
            style={{ width: `${lowPercent}%` }}
            title={`Low Risk: ${riskDistribution.low}`}
          ></div>
          <div
            class="bg-yellow-500"
            style={{ width: `${mediumPercent}%` }}
            title={`Medium Risk: ${riskDistribution.medium}`}
          ></div>
          <div
            class="bg-red-500"
            style={{ width: `${highPercent}%` }}
            title={`High Risk: ${riskDistribution.high}`}
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-sm">
          <span class="text-green-600">Low: {riskDistribution.low}</span>
          <span class="text-yellow-600">Medium: {riskDistribution.medium}</span>
          <span class="text-red-600">High: {riskDistribution.high}</span>
        </div>
      </div>
    );
  };

  const UpcomingEvents = () => (
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
        <div class="space-y-4">
          {schedules
            .filter(schedule => new Date(schedule.start_date) > new Date())
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .slice(0, 5)
            .map(schedule => (
              <Link 
                key={schedule.id}
                href={`/schedules/${schedule.id}`}
                class="block hover:bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{schedule.name}</h4>
                    <p class="text-sm text-gray-500 mt-1">
                      {formatDateTime(schedule.start_date)}
                    </p>
                  </div>
                  {schedule.risk_score !== undefined && (
                    <span 
                      class={`
                        px-2 py-1 text-sm rounded-full
                        ${schedule.risk_score > 0.7 ? 'bg-red-100 text-red-800' : ''}
                        ${schedule.risk_score > 0.3 && schedule.risk_score <= 0.7 ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${schedule.risk_score <= 0.3 ? 'bg-green-100 text-green-800' : ''}
                      `}
                    >
                      Risk: {(schedule.risk_score * 100).toFixed()}%
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>
        <Link 
          href="/schedules"
          class="block text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
        >
          View all schedules →
        </Link>
      </div>
    </div>
  );

  const ActiveNow = () => {
    const now = new Date();
    const activeSchedules = schedules.filter(schedule => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      return startDate <= now && endDate >= now;
    });

    return (
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Active Now</h3>
          {activeSchedules.length > 0 ? (
            <div class="space-y-4">
              {activeSchedules.map(schedule => (
                <Link
                  key={schedule.id}
                  href={`/schedules/${schedule.id}`}
                  class="block hover:bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-900">{schedule.name}</h4>
                      <p class="text-sm text-gray-500 mt-1">
                        Ends: {formatDateTime(schedule.end_date)}
                      </p>
                    </div>
                    <span class="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Active
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p class="text-gray-500 text-center py-4">No active events</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/schedules/new"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Schedule
        </Link>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Schedules"
          value={stats.totalSchedules}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents}
          colorClass="text-green-600"
        />
        <StatCard
          title="Average Risk Score"
          value={`${(stats.averageRiskScore * 100).toFixed()}%`}
          colorClass={`
            ${stats.averageRiskScore > 0.7 ? 'text-red-600' : ''}
            ${stats.averageRiskScore > 0.3 && stats.averageRiskScore <= 0.7 ? 'text-yellow-600' : ''}
            ${stats.averageRiskScore <= 0.3 ? 'text-green-600' : ''}
          `}
        />
      </div>

      {/* Risk Distribution */}
      <RiskDistributionBar />

      {/* Events Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingEvents />
        <ActiveNow />
      </div>
    </div>
  );
};