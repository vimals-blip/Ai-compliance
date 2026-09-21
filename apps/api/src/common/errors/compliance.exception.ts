import { HttpException, HttpStatus } from '@nestjs/common';

export class OrganizationAccessDeniedException extends HttpException {
  constructor(message = 'Access denied: Target resource does not belong to your organization') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: `${resource} with id '${id}' was not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
