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
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'All time', value: 0 }
];

export default function ProgressView({ user }) {
  const [symptoms, setSymptoms] = useState([]);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    if (!user) return;
    const fetchSymptoms = async () => {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!error) setSymptoms(data || []);
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
          fill: false,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          pointRadius: 4,
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
          borderWidth: 1
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Progress Overview</h2>
      {/* Period Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PERIODS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${period === opt.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Severity Trend</h3>
          {lineChartData && lineChartData.labels.length > 0 ? (
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                  title: { display: false }
                },
                scales: {
                  y: { min: 1, max: 5, title: { display: true, text: 'Severity (1-5)' } },
                  x: { title: { display: true, text: 'Date' } }
                }
              }}
            />
          ) : (
            <div className="text-gray-400 text-center py-8">No data for selected period</div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Symptoms by Category</h3>
          {pieChartData && pieChartData.labels.length > 0 ? (
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: { enabled: true },
                  title: { display: false }
                }
              }}
            />
          ) : (
            <div className="text-gray-400 text-center py-8">No data for selected period</div>
          )}
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Symptoms</h3>
          <p className="text-3xl font-bold text-blue-600">{symptoms.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg Severity</h3>
          <p className="text-3xl font-bold text-orange-600">{getAverageSeverity()}/5</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Last 7 Days</h3>
          <p className="text-3xl font-bold text-green-600">{getRecentSymptoms().length}</p>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 7 Days)</h3>
        {getRecentSymptoms().length === 0 ? (
          <p className="text-gray-500">No symptoms tracked in the last 7 days.</p>
        ) : (
          <div className="space-y-3">
            {getRecentSymptoms().map((symptom) => (
              <div key={symptom.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{symptom.name}</p>
                  <p className="text-sm text-gray-500">{new Date(symptom.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  symptom.severity <= 2 ? 'bg-green-100 text-green-800' :
                  symptom.severity <= 4 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {symptom.severity}/5
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Most Common Symptoms */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Most Common Symptoms</h3>
        {getMostCommonSymptoms().length === 0 ? (
          <p className="text-gray-500">No symptoms tracked yet.</p>
        ) : (
          <div className="space-y-3">
            {getMostCommonSymptoms().map(([symptom, count], index) => (
              <div key={symptom} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                  <span className="font-medium">{symptom}</span>
                </div>
                <span className="text-sm text-gray-500">{count} times</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 