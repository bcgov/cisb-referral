import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralAuditService } from './referral-audit.service';

@Module({
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralAuditService],
  exports: [ReferralsService, ReferralAuditService],
})
export class ReferralsModule {}
