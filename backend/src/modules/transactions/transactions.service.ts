import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './transaction.schema';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private readonly usersService: UsersService,
  ) {}

  async deposit(userId: string, amount: number): Promise<number> {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Deposit amount must be positive');
      }
      const balance = await this.usersService.getBalance(userId);
      const newBalance = balance + amount;
      await this.usersService.updateBalance(userId, newBalance);
      await this.transactionModel.create({
        userId,
        type: 'Deposit',
        amount,
        updatedBalance: newBalance,
      });
      return newBalance;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to process deposit');
    }
  }

  async withdraw(userId: string, amount: number): Promise<number> {
    try {
      if (amount <= 0) {
        throw new BadRequestException('Withdrawal amount must be positive');
      }
      const balance = await this.usersService.getBalance(userId);
      if (balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }
      const newBalance = balance - amount;
      await this.usersService.updateBalance(userId, newBalance);
      await this.transactionModel.create({
        userId,
        type: 'Withdrawal',
        amount,
        updatedBalance: newBalance,
      });
      return newBalance;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to process withdrawal');
    }
  }

  async findByUserId(
    userId: string,
    page: number = 0,
    pageSize: number = 10,
    type?: string,
  ): Promise<{ transactions: Transaction[]; totalCount: number }> {
    try {
      const filter: any = { userId };
      if (type && type !== 'All') {
        filter.type = type;
      }
      const totalCount = await this.transactionModel.countDocuments(filter);
      const transactions = await this.transactionModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(page * pageSize)
        .limit(pageSize)
        .exec();
      return { transactions, totalCount };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve transactions');
    }
  }
}
