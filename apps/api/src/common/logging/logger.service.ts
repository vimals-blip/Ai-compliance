import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class StructuredLogger implements NestLoggerService {
  log(message: string, context?: string, meta?: Record<string, unknown>) {
    this.print('INFO', message, context, meta);
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, unknown>) {
    this.print('ERROR', message, context, { ...meta, trace });
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.print('WARN', message, context, meta);
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.print('DEBUG', message, context, meta);
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>) {
    this.print('VERBOSE', message, context, meta);
  }

  private print(
    level: string,
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Application',
      message,
      ...(meta || {}),
    };
    console.log(JSON.stringify(logEntry));
  }
}
