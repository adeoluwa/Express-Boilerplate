import { BaseService } from "@core/application/base-service";
import { OTPRepository } from "@modules/otp";

export class OtpService extends BaseService {
  constructor(private otpRepository: OTPRepository) {
    super();
  }
}
