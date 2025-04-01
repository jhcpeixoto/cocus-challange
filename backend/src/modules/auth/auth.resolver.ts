import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { Ctx } from '@/common/types/context.interface';
import { TokenResponse } from './interfaces/token-response.type';
import { RegisterInput } from './dto/register.input';
import { UnauthorizedException } from '@nestjs/common';
import { ForgotPasswordInput } from '@/modules/auth/dto/forgot-password.input';
import { ResetPasswordInput } from '@/modules/auth/dto/reset-password.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TokenResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() { res }: Ctx,
  ): Promise<TokenResponse> {
    const user = await this.authService.validateUser(input.email, input.password);
    return this.authService.login(user, res);
  }

  @Mutation(() => TokenResponse)
  async register(@Args('input') input: RegisterInput): Promise<TokenResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => String)
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<string> {
    return this.authService.forgotPassword(input.email);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<boolean> {
    await this.authService.resetPassword(input.passwordToken, input.newPassword);
    return true;
  }

  @Mutation(() => TokenResponse)
  async refresh(
    @Context() { req, res }: Ctx,
  ): Promise<TokenResponse> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided in cookies');
    }
    return this.authService.refresh(refreshToken, res);
  }

  @Mutation(() => Boolean)
  async logout(
    @Context() { req, res }: Ctx,
  ): Promise<boolean> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided in cookies');
    }
    await this.authService.logout(refreshToken, res);
    return true;
  }
}