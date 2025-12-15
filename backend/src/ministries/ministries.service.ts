import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ministry, Prisma } from '@prisma/client';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';

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

  async findOne(id: string): Promise<Ministry> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id },
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${id} not found`);
    }

    return ministry;
  }

  async create(createMinistryDto: CreateMinistryDto): Promise<Ministry> {
    try {
      return await this.prisma.ministry.create({
        data: createMinistryDto,
      });
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
  ): Promise<Ministry> {
    await this.findOne(id);

    try {
      return await this.prisma.ministry.update({
        where: { id },
        data: updateMinistryDto,
      });
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

  async remove(id: string): Promise<Ministry> {
    await this.findOne(id);

    return this.prisma.ministry.delete({
      where: { id },
    });
  }
}
