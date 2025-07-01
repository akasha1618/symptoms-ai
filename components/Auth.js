import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';

export default function AuthComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
           Symptoms AI
          </h1>
          <p className="text-gray-600 text-sm">
            Track your symptoms with AI-powered insights
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
            Welcome Back
          </h2>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#1d4ed8',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    defaultButtonBorder: '1px solid #d1d5db',
                    defaultButtonText: '#374151',
                    dividerBackground: '#e5e7eb',
                    inputBackground: '#f9fafb',
                    inputBorder: '1px solid #d1d5db',
                    inputBorderHover: '#9ca3af',
                    inputBorderFocus: '#3b82f6',
                    inputText: '#374151',
                    inputLabelText: '#6b7280',
                    inputPlaceholder: '#9ca3af',
                    messageText: '#6b7280',
                    messageTextDanger: '#dc2626',
                    anchorTextColor: '#3b82f6',
                    anchorTextHoverColor: '#1d4ed8',
                  },
                  space: {
                    inputPadding: '12px 16px',
                    buttonPadding: '12px 16px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: 'Inter, system-ui, sans-serif',
                    buttonFontFamily: 'Inter, system-ui, sans-serif',
                    inputFontFamily: 'Inter, system-ui, sans-serif',
                    labelFontFamily: 'Inter, system-ui, sans-serif',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                },
              },
            }}
            providers={["google", "github"]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign In',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign Up',
                  loading_button_label: 'Signing up...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
              },
            }}
          />
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Track symptoms with custom fields</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>AI-powered insights and analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Progress tracking and charts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 