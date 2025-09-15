export const ServerConfig = {
  PORT: process.env.PORT || '',
  BASE_URL: process.env.BASE_URL || '',
  COOKIE_SECRET: process.env.COOKIE_SECRET || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  SECRET_KEY: process.env.JWT_SECRET || '',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10')
};
