'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Navigation({ activeTab, onTabChange, user }) {
  const tabs = [
    { id: 'tracker', name: 'Track Symptoms', icon: '📊' },
    { id: 'progress', name: 'Progress', icon: '📈' },
    { id: 'ai', name: 'AI Insights', icon: '🤖' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-xl font-bold text-gray-800">Symptomps AI</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={async () => { await supabase.auth.signOut(); }}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile-friendly tab navigation */}
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
} 