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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <AuthComponent />
        </div>
      </div>
    );
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
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Settings</h2>
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Data Management</h3>
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md">
                      Download Symptom Data
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Danger Zone</h3>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all symptom data? This cannot be undone.')) {
                          // Clear data from Supabase (to be implemented)
                          window.location.reload();
                        }
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-md"
                    >
                      Clear All Data
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Account</h3>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                      }}
                      className="w-full bg-gradient-to-r from-gray-500 to-slate-500 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 font-medium shadow-md"
                    >
                      Log Out
                    </button>
                  </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={session.user} />
      <main className="pb-20">
        {renderContent()}
      </main>
    </div>
  );
}
