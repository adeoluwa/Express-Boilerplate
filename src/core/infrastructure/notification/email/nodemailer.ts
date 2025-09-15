import nodemailer from "nodemailer";
import { logger } from "@shared/logger";

interface MailOptions {
  to: string;
  subject: string;
  body: string;
}

export class MailService {
  private _transporter: nodemailer.Transporter;

  constructor() {
    const requiredVariables = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
    ];

    const missingVariables = requiredVariables.filter((v) => !process.env[v]);

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing SMTP configuration: ${missingVariables.join(", ")}`
      );
    }

    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // Ethreal required false for TLS (dev environmnent),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this._verifyConnection();
  }

  private async _verifyConnection() {
    try {
      const success = await this._transporter.verify();
      logger.info({ success }, "SMTP Connection Verified");

      return true;
    } catch (error) {
      logger.error({ error }, "SMTP Connection Failed");
      throw new Error("SMTP connection verification failed");
    }
  }

  async sendMail(options: MailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}`,

        to: options.to,
        subject: options.subject,
        body: options.body,
      };

      const info = await this._transporter.sendMail(mailOptions);

      // for dev purpose only
      const previewData = {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info), // Etheral specific
      };

      logger.info({previewData}, "Email sent successfully"); // Remove in production
    } catch (error) {
      const exception: Error = error as Error;

      logger.error({exception}, `${exception.message}`)

      throw new Error(`Failed to send email: ${exception.message}`, { cause: exception })
    }
  }
}
