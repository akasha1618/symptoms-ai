'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SymptomTracker({ user }) {
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    category: '',
    severity: 1,
    notes: '',
    foodAction: '',
    date: new Date().toISOString().split('T')[0],
    custom_fields: {}
  });
  const [categories, setCategories] = useState([
    'Digestive', 'Allergy', 'Pain', 'Respiratory', 'Skin', 'Other'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: 'text', display_name: '' });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch symptoms and custom fields for the logged-in user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchData = async () => {
      // Fetch symptoms
      const { data: symptomsData } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      setSymptoms(symptomsData || []);

      // Fetch custom fields
      const { data: fieldsData } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('user_id', user.id);
      setCustomFields(fieldsData || []);
    };
    fetchData().finally(() => setLoading(false));
  }, [user]);

  // Add a new symptom
  const addSymptom = async () => {
    if (!newSymptom.name.trim()) return;
    const symptom = {
      ...newSymptom,
      user_id: user.id,
      custom_fields: customFields.reduce((acc, field) => {
        acc[field.name] = newSymptom[field.name] || '';
        return acc;
      }, {})
    };
    const { data, error } = await supabase
      .from('symptoms')
      .insert([symptom])
      .select();
    if (error) {
      console.error('Supabase insert error:', error);
      alert('Error adding symptom: ' + error.message);
      return;
    }
    if (data && data[0]) {
      setSymptoms([data[0], ...symptoms]);
      setNewSymptom({
        name: '',
        category: '',
        severity: 1,
        notes: '',
        foodAction: '',
        date: new Date().toISOString().split('T')[0],
        custom_fields: {}
      });
      setShowAddForm(false);
    }
  };

  // Update a symptom
  const updateSymptom = async (id, updatedSymptom) => {
    const { error } = await supabase
      .from('symptoms')
      .update(updatedSymptom)
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      setSymptoms(symptoms.map(s => s.id === id ? { ...s, ...updatedSymptom } : s));
    }
    setEditingId(null);
  };

  // Delete a symptom
  const deleteSymptom = async (id) => {
    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      setSymptoms(symptoms.filter(s => s.id !== id));
    }
  };

  // Add a custom field
  const addCustomField = async () => {
    if (!newField.name.trim()) return;
    const field = {
      name: newField.name.toLowerCase().replace(/\s+/g, '_'),
      display_name: newField.display_name || newField.name,
      type: newField.type,
      user_id: user.id
    };
    const { data, error } = await supabase
      .from('custom_fields')
      .insert([field])
      .select();
    if (!error && data && data[0]) {
      setCustomFields([...customFields, data[0]]);
      setNewField({ name: '', type: 'text', display_name: '' });
      setShowAddField(false);
    }
  };

  // Delete a custom field
  const removeCustomField = async (fieldName) => {
    const field = customFields.find(f => f.name === fieldName);
    if (!field) return;
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', field.id)
      .eq('user_id', user.id);
    if (!error) {
      setCustomFields(customFields.filter(f => f.name !== fieldName));
      setSymptoms(symptoms.map(s => {
        const { [fieldName]: removed, ...rest } = s.custom_fields || {};
        return { ...s, custom_fields: rest };
      }));
    }
  };

  const getSeverityColor = (severity) => {
    if (severity <= 2) return 'bg-green-100 text-green-800';
    if (severity <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSeverityEmoji = (severity) => {
    if (severity <= 2) return '😊';
    if (severity <= 4) return '😐';
    return '😰';
  };

  const renderCustomFieldInput = (field, value, onChange) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Maybe">Maybe</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading symptoms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Symptom Tracker</h2>
        <p className="text-gray-600 text-sm">
          Track your symptoms and discover patterns with AI insights
        </p>
      </div>

      {/* Quick Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>Add New Symptom</span>
        </button>
      </div>

      {/* Add Symptom Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Symptom</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Symptom name"
                value={newSymptom.name}
                onChange={(e) => setNewSymptom({ ...newSymptom, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
              <select
                value={newSymptom.category}
                onChange={(e) => setNewSymptom({ ...newSymptom, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Add new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                onBlur={() => {
                  if (newCategory && !categories.includes(newCategory)) {
                    setCategories([...categories, newCategory]);
                    setNewCategory('');
                  }
                }}
              />
              <select
                value={newSymptom.severity}
                onChange={(e) => setNewSymptom({ ...newSymptom, severity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              >
                <option value={1}>😊 Mild (1)</option>
                <option value={2}>😐 Moderate (2)</option>
                <option value={3}>😐 Moderate (3)</option>
                <option value={4}>😰 Severe (4)</option>
                <option value={5}>😰 Very Severe (5)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                placeholder="Additional notes (optional)"
                value={newSymptom.notes}
                onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
                rows="3"
              />
              <input
                type="text"
                placeholder="Food/Action trigger (optional)"
                value={newSymptom.foodAction}
                onChange={(e) => setNewSymptom({ ...newSymptom, foodAction: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Custom Fields Inputs */}
            {customFields.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Custom Fields:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        {field.display_name}
                      </label>
                      {renderCustomFieldInput(
                        field,
                        newSymptom[field.name],
                        (value) => setNewSymptom({ ...newSymptom, [field.name]: value })
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={addSymptom}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md"
              >
                Add Symptom
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Fields Management */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Custom Fields</h3>
          <button
            onClick={() => setShowAddField(!showAddField)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-md"
          >
            {showAddField ? 'Cancel' : 'Add Field'}
          </button>
        </div>
        
        {showAddField && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Field name (e.g., Medication)"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Yes/No/Maybe</option>
              </select>
              <button
                onClick={addCustomField}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md"
              >
                Add Field
              </button>
            </div>
          </div>
        )}
        
        {customFields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <span>{field.display_name}</span>
                <button
                  onClick={() => removeCustomField(field.name)}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Symptoms List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Symptoms</h3>
        {symptoms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No symptoms tracked yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your symptoms to see patterns and get AI insights</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md"
            >
              Add Your First Symptom
            </button>
          </div>
        ) : (
          symptoms.map((symptom) => (
            <div key={symptom.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{symptom.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                      {getSeverityEmoji(symptom.severity)} Level {symptom.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {new Date(symptom.date).toLocaleDateString()}</span>
                    {symptom.category && <span>🏷️ {symptom.category}</span>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingId(editingId === symptom.id ? null : symptom.id)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteSymptom(symptom.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {(symptom.notes || symptom.foodAction) && (
                <div className="space-y-2 mb-4">
                  {symptom.notes && (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Notes:</span> {symptom.notes}
                    </p>
                  )}
                  {symptom.foodAction && (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Trigger:</span> {symptom.foodAction}
                    </p>
                  )}
                </div>
              )}

              {/* Custom Fields Display */}
              {symptom.custom_fields && Object.keys(symptom.custom_fields).length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Custom Fields:</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(symptom.custom_fields).map(([key, value]) => {
                      const field = customFields.find(f => f.name === key);
                      if (!field || !value) return null;
                      return (
                        <div key={key} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">
                          <span className="font-medium">{field.display_name}:</span> {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 