'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AIInsights({ user }) {
  const [symptoms, setSymptoms] = useState([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      setInsights(data.insights);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate AI insights. Please try again.');
      setInsights('');
    } finally {
      setLoading(false);
    }
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

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError('')}
              className="mt-2 text-red-600 text-xs hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Insights Display */}
      {insights && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
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
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Coming Soon</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-800">Predictive Analysis</h4>
              <p className="text-gray-600 text-sm">AI will predict potential symptom flare-ups based on patterns</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-800">Medication Insights</h4>
              <p className="text-gray-600 text-sm">Track medication effectiveness and potential interactions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-gray-800">Healthcare Integration</h4>
              <p className="text-gray-600 text-sm">Share insights directly with your healthcare providers</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 004 6v12a4 4 0 004 4h12a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-2.81 1.19zM12 8v4m0 4h.01" />
            </svg>
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
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No data to analyze yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your symptoms to unlock AI-powered insights and recommendations</p>
        </div>
      )}
    </div>
  );
} 