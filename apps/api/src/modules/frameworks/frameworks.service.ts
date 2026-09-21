import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateFrameworkDto } from './frameworks.dto';

@Injectable()
export class FrameworksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.framework.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { controls: true, audits: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const framework = await this.prisma.framework.findFirst({
      where: { id, organizationId },
      include: {
        controls: {
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!framework) {
      throw new NotFoundException(`Framework with ID '${id}' not found`);
    }

    return framework;
  }

  async create(organizationId: string, dto: CreateFrameworkDto) {
    return this.prisma.framework.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }
}
