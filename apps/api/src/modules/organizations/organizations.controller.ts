import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant organization profile and high-level counts' })
  async getCurrentOrganization(@Request() req: any) {
    return this.organizationsService.getCurrentOrganization(req.user.organizationId);
  }
}
