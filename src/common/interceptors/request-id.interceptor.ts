import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest() as { requestId?: string; headers: Record<string, string> };
    const requestId = request.headers['x-request-id'] ?? randomUUID();
    request.requestId = requestId;

    const response = context.switchToHttp().getResponse() as { setHeader: (name: string, value: string) => void };
    response.setHeader('x-request-id', requestId);

    return next.handle();
  }
}
