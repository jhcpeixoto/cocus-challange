import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Transaction } from '@/modules/transactions/transaction.schema';

@ObjectType()
export class TransactionPageDto {
  @Field(() => [Transaction])
  transactions: Transaction[];

  @Field(() => Int)
  totalCount: number;
}
