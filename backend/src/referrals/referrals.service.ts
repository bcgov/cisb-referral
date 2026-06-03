import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AutomaticReplyWorkflow } from '../email/workflows/automatic-reply.workflow';
import { AssignmentNotificationWorkflow } from '../email/workflows/assignment-notification.workflow';
import { RegionChangeWorkflow } from '../email/workflows/region-change.workflow';
import { UrgentNotificationWorkflow } from '../email/workflows/urgent-notification.workflow';
import { diffObjects } from '../audit/audit.utils';
import {
  CreateReferralDto,
  ReferredByType,
  YesNoUnknown,
  ReleaseFromType,
} from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import { FindAllReferralsDto } from './dto/find-all-referrals.dto';
import { Referral } from '../generated/prisma/client';
import {
  REFERRAL_INCLUDE,
  buildWhere,
  buildOrderBy,
} from './referrals-query.builder';

const TRACKED_FIELDS: string[] = [
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
  'referralReason',
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
  'experiencingHomelessness',
  'losingHouse',
  'pendingOrRecentlyReleased',
  'releaseDate',
];

export interface ReferralExportResult {
  data: Referral[];
  meta: {
    total: number;
    exported: number;
    truncated: boolean;
    maxRows: number;
  };
}

@Injectable()
export class ReferralsService {
  private static readonly URGENT_RELEASE_WINDOW_DAYS = 4;
  private static readonly MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  private static readonly EXPORT_MAX_ROWS = 10000;

  private readonly logger = new Logger('REFERRALS');

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly automaticReplyWorkflow: AutomaticReplyWorkflow,
    private readonly assignmentNotificationWorkflow: AssignmentNotificationWorkflow,
    private readonly urgentNotificationWorkflow: UrgentNotificationWorkflow,
    private readonly regionChangeWorkflow: RegionChangeWorkflow,
  ) {}

  private validateStatusTransition(
    currentStatus: ReferralStatus,
    newStatus: ReferralStatus,
    dto: UpdateReferralDto,
    existing: Referral,
  ): void {
    const effectiveOutcome = dto.referralOutcome ?? existing.referralOutcome;
    if (newStatus === ReferralStatus.CLOSED && !effectiveOutcome) {
      throw new BadRequestException(
        'A referral outcome must be selected before closing the referral',
      );
    }
  }

  private calculateFlag(
    experiencingHomelessnessResponse?: YesNoUnknown,
    losingHouseResponse?: YesNoUnknown,
    pendingOrRecentlyReleased?: ReleaseFromType,
    releaseDate?: string,
  ): boolean {
    const hasHousingUrgency =
      experiencingHomelessnessResponse === YesNoUnknown.YES ||
      losingHouseResponse === YesNoUnknown.YES;
    const hasReleaseUrgency =
      pendingOrRecentlyReleased !== undefined &&
      pendingOrRecentlyReleased !== ReleaseFromType.NO &&
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
      createReferralDto.experiencingHomelessness,
      createReferralDto.losingHouse,
      createReferralDto.pendingOrRecentlyReleased,
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

    void this.automaticReplyWorkflow.handle(referral).catch((err: unknown) => {
      this.logger.error(
        `Automatic reply failed for referral ${referral.id}: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
    });

    void this.urgentNotificationWorkflow
      .handle(referral)
      .catch((err: unknown) => {
        this.logger.error(
          `Urgent notification failed for referral ${referral.id}: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      });

    return referral;
  }

  async findAll(params: FindAllReferralsDto): Promise<{
    data: Referral[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sortBy, params.sortOrder);

    const [data, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: REFERRAL_INCLUDE,
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

  async findAllForExport(
    userId: string,
    params: FindAllReferralsDto = {},
  ): Promise<ReferralExportResult> {
    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.sortBy, params.sortOrder);

    const [rows, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        take: ReferralsService.EXPORT_MAX_ROWS,
        orderBy,
        include: REFERRAL_INCLUDE,
      }),
      this.prisma.referral.count({ where }),
    ]);

    await this.auditService.logGlobal({
      tableName: 'referral',
      recordId: 'all',
      action: 'EXPORT',
      changes: [
        {
          field: 'rowCount',
          oldValue: null,
          newValue: String(rows.length),
        },
      ],
      userId,
    });

    return {
      data: rows,
      meta: {
        total,
        exported: rows.length,
        truncated: rows.length < total,
        maxRows: ReferralsService.EXPORT_MAX_ROWS,
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
      referralReason: dto.referralReason,
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
      experiencingHomelessness: dto.experiencingHomelessness,
      losingHouse: dto.losingHouse,
      pendingOrRecentlyReleased: dto.pendingOrRecentlyReleased,
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

    const changes = diffObjects(existing, cleanData, TRACKED_FIELDS);

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

    void this.assignmentNotificationWorkflow
      .handle(existing.assignedToId, updated)
      .catch((err: unknown) => {
        this.logger.error(
          `Assignment notification failed for referral ${updated.id}: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      });

    void this.regionChangeWorkflow
      .handle(existing.regionId, updated)
      .catch((err: unknown) => {
        this.logger.error(
          `Region change notification failed for referral ${updated.id}: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      });

    return updated;
  }
}
