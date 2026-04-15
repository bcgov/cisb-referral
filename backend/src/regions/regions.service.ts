import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { diffObjects } from '../audit/audit.utils';
import { Region, Prisma } from '../generated/prisma/client';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

const TRACKED_FIELDS = [
  'name',
  'managerEmail',
  'supervisorEmail',
  'assistantSupervisorEmail',
  'sharedMailboxEmail',
];

@Injectable()
export class RegionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<Region[]> {
    return this.prisma.region.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  async create(
    createRegionDto: CreateRegionDto,
    userId?: string,
  ): Promise<Region> {
    try {
      const region = await this.prisma.region.create({
        data: createRegionDto,
      });

      await this.auditService.logGlobal({
        tableName: 'region',
        recordId: region.id,
        action: 'CREATE',
        changes: [{ field: 'name', oldValue: null, newValue: region.name }],
        userId,
      });

      return region;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A region with this name already exists');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateRegionDto: UpdateRegionDto,
    userId?: string,
  ): Promise<Region> {
    const existing = await this.findOne(id);

    const changes = diffObjects(
      existing as unknown as Record<string, unknown>,
      updateRegionDto as unknown as Record<string, unknown>,
      TRACKED_FIELDS,
    );

    try {
      const updated = await this.prisma.region.update({
        where: { id },
        data: updateRegionDto,
      });

      if (changes.length > 0) {
        await this.auditService.logGlobal({
          tableName: 'region',
          recordId: id,
          action: 'UPDATE',
          changes,
          userId,
        });
      }

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A region with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string): Promise<Region> {
    await this.findOne(id);

    const removed = await this.prisma.region.delete({
      where: { id },
    });

    await this.auditService.logGlobal({
      tableName: 'region',
      recordId: id,
      action: 'DELETE',
      changes: [],
      userId,
    });

    return removed;
  }
}
