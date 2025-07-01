'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AuthComponent from '../components/Auth';
import Navigation from '../components/Navigation';
import SymptomTracker from '../components/SymptomTracker';
import ProgressView from '../components/ProgressView';
import AIInsights from '../components/AIInsights';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <AuthComponent />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tracker':
        return <SymptomTracker user={session.user} />;
      case 'progress':
        return <ProgressView user={session.user} />;
      case 'ai':
        return <AIInsights user={session.user} />;
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">App Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Data
                  </label>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Download Symptom Data
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clear All Data
                  </label>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all symptom data? This cannot be undone.')) {
                        // Clear data from Supabase (to be implemented)
                        window.location.reload();
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear All Data
                  </button>
                </div>
                <div>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <SymptomTracker user={session.user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={session.user} />
      <main className="py-6">
        {renderContent()}
      </main>
    </div>
  );
}
