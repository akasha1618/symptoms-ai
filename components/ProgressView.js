'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PERIODS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: 'All time', value: 0 }
];

export default function ProgressView({ user }) {
  const [symptoms, setSymptoms] = useState([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchSymptoms = async () => {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!error) setSymptoms(data || []);
      setLoading(false);
    };
    fetchSymptoms();
  }, [user]);

  // Filter symptoms by selected period
  const filteredSymptoms = useMemo(() => {
    if (period === 0) return symptoms;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period + 1);
    return symptoms.filter(s => new Date(s.date) >= cutoff);
  }, [symptoms, period]);

  // Line chart: average severity per day
  const lineChartData = useMemo(() => {
    if (filteredSymptoms.length === 0) return null;
    // Group by date
    const grouped = {};
    filteredSymptoms.forEach(s => {
      const d = new Date(s.date).toISOString().split('T')[0];
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(s.severity);
    });
    // Sort dates ascending
    const dates = Object.keys(grouped).sort();
    const avgSeverities = dates.map(d => {
      const vals = grouped[d];
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    return {
      labels: dates,
      datasets: [
        {
          label: 'Avg Severity',
          data: avgSeverities,
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        }
      ]
    };
  }, [filteredSymptoms]);

  // Pie chart: distribution by category
  const pieChartData = useMemo(() => {
    if (filteredSymptoms.length === 0) return null;
    const counts = {};
    filteredSymptoms.forEach(s => {
      const cat = s.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const categories = Object.keys(counts);
    const values = Object.values(counts);
    const colors = [
      '#6366f1', '#f59e42', '#10b981', '#ef4444', '#fbbf24', '#3b82f6', '#a21caf', '#eab308', '#14b8a6', '#f472b6'
    ];
    return {
      labels: categories,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }, [filteredSymptoms]);

  const getRecentSymptoms = () => {
    const last7Days = symptoms.filter(s => {
      const symptomDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return symptomDate >= weekAgo;
    });
    return last7Days;
  };

  const getAverageSeverity = () => {
    if (symptoms.length === 0) return 0;
    const total = symptoms.reduce((sum, s) => sum + s.severity, 0);
    return (total / symptoms.length).toFixed(1);
  };

  const getMostCommonSymptoms = () => {
    const symptomCounts = {};
    symptoms.forEach(s => {
      symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1;
    });
    return Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading progress data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Progress Overview</h2>
        <p className="text-gray-600 text-sm">
          Track your symptom patterns and trends over time
        </p>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
        <div className="flex justify-center space-x-2">
          {PERIODS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                period === opt.value 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Symptoms</p>
              <p className="text-2xl font-bold">{filteredSymptoms.length}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avg Severity</p>
              <p className="text-2xl font-bold">{getAverageSeverity()}</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">This Week</p>
              <p className="text-2xl font-bold">{getRecentSymptoms().length}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Severity Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Severity Trend
          </h3>
          {lineChartData && lineChartData.labels.length > 0 ? (
            <div className="h-64">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { 
                      enabled: true,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#3b82f6',
                      borderWidth: 1,
                      cornerRadius: 8,
                    },
                    title: { display: false }
                  },
                  scales: {
                    y: { 
                      min: 1, 
                      max: 5, 
                      title: { display: true, text: 'Severity (1-5)', color: '#6b7280' },
                      grid: { color: '#f3f4f6' }
                    },
                    x: { 
                      title: { display: true, text: 'Date', color: '#6b7280' },
                      grid: { color: '#f3f4f6' }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-500">No data for selected period</p>
            </div>
          )}
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🥧</span>
            Symptoms by Category
          </h3>
          {pieChartData && pieChartData.labels.length > 0 ? (
            <div className="h-64">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                      }
                    },
                    tooltip: { 
                      enabled: true,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#3b82f6',
                      borderWidth: 1,
                      cornerRadius: 8,
                    },
                    title: { display: false }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🥧</div>
              <p className="text-gray-500">No data for selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Most Common Symptoms */}
      {symptoms.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Most Common Symptoms
          </h3>
          <div className="space-y-3">
            {getMostCommonSymptoms().map(([symptom, count], index) => (
              <div key={symptom} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{symptom}</span>
                </div>
                <span className="text-gray-600 font-semibold">{count} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {symptoms.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No progress data yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your symptoms to see your progress and patterns</p>
        </div>
      )}
    </div>
  );
} 