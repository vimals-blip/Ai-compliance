import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

const DEFAULT_ORG = {
  name: 'CloudSecure Enterprise',
  legalName: 'CloudSecure Enterprise Inc.',
  industry: 'Cloud & SaaS Infrastructure',
  primaryCloud: 'AWS',
  mfaTool: 'Okta',
  adminEmail: 'security@cloudsecure.io',
  frameworks: ['SOC 2 Type II', 'ISO/IEC 27001:2022', 'NIST CSF'],
  entityCount: 3,
  updatedAt: new Date().toISOString(),
};

@ApiTags('Organization')
@Controller('organization')
export class OrganizationAliasController {
  private org = { ...DEFAULT_ORG };

  @Get()
  @ApiOperation({ summary: 'Get current organization details' })
  getOrg() {
    return this.org;
  }

  @Post()
  @ApiOperation({ summary: 'Update organization details' })
  updateOrgPost(@Body() body: any) {
    this.org = {
      ...this.org,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return { success: true, organization: this.org };
  }

  @Patch()
  @ApiOperation({ summary: 'Update organization details' })
  updateOrgPatch(@Body() body: any) {
    return this.updateOrgPost(body);
  }
}
