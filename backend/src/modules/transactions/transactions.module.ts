import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsResolver } from './transactions.resolver';
import { Transaction, TransactionSchema } from './transaction.schema';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    UsersModule,
  ],
  providers: [TransactionsService, TransactionsResolver],
})
export class TransactionsModule {}