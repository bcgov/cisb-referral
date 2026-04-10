import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReferralDto,
  YesNoUnknown,
  ReleaseFromType,
} from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import { Referral } from '../generated/prisma/client';

@Injectable()
export class ReferralsService {
  private static readonly URGENT_RELEASE_WINDOW_DAYS = 4;
  private static readonly MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  constructor(private readonly prisma: PrismaService) {}

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

  async create(
    createReferralDto: CreateReferralDto,
    contactId: string,
  ): Promise<Referral> {
    const flag = this.calculateFlag(
      createReferralDto.currentlyHomeless,
      createReferralDto.losingHousing,
      createReferralDto.pendingRelease,
      createReferralDto.releaseDate,
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
    await this.findOne(id);

    return this.prisma.referral.update({
      where: { id },
      data: {
        referralStatus: updateReferralDto.referralStatus,
        assignedToId: updateReferralDto.assignedToId,
        referralOutcome: updateReferralDto.referralOutcome,
        communityPartnerName: updateReferralDto.communityPartnerName,
        flag: updateReferralDto.flag,
        modifiedBy: userId,
        followUpDate: updateReferralDto.followUpDate
          ? new Date(updateReferralDto.followUpDate)
          : undefined,
        dueDate: updateReferralDto.dueDate
          ? new Date(updateReferralDto.dueDate)
          : undefined,
        completedDate: updateReferralDto.completedDate
          ? new Date(updateReferralDto.completedDate)
          : undefined,
      },
      include: {
        region: true,
        ministry: true,
        agencyType: true,
        assignedTo: true,
      },
    });
  }
}
