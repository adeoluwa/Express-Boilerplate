export const NotificationConfig = {
  MAILERSEND_API_KEY: process.env.MAILERSEND_API_KEY || '',
  SENT_FROM: process.env.SENT_FROM || '',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
};
