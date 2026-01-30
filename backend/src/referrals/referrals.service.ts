import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReferralDto,
  YesNoUnknown,
  ReleaseFromType,
} from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import { CreateStatusHistoryDto } from './dto/create-status-history.dto';
import { Referral, ReferralStatusHistory } from '../generated/prisma/client';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

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
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
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

    // Create status history entry if status is changing
    if (
      updateReferralDto.referralStatus &&
      updateReferralDto.referralStatus !== existingReferral.referralStatus
    ) {
      await this.prisma.referralStatusHistory.create({
        data: {
          referralId: id,
          fromStatus: existingReferral.referralStatus,
          toStatus: updateReferralDto.referralStatus,
          createdBy: userId,
        },
      });
    }

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

  async addStatusHistory(
    id: string,
    createStatusHistoryDto: CreateStatusHistoryDto,
    userId?: string,
  ): Promise<ReferralStatusHistory> {
    const referral = await this.findOne(id);

    return this.prisma.referralStatusHistory.create({
      data: {
        referralId: id,
        fromStatus: referral.referralStatus,
        toStatus: createStatusHistoryDto.toStatus as ReferralStatus,
        comment: createStatusHistoryDto.comment,
        createdBy: userId,
      },
    });
  }
}
