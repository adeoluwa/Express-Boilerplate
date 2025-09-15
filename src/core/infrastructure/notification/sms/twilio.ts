import { Twilio } from "twilio";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import { Config } from "@core/config";

export function initTwilio(): Twilio {
  return new Twilio(Config.TWILIO_SID, Config.TWILIO_TOKEN, {});
}

export async function sendSmsWithTwilio(
  phone: string,
  message: string
): Promise<MessageInstance> {
  const twilio = initTwilio();
  const result = await twilio.messages.create({
    body: message,
    from: Config.TWILIO_SOURCE_NUMBER,
    to: phone,
  });

  return result;
}
