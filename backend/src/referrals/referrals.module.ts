import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { AuditModule } from '../audit/audit.module';
import { AutomaticReplyWorkflow } from '../email/workflows/automatic-reply.workflow';
import { AssignmentNotificationWorkflow } from '../email/workflows/assignment-notification.workflow';
import { SummaryWorkflow } from '../email/workflows/summary.workflow';
import { UrgentNotificationWorkflow } from '../email/workflows/urgent-notification.workflow';
import { RegionChangeWorkflow } from '../email/workflows/region-change.workflow';

@Module({
  imports: [AuditModule],
  controllers: [ReferralsController],
  providers: [
    ReferralsService,
    AutomaticReplyWorkflow,
    AssignmentNotificationWorkflow,
    SummaryWorkflow,
    UrgentNotificationWorkflow,
    RegionChangeWorkflow,
  ],
  exports: [ReferralsService],
})
export class ReferralsModule {}
