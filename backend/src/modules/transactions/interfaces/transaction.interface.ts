import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TransactionPayload {
  @Field()
  userId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  type: string;
}