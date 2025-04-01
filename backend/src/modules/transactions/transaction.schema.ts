import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, Float, ObjectType } from '@nestjs/graphql';

@Schema()
@ObjectType()
export class Transaction extends Document {
  @Prop({ required: true })
  @Field()
  userId: string;

  @Prop({ required: true, enum: ['Deposit', 'Withdrawal'] })
  @Field()
  type: string;

  @Prop({ required: true })
  @Field(() => Float)
  amount: number;

  @Prop({ default: Date.now })
  @Field()
  timestamp: Date;

  @Prop({ required: true })
  @Field(() => Float)
  updatedBalance: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);