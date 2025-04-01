import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/modules/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from '@/modules/transactions/transactions.service';
import { Transaction } from '@/modules/transactions/transaction.schema';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionModel: any;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    getBalance: jest.fn(),
    updateBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionModel = module.get(getModelToken(Transaction.name));
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  describe('deposit', () => {
    it('should process deposit successfully', async () => {
      usersService.getBalance.mockResolvedValue(100);
      usersService.updateBalance.mockResolvedValue({} as any);
      transactionModel.create.mockResolvedValue({} as any);

      const result = await service.deposit('user123', 50);
      expect(result).toBe(150);
      expect(usersService.updateBalance).toHaveBeenCalledWith('user123', 150);
    });

    it('should throw BadRequestException for negative amount', async () => {
      await expect(service.deposit('user123', -50))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('withdraw', () => {
    it('should process withdrawal successfully', async () => {
      usersService.getBalance.mockResolvedValue(100);
      usersService.updateBalance.mockResolvedValue({} as any);
      transactionModel.create.mockResolvedValue({} as any);

      const result = await service.withdraw('user123', 50);
      expect(result).toBe(50);
    });

    it('should throw BadRequestException for insufficient funds', async () => {
      usersService.getBalance.mockResolvedValue(100);

      await expect(service.withdraw('user123', 150))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});