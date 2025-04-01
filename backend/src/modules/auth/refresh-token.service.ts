import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from './refresh-token.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string): Promise<string> {
    try {
      const token = Math.random().toString(36).substring(2);
      const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
      const expiresAt = new Date();
      if (expiresIn === '7d') {
        expiresAt.setDate(expiresAt.getDate() + 7);
      } else {
        expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(expiresIn));
      }

      const refreshToken = new this.refreshTokenModel({ userId, token, expiresAt });
      await refreshToken.save();
      return token;
    } catch (error) {
      throw new BadRequestException('Failed to create refresh token');
    }
  }

  async validate(token: string): Promise<RefreshToken> {
    try {
      const refreshToken = await this.refreshTokenModel.findOne({ token }).exec();
      if (!refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (refreshToken.expiresAt < new Date()) {
        await this.refreshTokenModel.deleteOne({ token }).exec();
        throw new UnauthorizedException('Refresh token expired');
      }
      return refreshToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate refresh token');
    }
  }

  async invalidate(token: string): Promise<void> {
    try {
      const refreshToken = await this.refreshTokenModel.findOne({ token }).exec();
      if (!refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await this.refreshTokenModel.deleteOne({ token }).exec();
    } catch (error) {
      throw new BadRequestException('Failed to invalidate refresh token');
    }
  }
}