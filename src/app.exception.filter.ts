import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './common/services/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

    constructor(private readonly loggerService: LoggerService) { }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        //@ts-ignore
        const message = exception.response.message || exception.message;
        const name = exception.name;

        this.loggerService.error(message, name)

        response
            .status(status)
            .json({
                statusCode: status,
                message,
                error: name,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
    }
}