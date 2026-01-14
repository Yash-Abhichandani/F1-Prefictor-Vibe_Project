// Centralized configuration for the application using the "singleton" pattern for env vars

export const config = {
  // Backend API URL
  // In production, this should be set to the deployed backend URL (e.g. on Render/Heroku/Vercel)
  // In development, it falls back to localhost if not set, but prefers the env var.
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',

  // Feature Flags or other global config can go here
  isProduction: process.env.NODE_ENV === 'production',
};
