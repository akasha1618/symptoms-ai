'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AIInsights({ user }) {
  const [symptoms, setSymptoms] = useState([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    const fetchSymptoms = async () => {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!error) setSymptoms(data || []);
      setLoadingData(false);
    };
    fetchSymptoms();
  }, [user]);

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

    // Analyze patterns
    const categories = {};
    const triggers = {};
    symptoms.forEach(s => {
      if (s.category) {
        categories[s.category] = (categories[s.category] || 0) + 1;
      }
      if (s.foodAction) {
        triggers[s.foodAction] = (triggers[s.foodAction] || 0) + 1;
      }
    });

    const mostCommonCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0];
    const mostCommonTrigger = Object.keys(triggers).sort((a, b) => triggers[b] - triggers[a])[0];

    let insights = `AI Analysis Report\n\n`;
    insights += `Based on your ${symptoms.length} tracked symptoms:\n\n`;
    
    // Severity analysis
    if (avgSeverity <= 2) {
      insights += "✅ Overall Health Status: Good\n";
      insights += "Your symptoms are generally mild, which is a positive sign!\n\n";
    } else if (avgSeverity <= 3.5) {
      insights += "⚠️ Overall Health Status: Moderate\n";
      insights += "Your symptoms are moderate. Consider tracking more frequently.\n\n";
    } else {
      insights += "🚨 Overall Health Status: Concerning\n";
      insights += "Your symptoms are severe. Please consult with a healthcare provider.\n\n";
    }

    // Recent activity
    if (recentSymptoms.length > 0) {
      insights += `📈 Recent Activity: You've tracked ${recentSymptoms.length} symptoms in the last 7 days.\n\n`;
    }

    // Pattern analysis
    if (mostCommonCategory) {
      insights += `🏷️ Most Common Category: ${mostCommonCategory} (${categories[mostCommonCategory]} occurrences)\n\n`;
    }

    if (mostCommonTrigger) {
      insights += `🔍 Potential Trigger: ${mostCommonTrigger} (${triggers[mostCommonTrigger]} occurrences)\n\n`;
    }

    insights += "💡 Recommendations:\n";
    insights += "• Continue tracking your symptoms regularly\n";
    insights += "• Note any patterns or triggers\n";
    insights += "• Consider lifestyle factors that might affect your symptoms\n";
    insights += "• Share your data with healthcare providers\n";
    insights += "• Monitor your most common symptom category\n";

    if (mostCommonTrigger) {
      insights += `• Pay attention to how ${mostCommonTrigger} affects your symptoms\n`;
    }

    return insights;
  };

  if (loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Insights</h2>
        <p className="text-gray-600 text-sm">
          Get personalized insights and recommendations based on your symptom patterns
        </p>
      </div>

      {/* Generate Insights Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-white text-xl font-bold">AI</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">AI-Powered Analysis</h3>
            <p className="text-gray-600 text-sm">Get personalized insights and recommendations</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Our AI analyzes your symptom patterns to provide personalized insights, identify potential triggers, and offer recommendations for better health management.
        </p>
        
        <button
          onClick={generateInsights}
          disabled={loading || symptoms.length === 0}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
            loading || symptoms.length === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing your data...
            </div>
          ) : (
            'Generate AI Insights'
          )}
        </button>
        
        {symptoms.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2 font-bold">!</span>
              <p className="text-yellow-800 text-sm">
                Track some symptoms first to get personalized insights.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Insights Display */}
      {insights && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white text-lg font-bold">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Your AI Insights</h3>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                {insights}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Features */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
            <span className="text-white text-lg font-bold">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Coming Soon</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <span className="text-purple-600 text-lg font-bold">🔮</span>
            <div>
              <h4 className="font-medium text-gray-800">Predictive Analysis</h4>
              <p className="text-gray-600 text-sm">AI will predict potential symptom flare-ups based on patterns</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <span className="text-blue-600 text-lg font-bold">💊</span>
            <div>
              <h4 className="font-medium text-gray-800">Medication Insights</h4>
              <p className="text-gray-600 text-sm">Track medication effectiveness and potential interactions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <span className="text-green-600 text-lg font-bold">🏥</span>
            <div>
              <h4 className="font-medium text-gray-800">Healthcare Integration</h4>
              <p className="text-gray-600 text-sm">Share insights directly with your healthcare providers</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <span className="text-orange-600 text-lg font-bold">📱</span>
            <div>
              <h4 className="font-medium text-gray-800">Smart Notifications</h4>
              <p className="text-gray-600 text-sm">Intelligent reminders and health alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {symptoms.length === 0 && !insights && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-6xl mb-4 text-gray-400">🤖</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No data to analyze yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your symptoms to unlock AI-powered insights and recommendations</p>
        </div>
      )}
    </div>
  );
} 