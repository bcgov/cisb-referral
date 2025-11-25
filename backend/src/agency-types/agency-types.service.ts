import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgencyType } from '@prisma/client';

@Injectable()
export class AgencyTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = false): Promise<AgencyType[]> {
    return this.prisma.agencyType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<AgencyType | null> {
    return this.prisma.agencyType.findUnique({
      where: { id },
    });
  }
}
