import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgencyType, Prisma } from '@prisma/client';
import { CreateAgencyTypeDto } from './dto/create-agency-type.dto';
import { UpdateAgencyTypeDto } from './dto/update-agency-type.dto';

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

  async findOne(id: string): Promise<AgencyType> {
    const agencyType = await this.prisma.agencyType.findUnique({
      where: { id },
    });

    if (!agencyType) {
      throw new NotFoundException(`Agency type with ID ${id} not found`);
    }

    return agencyType;
  }

  async create(createAgencyTypeDto: CreateAgencyTypeDto): Promise<AgencyType> {
    try {
      return await this.prisma.agencyType.create({
        data: createAgencyTypeDto,
      });
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
  ): Promise<AgencyType> {
    await this.findOne(id);

    try {
      return await this.prisma.agencyType.update({
        where: { id },
        data: updateAgencyTypeDto,
      });
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

  async remove(id: string): Promise<AgencyType> {
    await this.findOne(id);

    return this.prisma.agencyType.delete({
      where: { id },
    });
  }
}
