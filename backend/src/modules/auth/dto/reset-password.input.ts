import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  passwordToken: string;

  @Field()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
