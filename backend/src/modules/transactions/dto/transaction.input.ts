import { Field, Float, InputType } from '@nestjs/graphql';
import { IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class TransactionInput {
  @Field(() => Float)
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount: number;
}
