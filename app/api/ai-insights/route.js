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
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const { symptoms } = await request.json();

    if (!symptoms || symptoms.length === 0) {
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
    const prompt = `You are a medical AI assistant analyzing symptom patterns. Please analyze the following user symptoms and provide detailed insights, pattern detection, and health recommendations.

SYMPTOM DATA:
${symptomsText}

TOTAL SYMPTOMS: ${symptoms.length}

Please provide a comprehensive analysis including:

1. **Overall Health Assessment**
   - Evaluate the severity patterns
   - Identify any concerning trends
   - Assess frequency and timing patterns

2. **Pattern Detection**
   - Identify recurring symptoms
   - Analyze potential triggers (food, activities, time of day)
   - Look for correlations between different symptoms
   - Detect seasonal or cyclical patterns

3. **Risk Assessment**
   - Identify any symptoms that may require immediate medical attention
   - Flag patterns that could indicate underlying conditions
   - Assess the overall health trajectory

4. **Personalized Recommendations**
   - Suggest lifestyle modifications
   - Recommend tracking improvements
   - Provide preventive measures
   - Suggest when to consult healthcare providers

5. **Data Insights**
   - Highlight the most significant findings
   - Identify data gaps that could improve analysis
   - Suggest additional tracking metrics

IMPORTANT GUIDELINES:
- Be thorough but concise
- Use clear, non-medical jargon language
- Focus on patterns and trends rather than diagnosis
- Always recommend consulting healthcare providers for serious concerns
- Provide actionable, practical advice
- Consider the user's symptom tracking habits

Format your response as a well-structured analysis with clear sections and bullet points where appropriate.`;

    // Call OpenAI API
    const completion = await openaiClient.chat.completions.create({
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
      temperature: 0.3, // Lower temperature for more consistent, factual responses
    });

    const insights = completion.choices[0].message.content;

    return NextResponse.json({ insights });

  } catch (error) {
    console.error('AI Insights API Error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate AI insights. Please try again.' },
      { status: 500 }
    );
  }
} 