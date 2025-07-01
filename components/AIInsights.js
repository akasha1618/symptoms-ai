'use client';

import { useState, useEffect } from 'react';

export default function AIInsights() {
  const [symptoms, setSymptoms] = useState([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSymptoms = localStorage.getItem('symptoms');
    if (savedSymptoms) {
      setSymptoms(JSON.parse(savedSymptoms));
    }
  }, []);

  const generateInsights = async () => {
    if (symptoms.length === 0) {
      setInsights('Please track some symptoms first to get AI insights.');
      return;
    }

    setLoading(true);
    
    // For now, we'll generate mock insights
    // Later, this will connect to an actual LLM API
    setTimeout(() => {
      const mockInsights = generateMockInsights(symptoms);
      setInsights(mockInsights);
      setLoading(false);
    }, 2000);
  };

  const generateMockInsights = (symptoms) => {
    const avgSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
    const recentSymptoms = symptoms.filter(s => {
      const symptomDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return symptomDate >= weekAgo;
    });

    let insights = `Based on your ${symptoms.length} tracked symptoms:\n\n`;
    
    if (avgSeverity <= 2) {
      insights += "✅ Your symptoms are generally mild. This is a positive sign!\n";
    } else if (avgSeverity <= 3.5) {
      insights += "⚠️ Your symptoms are moderate. Consider tracking more frequently.\n";
    } else {
      insights += "🚨 Your symptoms are severe. Please consult with a healthcare provider.\n";
    }

    if (recentSymptoms.length > 0) {
      insights += `\n📊 Recent Activity: You've tracked ${recentSymptoms.length} symptoms in the last 7 days.\n`;
    }

    insights += "\n💡 Recommendations:\n";
    insights += "• Continue tracking your symptoms regularly\n";
    insights += "• Note any patterns or triggers\n";
    insights += "• Consider lifestyle factors that might affect your symptoms\n";
    insights += "• Share your data with healthcare providers\n";

    return insights;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Insights</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Get AI-Powered Recommendations</h3>
        <p className="text-gray-600 mb-4">
          Our AI analyzes your symptom patterns to provide personalized insights and recommendations.
        </p>
        
        <button
          onClick={generateInsights}
          disabled={loading || symptoms.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            loading || symptoms.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
        
        {symptoms.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Track some symptoms first to get personalized insights.
          </p>
        )}
      </div>

      {insights && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Your AI Insights</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {insights}
            </pre>
          </div>
        </div>
      )}

      {/* Future Features */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">🔮</span>
            <span>Predictive analysis of symptom patterns</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">💊</span>
            <span>Medication interaction warnings</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">🏥</span>
            <span>Integration with healthcare providers</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">📱</span>
            <span>Smart notifications and reminders</span>
          </div>
        </div>
      </div>
    </div>
  );
} 