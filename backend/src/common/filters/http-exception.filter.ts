import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const contextType = host.getType<string>();
    const status = exception.getStatus();
    const timestamp = new Date().toISOString();
    const responseBody = {
      statusCode: status,
      timestamp,
      message: exception.message,
    };

    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest<Request>();
      const response = ctx.getResponse<Response>();
      const path = request.url || 'unknown';

      response.status(status).json({
        ...responseBody,
        path,
      });
    } else if (contextType === 'graphql') {
      const response = exception.getResponse() as any;
      const message = response.message || exception.message;

      throw new GraphQLError(message, {
        extensions: {
          code: this.mapHttpStatusToCode(status),
          ...(response.validationErrors ? { validationErrors: response.validationErrors } : {})
        }
      });
    } else {
      this.logger.warn(`Unhandled context type: ${contextType}`);
    }
  }

  private mapHttpStatusToCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_USER_INPUT';
      case 401: return 'UNAUTHENTICATED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      default: return 'INTERNAL_SERVER_ERROR';
    }
  }
}