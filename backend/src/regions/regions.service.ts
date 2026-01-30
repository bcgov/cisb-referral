import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Region, Prisma } from '../generated/prisma/client';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

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

  async findOne(id: string): Promise<Region> {
    const region = await this.prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    try {
      return await this.prisma.region.create({
        data: createRegionDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A region with this name already exists');
        }
      }
      throw error;
    }
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    await this.findOne(id);

    try {
      return await this.prisma.region.update({
        where: { id },
        data: updateRegionDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A region with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Region> {
    await this.findOne(id);

    return this.prisma.region.delete({
      where: { id },
    });
  }
}
