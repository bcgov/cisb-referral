import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { diffObjects } from '../audit/audit.utils';
import { Ministry, Prisma } from '../generated/prisma/client';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';

const TRACKED_FIELDS = ['name', 'isActive'];

@Injectable()
export class MinistriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(activeOnly = false): Promise<Ministry[]> {
    return this.prisma.ministry.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Ministry> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id },
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${id} not found`);
    }

    return ministry;
  }

  async create(
    createMinistryDto: CreateMinistryDto,
    userId?: string,
  ): Promise<Ministry> {
    try {
      const ministry = await this.prisma.ministry.create({
        data: createMinistryDto,
      });

      await this.auditService.logGlobal({
        tableName: 'ministry',
        recordId: ministry.id,
        action: 'CREATE',
        changes: [{ field: 'name', oldValue: null, newValue: ministry.name }],
        userId,
      });

      return ministry;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A ministry with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateMinistryDto: UpdateMinistryDto,
    userId?: string,
  ): Promise<Ministry> {
    const existing = await this.findOne(id);

    const changes = diffObjects(
      existing as unknown as Record<string, unknown>,
      updateMinistryDto as unknown as Record<string, unknown>,
      TRACKED_FIELDS,
    );

    try {
      const updated = await this.prisma.ministry.update({
        where: { id },
        data: updateMinistryDto,
      });

      if (changes.length > 0) {
        await this.auditService.logGlobal({
          tableName: 'ministry',
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
          throw new ConflictException(
            'A ministry with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string): Promise<Ministry> {
    await this.findOne(id);

    const removed = await this.prisma.ministry.delete({
      where: { id },
    });

    await this.auditService.logGlobal({
      tableName: 'ministry',
      recordId: id,
      action: 'DELETE',
      changes: [],
      userId,
    });

    return removed;
  }
}
