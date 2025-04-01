import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@/modules/users/user.schema';

export const ActiveUser = createParamDecorator(
  (field: keyof User | undefined, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req;

    const user: User | undefined = request['user'];
    return field ? user?.[field] : user;
  },
);