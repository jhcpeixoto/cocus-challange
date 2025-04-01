import { Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from './user.schema';
import { ActiveUser } from '@/common/decorators/active-user.decorator';
import { TokenPayload } from '@/modules/auth/interfaces/auth.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Query(() => Number)
  @UseGuards(JwtAuthGuard)
  async getBalance(@ActiveUser() user: TokenPayload) {
    return this.usersService.getBalance(user.userId);
  }
}