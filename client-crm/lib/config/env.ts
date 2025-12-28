export const env = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://fl-alerter.icu' 
    : 'http://localhost:3001',
  nodeEnv: process.env.NODE_ENV || 'development',
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',

} as const;