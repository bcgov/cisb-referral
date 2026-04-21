import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { diffObjects } from '../audit/audit.utils';
import {
  CreateReferralDto,
  ReferredByType,
  YesNoUnknown,
  ReleaseFromType,
} from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import { Referral } from '../generated/prisma/client';

const TRACKED_FIELDS = [
  'referralStatus',
  'referralOutcome',
  'assignedToId',
  'communityPartnerName',
  'flag',
  'followUpDate',
  'dueDate',
  'completedDate',
  'assignedOn',
  'firstContactMadeOn',
  'currentlyConnectedSupports',
  'currentlyConnectedSupportsOther',
  'regionId',
  'specificCityTown',
  'neededSupports',
  'neededSupportsOther',
  'referralSummary',
  'referredBy',
  'ministryId',
  'ministryNameOther',
  'agencyTypeId',
  'agencyTypeOther',
  'partnerAgencyName',
  'programArea',
  'referrerContactName',
  'referrerEmail',
  'referrerPhone',
  'individualFirstName',
  'individualMiddleName',
  'individualLastName',
  'individualPreferredName',
  'individualDateOfBirth',
  'individualPhone',
  'personId',
  'secondaryContact',
  'bestWayToReach',
  'currentlyHomeless',
  'losingHousing',
  'pendingRelease',
  'releaseDate',
];

@Injectable()
export class ReferralsService {
  private static readonly URGENT_RELEASE_WINDOW_DAYS = 4;
  private static readonly MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  private static readonly VALID_STATUS_TRANSITIONS: Record<
    ReferralStatus,
    ReferralStatus[]
  > = {
    [ReferralStatus.OPEN]: [ReferralStatus.ASSIGNED],
    [ReferralStatus.ASSIGNED]: [
      ReferralStatus.CONTACT_MADE,
      ReferralStatus.OPEN,
    ],
    [ReferralStatus.CONTACT_MADE]: [
      ReferralStatus.CLOSED,
      ReferralStatus.ASSIGNED,
    ],
    [ReferralStatus.CLOSED]: [],
  };

  private readonly logger = new Logger('REFERRALS');

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
  ) {}

  private validateStatusTransition(
    currentStatus: ReferralStatus,
    newStatus: ReferralStatus,
    dto: UpdateReferralDto,
    existing: Referral,
  ): void {
    const allowed =
      ReferralsService.VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Status cannot be changed from ${currentStatus} to ${newStatus}`,
      );
    }

    const effectiveAssignedToId = dto.assignedToId ?? existing.assignedToId;
    if (newStatus === ReferralStatus.ASSIGNED && !effectiveAssignedToId) {
      throw new BadRequestException(
        'A team member must be assigned before setting the status to Assigned',
      );
    }

    const effectiveOutcome = dto.referralOutcome ?? existing.referralOutcome;
    if (newStatus === ReferralStatus.CLOSED && !effectiveOutcome) {
      throw new BadRequestException(
        'A referral outcome must be selected before closing the referral',
      );
    }
  }

  private calculateFlag(
    experiencingHomelessnessResponse?: YesNoUnknown,
    losingHousingResponse?: YesNoUnknown,
    pendingRelease?: ReleaseFromType,
    releaseDate?: string,
  ): boolean {
    const hasHousingUrgency =
      experiencingHomelessnessResponse === YesNoUnknown.YES ||
      losingHousingResponse === YesNoUnknown.YES;
    const hasReleaseUrgency =
      pendingRelease !== undefined &&
      pendingRelease !== ReleaseFromType.NO &&
      this.isReleaseDateWithinDays(
        releaseDate,
        ReferralsService.URGENT_RELEASE_WINDOW_DAYS,
      );

    return hasHousingUrgency || hasReleaseUrgency;
  }

  private isReleaseDateWithinDays(releaseDate?: string, maxDays = 4): boolean {
    if (!releaseDate) {
      return false;
    }

    const parsed = new Date(releaseDate);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    const releaseDateUtcMs = Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    );

    const now = new Date();
    const currentDateUtcMs = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );

    const diffDays = Math.round(
      (releaseDateUtcMs - currentDateUtcMs) /
        ReferralsService.MILLISECONDS_PER_DAY,
    );

    return diffDays >= 0 && diffDays <= maxDays;
  }

  private async validateOtherFields(dto: CreateReferralDto): Promise<void> {
    if (dto.referredBy === ReferredByType.PARTNER_MINISTRY && dto.ministryId) {
      const ministry = await this.prisma.ministry.findUnique({
        where: { id: dto.ministryId },
      });
      if (ministry?.name?.toLowerCase() === 'other' && !dto.ministryNameOther) {
        throw new BadRequestException(
          'Please specify the ministry name when "Other" is selected',
        );
      }
    }

    if (dto.referredBy === ReferredByType.PARTNER_AGENCY && dto.agencyTypeId) {
      const agencyType = await this.prisma.agencyType.findUnique({
        where: { id: dto.agencyTypeId },
      });
      if (agencyType?.name?.toLowerCase() === 'other' && !dto.agencyTypeOther) {
        throw new BadRequestException(
          'Please specify the agency type when "Other" is selected',
        );
      }
    }
  }

  async create(
    createReferralDto: CreateReferralDto,
    contactId: string,
  ): Promise<Referral> {
    await this.validateOtherFields(createReferralDto);

    const flag = this.calculateFlag(
      createReferralDto.currentlyHomeless,
      createReferralDto.losingHousing,
      createReferralDto.pendingRelease,
      createReferralDto.releaseDate,
    );

    const referral = await this.prisma.referral.create({
      data: {
        ...createReferralDto,
        individualDateOfBirth: createReferralDto.individualDateOfBirth
          ? new Date(createReferralDto.individualDateOfBirth)
          : undefined,
        releaseDate: createReferralDto.releaseDate
          ? new Date(createReferralDto.releaseDate)
          : undefined,
        flag,
        referralStatus: ReferralStatus.OPEN,
        createdBy: contactId,
      },
      include: {
        region: true,
        ministry: true,
        agencyType: true,
      },
    });

    await this.auditService.logReferralChange({
      referralId: referral.id,
      action: 'CREATE',
    });

    void this.mailService.sendAutomaticReply(referral).catch((err: unknown) => {
      this.logger.error(
        `Automatic reply failed for referral ${referral.id}: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
    });

    return referral;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: ReferralStatus;
    regionId?: string;
    assignedToId?: string;
  }): Promise<{
    data: Referral[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10, status, regionId, assignedToId } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { referralStatus: status }),
      ...(regionId && { regionId }),
      ...(assignedToId && { assignedToId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          region: true,
          ministry: true,
          agencyType: true,
          assignedTo: true,
        },
      }),
      this.prisma.referral.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Referral> {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      include: {
        region: true,
        ministry: true,
        agencyType: true,
        assignedTo: true,
      },
    });

    if (!referral) {
      throw new NotFoundException(`Referral with ID ${id} not found`);
    }

    return referral;
  }

  private toDateOrUndefined(value?: string): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  private buildUpdateData(
    dto: UpdateReferralDto,
    userId?: string,
  ): Record<string, unknown> {
    return {
      referralStatus: dto.referralStatus,
      assignedToId: dto.assignedToId,
      referralOutcome: dto.referralOutcome,
      communityPartnerName: dto.communityPartnerName,
      flag: dto.flag,
      modifiedBy: userId,
      followUpDate: this.toDateOrUndefined(dto.followUpDate),
      dueDate: this.toDateOrUndefined(dto.dueDate),
      completedDate: this.toDateOrUndefined(dto.completedDate),
      assignedOn: this.toDateOrUndefined(dto.assignedOn),
      firstContactMadeOn: this.toDateOrUndefined(dto.firstContactMadeOn),
      currentlyConnectedSupports: dto.currentlyConnectedSupports,
      currentlyConnectedSupportsOther: dto.currentlyConnectedSupportsOther,
      regionId: dto.regionId,
      specificCityTown: dto.specificCityTown,
      neededSupports: dto.neededSupports,
      neededSupportsOther: dto.neededSupportsOther,
      referralSummary: dto.referralSummary,
      referredBy: dto.referredBy,
      ministryId: dto.ministryId,
      ministryNameOther: dto.ministryNameOther,
      agencyTypeId: dto.agencyTypeId,
      agencyTypeOther: dto.agencyTypeOther,
      partnerAgencyName: dto.partnerAgencyName,
      programArea: dto.programArea,
      referrerContactName: dto.referrerContactName,
      referrerEmail: dto.referrerEmail,
      referrerPhone: dto.referrerPhone,
      individualFirstName: dto.individualFirstName,
      individualMiddleName: dto.individualMiddleName,
      individualLastName: dto.individualLastName,
      individualPreferredName: dto.individualPreferredName,
      individualDateOfBirth: this.toDateOrUndefined(dto.individualDateOfBirth),
      individualPhone: dto.individualPhone,
      personId: dto.personId,
      secondaryContact: dto.secondaryContact,
      bestWayToReach: dto.bestWayToReach,
      currentlyHomeless: dto.currentlyHomeless,
      losingHousing: dto.losingHousing,
      pendingRelease: dto.pendingRelease,
      releaseDate: this.toDateOrUndefined(dto.releaseDate),
    };
  }

  private applyAutoTimestamps(
    updateData: Record<string, unknown>,
    currentStatus: ReferralStatus,
    newStatus: ReferralStatus | undefined,
    existing: Referral,
  ): void {
    if (
      newStatus === ReferralStatus.ASSIGNED &&
      currentStatus !== ReferralStatus.ASSIGNED &&
      !existing.assignedOn &&
      !updateData.assignedOn
    ) {
      updateData.assignedOn = new Date();
    }

    if (
      newStatus === ReferralStatus.CONTACT_MADE &&
      currentStatus !== ReferralStatus.CONTACT_MADE &&
      !existing.firstContactMadeOn &&
      !updateData.firstContactMadeOn
    ) {
      updateData.firstContactMadeOn = new Date();
    }
  }

  private computeHoursDiff(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  private computeLottFields(
    updateData: Record<string, unknown>,
    existing: Referral,
  ): void {
    const assignedOn =
      (updateData.assignedOn as Date | undefined) ?? existing.assignedOn;
    const firstContactMadeOn =
      (updateData.firstContactMadeOn as Date | undefined) ??
      existing.firstContactMadeOn;
    const createdAt = existing.createdAt;

    if (assignedOn) {
      updateData.lottTriage = this.computeHoursDiff(createdAt, assignedOn);
    }

    if (assignedOn && firstContactMadeOn) {
      updateData.lottContact = this.computeHoursDiff(
        assignedOn,
        firstContactMadeOn,
      );
    }
  }

  private removeUndefinedKeys(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = value;
      }
    }
    return clean;
  }

  async update(
    id: string,
    updateReferralDto: UpdateReferralDto,
    userId?: string,
  ): Promise<Referral> {
    const existing = await this.findOne(id);

    const currentStatus = existing.referralStatus as ReferralStatus;
    let newStatus = updateReferralDto.referralStatus;

    // Auto-transition: assigning a team member while OPEN → ASSIGNED
    if (
      updateReferralDto.assignedToId &&
      currentStatus === ReferralStatus.OPEN &&
      (!newStatus || newStatus === ReferralStatus.OPEN)
    ) {
      newStatus = ReferralStatus.ASSIGNED;
      updateReferralDto.referralStatus = newStatus;
    }

    // Auto-transition: setting firstContactMadeOn while ASSIGNED → CONTACT_MADE
    if (
      updateReferralDto.firstContactMadeOn &&
      currentStatus === ReferralStatus.ASSIGNED &&
      (!newStatus || newStatus === ReferralStatus.ASSIGNED)
    ) {
      newStatus = ReferralStatus.CONTACT_MADE;
      updateReferralDto.referralStatus = newStatus;
    }

    if (newStatus && newStatus !== currentStatus) {
      this.validateStatusTransition(
        currentStatus,
        newStatus,
        updateReferralDto,
        existing,
      );
    }

    const updateData = this.buildUpdateData(updateReferralDto, userId);
    this.applyAutoTimestamps(updateData, currentStatus, newStatus, existing);
    this.computeLottFields(updateData, existing);

    const cleanData = this.removeUndefinedKeys(updateData);

    const changes = diffObjects(
      existing as unknown as Record<string, unknown>,
      cleanData,
      TRACKED_FIELDS,
    );

    const hasStatusChange = changes.some((c) => c.field === 'referralStatus');

    const updated = await this.prisma.referral.update({
      where: { id },
      data: cleanData,
      include: {
        region: true,
        ministry: true,
        agencyType: true,
        assignedTo: true,
      },
    });

    if (changes.length > 0) {
      await this.auditService.logReferralChange({
        referralId: id,
        action: hasStatusChange ? 'STATUS_CHANGE' : 'UPDATE',
        changes,
        userId,
      });
    }

    this.maybeNotifyNewAssignee(existing.assignedToId, updated);
    this.maybeNotifyRegionChange(existing.regionId, updated);

    return updated;
  }

  private maybeNotifyNewAssignee(
    previousAssigneeId: string | null,
    updated: Referral,
  ): void {
    const assignee = (updated as Referral & { assignedTo: { email: string } | null })
      .assignedTo;
    const newAssigneeId = updated.assignedToId;

    if (!newAssigneeId || newAssigneeId === previousAssigneeId || !assignee) {
      return;
    }

    void this.mailService
      .sendAssignmentNotification(assignee.email, {
        referralId: updated.id,
        cityTown: updated.specificCityTown,
        createdAt: updated.createdAt,
        status: updated.referralStatus,
        flagged: updated.flag,
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Assignment notification failed for referral ${updated.id}: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      });
  }

  private maybeNotifyRegionChange(
    previousRegionId: string,
    updated: Referral,
  ): void {
    if (updated.regionId === previousRegionId) return;

    const region = (updated as Referral & {
      region: { supervisorEmail: string | null; sharedMailboxEmail: string | null };
    }).region;

    const recipients = [
      region.supervisorEmail?.trim(),
      region.sharedMailboxEmail?.trim(),
    ].filter((email): email is string => Boolean(email));

    if (recipients.length === 0) {
      this.logger.warn(
        `Region change for referral ${updated.id} but new region has no supervisor or shared mailbox configured`,
      );
      return;
    }

    void this.mailService
      .sendRegionChangeNotification(recipients, {
        referralId: updated.id,
        cityTown: updated.specificCityTown,
        createdAt: updated.createdAt,
        status: updated.referralStatus,
        flagged: updated.flag,
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Region change notification failed for referral ${updated.id}: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      });
  }
}
