import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { DEFAULT_JWT_ACCESS_SECRET } from '../../auth/auth.constants';
import { TokenPayload } from '../../auth/auth.types';
import { UsersStore } from '../../users/users-store.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET ?? DEFAULT_JWT_ACCESS_SECRET;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersStore: UsersStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization header');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = this.usersStore.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    (request as Request & { user: unknown }).user = this.usersStore.toPublicUser(user);
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header) return undefined;

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return undefined;

    return token;
  }
}
