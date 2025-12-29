export const env = {
  // Set apiUrl based on NODE_ENV, defaulting to prod API in production, else fallback to local API or env variable
  apiUrl:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL_PROD 
      : process.env.NEXT_PUBLIC_API_URL_DEV ,
  nodeEnv: process.env.NODE_ENV || 'development',
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
} as const;