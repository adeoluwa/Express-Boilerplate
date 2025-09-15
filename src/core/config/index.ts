import './loadenv';

import { AppConfig } from './app';
import { DatabaseConfig } from './database';
import { GoogleConfig } from './google';
import { ServerConfig } from './server';
import { TwilioConfig } from './twilio';

export const Config = {
  ...AppConfig,
  ...ServerConfig,
  ...DatabaseConfig,
  ...GoogleConfig,
  ...TwilioConfig,
} as const;