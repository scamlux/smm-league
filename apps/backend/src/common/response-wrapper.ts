import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

export interface ApiError {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const isPaginated = data && Array.isArray(data.items);
        return {
          success: true,
          data: isPaginated ? data.items : data,
          meta: isPaginated
            ? {
                page: data.page,
                limit: data.limit,
                total: data.total,
                timestamp: new Date().toISOString(),
              }
            : { timestamp: new Date().toISOString() },
        };
      }),
    );
  }
}

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || "Internal server error";
    const code = exception.code || "INTERNAL_ERROR";

    const errorResponse: ApiError = {
      success: false,
      data: null,
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
        details:
          process.env.NODE_ENV === "development" ? exception.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(errorResponse);
  }
}
