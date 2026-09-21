import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class OrganizationIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organizationId) {
      throw new ForbiddenException('User is not associated with an organization');
    }

    // If request contains an organizationId param or body field, verify it matches
    const targetOrgId =
      request.params?.organizationId ||
      request.query?.organizationId ||
      request.body?.organizationId;

    if (targetOrgId && targetOrgId !== user.organizationId) {
      throw new ForbiddenException(
        'Cross-organization access forbidden: User cannot access data outside their organization',
      );
    }

    // Attach organizationId directly to request context for downstream services
    request.organizationId = user.organizationId;
    return true;
  }
}
