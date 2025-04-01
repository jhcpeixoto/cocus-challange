import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { UserPayload } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(email: string, password: string): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({ email, password: hashedPassword });
      return await user.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new BadRequestException('Failed to find user by email');
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      throw new BadRequestException('Failed to find user by ID');
    }
  }

  async getBalance(userId: string): Promise<number> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user.balance ?? 0;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get user balance');
    }
  }

  async updateBalance(userId: string, newBalance: number): Promise<User | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, { balance: newBalance }, { new: true })
        .exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user balance');
    }
  }

  async getUserPayload(userId: string): Promise<UserPayload> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return { id: user.id, email: user.email };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get user payload');
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: newPassword }).exec();
  }
}