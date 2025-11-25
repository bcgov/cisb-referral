import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ministry } from '@prisma/client';

@Injectable()
export class MinistriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = false): Promise<Ministry[]> {
    return this.prisma.ministry.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Ministry | null> {
    return this.prisma.ministry.findUnique({
      where: { id },
    });
  }
}
