import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenResponse {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}