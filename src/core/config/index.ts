import './loadenv';

import { AppConfig } from './app';
import { DatabaseConfig } from './database';
import { GoogleConfig } from './google';
import { ServerConfig } from './server';
import { TwilioConfig } from './twilio';
import { NotificationConfig } from './notification';

export const Config = {
  ...AppConfig,
  ...ServerConfig,
  ...DatabaseConfig,
  ...GoogleConfig,
  ...TwilioConfig,
  ...NotificationConfig
} as const;