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

  const renderCustomFieldInput = (field, value, onChange) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
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
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        );
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Symptom Tracker</h2>
      <div className="mb-2 text-sm text-gray-600">
        <strong>Custom Fields:</strong> Add your own input fields to track extra information (e.g., Medication, Weather, Triggers). These fields will appear as columns in your symptom tracker table and can be filled in for each symptom entry.
      </div>
      {/* Custom Fields Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Custom Fields</h3>
          <button
            onClick={() => setShowAddField(!showAddField)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            {showAddField ? 'Cancel' : 'Add Custom Field'}
          </button>
        </div>
        {showAddField && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Field name (e.g., Medication, Weather)"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value, display_name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Yes/No/Maybe</option>
            </select>
            <button
              onClick={addCustomField}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Field
            </button>
          </div>
        )}
        {customFields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>{field.display_name}</span>
                <button
                  onClick={() => removeCustomField(field.name)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add New Symptom Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Symptom</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Symptom name"
            value={newSymptom.name}
            onChange={(e) => setNewSymptom({ ...newSymptom, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newSymptom.category}
            onChange={(e) => setNewSymptom({ ...newSymptom, category: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Severity 1 (Mild)</option>
            <option value={2}>Severity 2</option>
            <option value={3}>Severity 3</option>
            <option value={4}>Severity 4</option>
            <option value={5}>Severity 5 (Severe)</option>
          </select>
          <button
            onClick={addSymptom}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Symptom
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <textarea
            placeholder="Additional notes (optional)"
            value={newSymptom.notes}
            onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
          <input
            type="text"
            placeholder="Food/Action that might have triggered this (optional)"
            value={newSymptom.foodAction}
            onChange={(e) => setNewSymptom({ ...newSymptom, foodAction: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Custom Fields Inputs */}
        {customFields.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Fields:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
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
      </div>
      {/* Symptoms Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food/Action</th>
                {customFields.map((field) => (
                  <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.display_name}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {symptoms.length === 0 ? (
                <tr>
                  <td colSpan={7 + customFields.length} className="px-6 py-4 text-center text-gray-500">
                    No symptoms tracked yet. Add your first symptom above!
                  </td>
                </tr>
              ) : (
                symptoms.map((symptom) => (
                  <tr key={symptom.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === symptom.id ? (
                        <input
                          type="text"
                          defaultValue={symptom.name}
                          onBlur={(e) => updateSymptom(symptom.id, { name: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{symptom.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === symptom.id ? (
                        <select
                          defaultValue={symptom.category}
                          onBlur={(e) => updateSymptom(symptom.id, { category: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-900">{symptom.category || '-'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === symptom.id ? (
                        <select
                          defaultValue={symptom.severity}
                          onBlur={(e) => updateSymptom(symptom.id, { severity: parseInt(e.target.value) })}
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value={1}>1 (Mild)</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5 (Severe)</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(symptom.severity)}`}>
                          {symptom.severity}/5
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === symptom.id ? (
                        <input
                          type="date"
                          defaultValue={symptom.date}
                          onBlur={(e) => updateSymptom(symptom.id, { date: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        new Date(symptom.date).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === symptom.id ? (
                        <input
                          type="text"
                          defaultValue={symptom.foodAction || ''}
                          onBlur={(e) => updateSymptom(symptom.id, { foodAction: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {symptom.foodAction || '-'}
                        </div>
                      )}
                    </td>
                    {customFields.map((field) => (
                      <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                        {editingId === symptom.id ? (
                          renderCustomFieldInput(
                            field,
                            symptom.custom_fields ? symptom.custom_fields[field.name] : '',
                            (value) => updateSymptom(symptom.id, { custom_fields: { ...symptom.custom_fields, [field.name]: value } })
                          )
                        ) : (
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {symptom.custom_fields ? symptom.custom_fields[field.name] : '-'}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      {editingId === symptom.id ? (
                        <textarea
                          defaultValue={symptom.notes}
                          onBlur={(e) => updateSymptom(symptom.id, { notes: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                          rows="2"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {symptom.notes || '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingId === symptom.id ? (
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingId(symptom.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => deleteSymptom(symptom.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 