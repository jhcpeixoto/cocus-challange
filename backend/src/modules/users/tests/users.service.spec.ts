import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  const mockUser = {
    _id: 'user123',
    id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    balance: 100,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    new: jest.fn().mockReturnValue(mockUser),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));

    // Set up mockUser save to return itself
    mockUser.save.mockResolvedValue(mockUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should throw BadRequestException on error', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(service.findByEmail('test@example.com'))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await service.findById('user123');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw BadRequestException on error', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(service.findById('user123'))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      const balance = await service.getBalance('user123');
      expect(balance).toBe(100);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getBalance('user123'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('updateBalance', () => {
    it('should update user balance successfully', async () => {
      const updatedUser = { ...mockUser, balance: 150 };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser)
      });

      const result = await service.updateBalance('user123', 150);
      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { balance: 150 },
        { new: true }
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(service.updateBalance('user123', 150))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should propagate errors correctly', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(service.updateBalance('user123', 150))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('getUserPayload', () => {
    it('should return user payload successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(
        { id: mockUser.id, email: mockUser.email } as User
      );

      const result = await service.getUserPayload('user123');
      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
      expect(service.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(service.getUserPayload('user123'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should propagate errors correctly', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(new Error('Database error'));

      await expect(service.getUserPayload('user123'))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});