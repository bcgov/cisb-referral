import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReferralDto,
  YesNoUnknown,
  ReleaseFromType,
} from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import { Referral, AuditAction } from '../generated/prisma/client';
import { ReferralAuditService, AuditChange } from './referral-audit.service';

/**
 * Fields that are stored as Date objects in the DB but arrive as strings
 * in the DTO. These need special comparison logic.
 */
const DATE_FIELDS = new Set([
  'followUpDate',
  'dueDate',
  'completedDate',
  'individualDateOfBirth',
  'releaseDate',
  'assignedOn',
  'firstContactMadeOn',
]);

/**
 * Fields that are arrays in the DB. These need deep comparison.
 */
const ARRAY_FIELDS = new Set(['currentlyConnectedSupports', 'neededSupports']);

/**
 * Fields to exclude from audit diff comparison
 * (internal/computed fields that should not appear in audit logs)
 */
const EXCLUDED_FIELDS = new Set(['modifiedBy']);

/**
 * Foreign-key fields that should be resolved to human-readable names
 * in audit log entries. Maps the FK field to its relation and display field.
 */
const RELATION_FIELDS: Record<
  string,
  { relation: string; displayField: string; model: string }
> = {
  ministryId: { relation: 'ministry', displayField: 'name', model: 'ministry' },
  regionId: { relation: 'region', displayField: 'name', model: 'region' },
  agencyTypeId: {
    relation: 'agencyType',
    displayField: 'name',
    model: 'agencyType',
  },
  assignedToId: {
    relation: 'assignedTo',
    displayField: 'fullName',
    model: 'user',
  },
};

@Injectable()
export class ReferralsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referralAuditService: ReferralAuditService,
  ) {}

  private calculateFlag(
    losingHousing?: YesNoUnknown,
    pendingRelease?: ReleaseFromType,
  ): boolean {
    return (
      losingHousing === YesNoUnknown.YES ||
      (pendingRelease !== undefined && pendingRelease !== ReleaseFromType.NO)
    );
  }

  async create(
    createReferralDto: CreateReferralDto,
    contactId: string,
  ): Promise<Referral> {
    const flag = this.calculateFlag(
      createReferralDto.losingHousing,
      createReferralDto.pendingRelease,
    );

    return this.prisma.referral.create({
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

  async update(
    id: string,
    updateReferralDto: UpdateReferralDto,
    userId?: string,
  ): Promise<Referral> {
    const existingReferral = await this.findOne(id);

    const changes = this.detectChanges(existingReferral, updateReferralDto);

    const updateData = this.buildUpdateData(updateReferralDto, userId);

    const updatedReferral = await this.prisma.referral.update({
      where: { id },
      data: updateData,
      include: {
        region: true,
        ministry: true,
        agencyType: true,
        assignedTo: true,
      },
    });

    if (changes.length > 0 && userId != null) {
      const resolvedChanges = await this.resolveRelationNames(
        changes,
        existingReferral,
      );
      await this.referralAuditService.createAuditEntries(
        id,
        AuditAction.UPDATE,
        resolvedChanges,
        userId,
      );
    }

    return updatedReferral;
  }

  /**
   * Compare existing referral fields against the incoming DTO
   * and return an array of field-level changes for audit logging.
   */
  detectChanges(existing: Referral, dto: UpdateReferralDto): AuditChange[] {
    const changes: AuditChange[] = [];

    for (const [fieldName, newValue] of Object.entries(dto)) {
      if (newValue === undefined || EXCLUDED_FIELDS.has(fieldName)) {
        continue;
      }

      const existingValue = (existing as Record<string, unknown>)[fieldName];
      const change = this.detectFieldChange(fieldName, existingValue, newValue);
      if (change) {
        changes.push(change);
      }
    }

    return changes;
  }

  /**
   * Compare a single field's existing value against the new value,
   * dispatching to the appropriate comparison strategy.
   */
  private detectFieldChange(
    fieldName: string,
    existingValue: unknown,
    newValue: unknown,
  ): AuditChange | null {
    if (DATE_FIELDS.has(fieldName)) {
      return this.compareDateField(fieldName, existingValue, newValue);
    }
    if (ARRAY_FIELDS.has(fieldName)) {
      return this.compareArrayField(fieldName, existingValue, newValue);
    }
    return this.compareScalarField(fieldName, existingValue, newValue);
  }

  /**
   * Compare date fields by normalizing both sides to YYYY-MM-DD strings.
   */
  private compareDateField(
    fieldName: string,
    existingValue: unknown,
    newValue: unknown,
  ): AuditChange | null {
    const existingStr =
      existingValue instanceof Date
        ? existingValue.toISOString().split('T')[0]
        : this.toNullableString(existingValue);
    const newStr = this.toNullableString(newValue);

    if (existingStr === newStr) {
      return null;
    }
    return { field: fieldName, oldValue: existingStr, newValue: newStr };
  }

  /**
   * Compare array fields by sorting and serializing for deep equality.
   */
  private compareArrayField(
    fieldName: string,
    existingValue: unknown,
    newValue: unknown,
  ): AuditChange | null {
    const existingArr = Array.isArray(existingValue)
      ? [...existingValue].sort()
      : [];
    const newArr = Array.isArray(newValue) ? [...newValue].sort() : [];

    if (JSON.stringify(existingArr) === JSON.stringify(newArr)) {
      return null;
    }
    return {
      field: fieldName,
      oldValue: existingArr.join(', '),
      newValue: newArr.join(', '),
    };
  }

  /**
   * Compare scalar fields as nullable strings.
   */
  private compareScalarField(
    fieldName: string,
    existingValue: unknown,
    newValue: unknown,
  ): AuditChange | null {
    const existingStr = this.toNullableString(existingValue);
    const newStr = this.toNullableString(newValue);

    if (existingStr === newStr) {
      return null;
    }
    return { field: fieldName, oldValue: existingStr, newValue: newStr };
  }

  /**
   * Convert a value to its string representation, or null if nil.
   */
  private toNullableString(value: unknown): string | null {
    return value != null ? String(value) : null;
  }

  /**
   * Resolve foreign-key ID values in audit changes to human-readable names.
   * Uses the existing referral's included relations for old values and
   * queries the database for new values.
   */
  private async resolveRelationNames(
    changes: AuditChange[],
    existingReferral: Referral,
  ): Promise<AuditChange[]> {
    const resolvePromises = changes.map(async (change) => {
      const rel = RELATION_FIELDS[change.field];
      if (!rel) {
        return change;
      }

      const existingRelation = (
        existingReferral as unknown as Record<string, Record<string, unknown>>
      )[rel.relation];
      const oldName = (existingRelation?.[rel.displayField] as string) ?? null;

      let newName: string | null = null;
      if (change.newValue) {
        const record = await (
          this.prisma[rel.model as keyof PrismaService] as unknown as {
            findUnique: (args: {
              where: { id: string };
              select: Record<string, boolean>;
            }) => Promise<Record<string, unknown> | null>;
          }
        ).findUnique({
          where: { id: change.newValue },
          select: { [rel.displayField]: true },
        });
        newName = (record?.[rel.displayField] as string) ?? change.newValue;
      }

      return {
        field: rel.relation,
        oldValue: oldName,
        newValue: newName,
      };
    });

    return Promise.all(resolvePromises);
  }

  /**
   * Build the Prisma update data object from the DTO,
   * converting date strings to Date objects where needed.
   */
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
      regionId: dto.regionId,
      specificCityTown: dto.specificCityTown,
      currentlyConnectedSupports: dto.currentlyConnectedSupports,
      currentlyConnectedSupportsOther: dto.currentlyConnectedSupportsOther,
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
      gainFile: dto.gainFile,
      secondaryContact: dto.secondaryContact,
      bestWayToReach: dto.bestWayToReach,
      currentlyHomeless: dto.currentlyHomeless,
      losingHousing: dto.losingHousing,
      pendingRelease: dto.pendingRelease,
      followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      completedDate: dto.completedDate
        ? new Date(dto.completedDate)
        : undefined,
      individualDateOfBirth: dto.individualDateOfBirth
        ? new Date(dto.individualDateOfBirth)
        : undefined,
      releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
      individualPhone: dto.individualPhone,
    };
  }
}
