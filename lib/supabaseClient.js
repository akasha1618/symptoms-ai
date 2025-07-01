import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcmafqllmuaymqhazcij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbWFmcWxsbXVheW1xaGF6Y2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MDQzNTEsImV4cCI6MjA2Njk4MDM1MX0.3zJP5Wft6T9rtisltVXipo4QGu2opVzcG8_Xkn-tgVE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 

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