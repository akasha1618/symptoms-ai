import { NextResponse } from 'next/server';

// Lazy initialization of OpenAI client to avoid build-time errors
let openai = null;

async function getOpenAIClient() {
  if (!openai) {
    const { default: OpenAI } = await import('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(request) {
  console.log('AI Insights API called');
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json(
        { error: 'AI service is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const { symptoms } = await request.json();
    console.log('Received symptoms:', symptoms);

    if (!symptoms || symptoms.length === 0) {
      console.error('No symptoms data provided');
      return NextResponse.json(
        { error: 'No symptoms data provided' },
        { status: 400 }
      );
    }

    // Get OpenAI client
    const openaiClient = await getOpenAIClient();

    // Format symptoms data for the prompt
    const symptomsText = symptoms.map(symptom => {
      const date = new Date(symptom.date).toLocaleDateString();
      const time = symptom.time || 'Not specified';
      return `- ${symptom.name} (Severity: ${symptom.severity}/5, Category: ${symptom.category || 'General'}, Date: ${date} ${time}, Notes: ${symptom.notes || 'None'}, Food/Action: ${symptom.foodAction || 'None'})`;
    }).join('\n');

    // Create a comprehensive prompt for symptom analysis
    const prompt = `You are a medical AI assistant analyzing symptom patterns. Please analyze the following user symptoms and provide detailed insights, pattern detection, and health recommendations.\n\nSYMPTOM DATA:\n${symptomsText}\n\nTOTAL SYMPTOMS: ${symptoms.length}\n\nPlease provide a comprehensive analysis including:\n\n1. **Overall Health Assessment**\n   - Evaluate the severity patterns\n   - Identify any concerning trends\n   - Assess frequency and timing patterns\n\n2. **Pattern Detection**\n   - Identify recurring symptoms\n   - Analyze potential triggers (food, activities, time of day)\n   - Look for correlations between different symptoms\n   - Detect seasonal or cyclical patterns\n\n3. **Risk Assessment**\n   - Identify any symptoms that may require immediate medical attention\n   - Flag patterns that could indicate underlying conditions\n   - Assess the overall health trajectory\n\n4. **Personalized Recommendations**\n   - Suggest lifestyle modifications\n   - Recommend tracking improvements\n   - Provide preventive measures\n   - Suggest when to consult healthcare providers\n\n5. **Data Insights**\n   - Highlight the most significant findings\n   - Identify data gaps that could improve analysis\n   - Suggest additional tracking metrics\n\nIMPORTANT GUIDELINES:\n- Be thorough but concise\n- Use clear, non-medical jargon language\n- Focus on patterns and trends rather than diagnosis\n- Always recommend consulting healthcare providers for serious concerns\n- Provide actionable, practical advice\n- Consider the user's symptom tracking habits\n\nFormat your response as a well-structured analysis with clear sections and bullet points where appropriate.`;

    // Call OpenAI API
    let completion;
    try {
      console.log('Calling OpenAI...');
      completion = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful medical AI assistant that analyzes symptom patterns and provides health insights. Always be thorough, professional, and prioritize user safety by recommending medical consultation when appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });
      console.log('OpenAI response:', completion);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      return NextResponse.json(
        { error: 'OpenAI API error', details: openaiError.message || openaiError.toString() },
        { status: 500 }
      );
    }

    const insights = completion.choices[0].message.content;
    return NextResponse.json({ insights });

  } catch (error) {
    console.error('AI Insights API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights. Please try again.', details: error.message || error.toString() },
      { status: 500 }
    );
  }
} 