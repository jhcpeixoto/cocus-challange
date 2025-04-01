import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: any) {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();

    if (ctx.req) {
      return ctx.req;
    }
    throw new UnauthorizedException('No request object found');
  }
}
