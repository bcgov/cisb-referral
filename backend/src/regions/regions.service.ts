import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Region } from '@prisma/client';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Region[]> {
    return this.prisma.region.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Region | null> {
    return this.prisma.region.findUnique({
      where: { id },
    });
  }
}
