'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Navigation({ activeTab, onTabChange, user }) {
  const tabs = [
    { id: 'tracker', name: 'Track', icon: '📊' },
    { id: 'progress', name: 'Progress', icon: '📈' },
    { id: 'ai', name: 'AI', icon: '🤖' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Symptomps AI
              </h1>
            </div>
            {user && (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-sm text-gray-600 truncate max-w-32">
                  {user.email}
                </div>
                <button
                  onClick={async () => { await supabase.auth.signOut(); }}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-3 px-4 min-w-0 flex-1 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl mb-1">{tab.icon}</span>
                <span className="text-xs font-medium truncate w-full text-center">
                  {tab.name}
                </span>
                {activeTab === tab.id && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
} 