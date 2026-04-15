import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { diffObjects } from '../audit/audit.utils';
import { AgencyType, Prisma } from '../generated/prisma/client';
import { CreateAgencyTypeDto } from './dto/create-agency-type.dto';
import { UpdateAgencyTypeDto } from './dto/update-agency-type.dto';

const TRACKED_FIELDS = ['name', 'isActive'];

@Injectable()
export class AgencyTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(activeOnly = false): Promise<AgencyType[]> {
    return this.prisma.agencyType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<AgencyType> {
    const agencyType = await this.prisma.agencyType.findUnique({
      where: { id },
    });

    if (!agencyType) {
      throw new NotFoundException(`Agency type with ID ${id} not found`);
    }

    return agencyType;
  }

  async create(
    createAgencyTypeDto: CreateAgencyTypeDto,
    userId?: string,
  ): Promise<AgencyType> {
    try {
      const agencyType = await this.prisma.agencyType.create({
        data: createAgencyTypeDto,
      });

      await this.auditService.logGlobal({
        tableName: 'agency_type',
        recordId: agencyType.id,
        action: 'CREATE',
        changes: [{ field: 'name', oldValue: null, newValue: agencyType.name }],
        userId,
      });

      return agencyType;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'An agency type with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateAgencyTypeDto: UpdateAgencyTypeDto,
    userId?: string,
  ): Promise<AgencyType> {
    const existing = await this.findOne(id);

    const changes = diffObjects(
      existing as unknown as Record<string, unknown>,
      updateAgencyTypeDto as unknown as Record<string, unknown>,
      TRACKED_FIELDS,
    );

    try {
      const updated = await this.prisma.agencyType.update({
        where: { id },
        data: updateAgencyTypeDto,
      });

      if (changes.length > 0) {
        await this.auditService.logGlobal({
          tableName: 'agency_type',
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
            'An agency type with this name already exists',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string): Promise<AgencyType> {
    await this.findOne(id);

    const removed = await this.prisma.agencyType.delete({
      where: { id },
    });

    await this.auditService.logGlobal({
      tableName: 'agency_type',
      recordId: id,
      action: 'DELETE',
      changes: [],
      userId,
    });

    return removed;
  }
}
