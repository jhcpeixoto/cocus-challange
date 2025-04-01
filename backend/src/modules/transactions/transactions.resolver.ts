import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TransactionsService } from './transactions.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TransactionInput } from './dto/transaction.input';
import { Transaction } from './transaction.schema';
import { ActiveUser } from '@/common/decorators/active-user.decorator';
import { TokenPayload } from '@/modules/auth/interfaces/auth.interface';
import { TransactionPageDto } from '@/modules/transactions/dto/transaction-page.dto';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Mutation(() => Number)
  @UseGuards(JwtAuthGuard)
  async deposit(
    @Args('input') input: TransactionInput,
    @ActiveUser() user: TokenPayload,
  ): Promise<number> {
    return await this.transactionsService.deposit(user.userId, input.amount);
  }

  @Mutation(() => Number)
  @UseGuards(JwtAuthGuard)
  async withdraw(
    @Args('input') input: TransactionInput,
    @ActiveUser() user: TokenPayload,
  ): Promise<number> {
    return await this.transactionsService.withdraw(user.userId, input.amount);
  }

  @Query(() => TransactionPageDto)
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @ActiveUser() user: TokenPayload,
    @Args('page', { type: () => Number, nullable: true, defaultValue: 0 }) page: number,
    @Args('pageSize', { type: () => Number, nullable: true, defaultValue: 10 }) pageSize: number,
    @Args('type', { type: () => String, nullable: true, defaultValue: 'All' }) type: string,
  ): Promise<TransactionPageDto> {
    return this.transactionsService.findByUserId(user.userId, page, pageSize, type);
  }
}
