import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { RefreshTokenService } from './refresh-token.service';
import { TokenPayload } from './interfaces/auth.interface';
import { TokenResponse } from './interfaces/token-response.type';
import { RegisterInput } from './dto/register.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<TokenPayload> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return { userId: user.id, email: user.email };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate user');
    }
  }

  async login(payload: TokenPayload, res: Response): Promise<TokenResponse> {
    try {
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      });

      const refreshToken = await this.refreshTokenService.create(payload.userId);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: this.configService.get<string>('nodeEnv') === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('nodeEnv') === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new BadRequestException('Failed to generate tokens');
    }
  }

  async register(input: RegisterInput): Promise<TokenResponse> {
    const { email, password } = input;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create the user
    const user = await this.usersService.create(email, password);

    // Generate tokens
    const accessToken = this.jwtService.sign(
      { userId: user._id, email: user.email },
      { expiresIn: '15m' },
    );
    const refreshToken = '15x38xkzpdn'; // Replace with actual refresh token logic

    return { accessToken, refreshToken };
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const token = this.jwtService.sign(
      { userId: user.id, email: user.email },
      {
        secret: this.configService.get<string>('jwt.forgotPasswordSecret'),
        expiresIn: '15m',
      }
    );
    return token;
  }

  async resetPassword(passwordToken: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(passwordToken, {
        secret: this.configService.get<string>('jwt.forgotPasswordSecret'),
      });
      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(user.id, hashedPassword);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refresh(refreshToken: string, res: Response): Promise<TokenResponse> {
    try {
      const tokenData = await this.refreshTokenService.validate(refreshToken);
      const user = await this.usersService.getUserPayload(tokenData.userId);

      // Invalidate the old refresh token
      await this.refreshTokenService.invalidate(refreshToken);

      // Generate new tokens
      const accessToken = this.jwtService.sign(
        { userId: user.id, email: user.email },
        {
          secret: this.configService.get<string>('jwt.accessSecret'),
          expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
        },
      );

      const newRefreshToken = await this.refreshTokenService.create(user.id);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: this.configService.get<string>('nodeEnv') === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('nodeEnv') === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to refresh token');
    }
  }

  async logout(refreshToken: string, res: Response): Promise<void> {
    try {
      await this.refreshTokenService.invalidate(refreshToken);
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to refresh token');
    }
  }
}