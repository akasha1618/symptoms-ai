# AI Integration Setup Guide

## OpenAI API Configuration

To enable AI-powered symptom analysis, you need to configure your OpenAI API key:

### 1. Get an OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the API key (it starts with `sk-`)

### 2. Configure Environment Variables
Create a `.env.local` file in your project root and add:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Restart Your Development Server
After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## Features

The AI integration provides:

- **Pattern Detection**: Identifies recurring symptoms and potential triggers
- **Health Assessment**: Evaluates severity patterns and overall health status
- **Risk Assessment**: Flags symptoms that may require medical attention
- **Personalized Recommendations**: Suggests lifestyle modifications and tracking improvements
- **Data Insights**: Highlights significant findings and suggests additional metrics

## API Endpoint

The AI insights are generated via the `/api/ai-insights` endpoint, which:
- Accepts symptom data via POST request
- Uses GPT-4 for comprehensive analysis
- Returns structured insights and recommendations
- Handles errors gracefully with user-friendly messages

## Security Notes

- API keys are stored securely in environment variables
- No sensitive data is logged or stored
- All API calls are made server-side for security
- Error messages don't expose sensitive information

## Troubleshooting

### Common Issues:

1. **"AI service configuration error"**
   - Check that your OpenAI API key is correctly set in `.env.local`
   - Ensure the API key is valid and has sufficient credits

2. **"AI service quota exceeded"**
   - Your OpenAI account may have reached its usage limit
   - Check your OpenAI dashboard for usage details

3. **"Failed to generate AI insights"**
   - Check your internet connection
   - Verify the API endpoint is accessible
   - Check browser console for detailed error messages

### Support

If you continue to experience issues, check:
- OpenAI API status: https://status.openai.com/
- Your OpenAI account dashboard for usage and billing
- Browser developer tools for network errors 