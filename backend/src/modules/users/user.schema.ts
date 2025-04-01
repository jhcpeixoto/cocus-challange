import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, Float, ObjectType } from '@nestjs/graphql';

@Schema()
@ObjectType()
export class User extends Document {
  @Prop({ required: true, unique: true })
  @Field()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  @Field(() => Float)
  balance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);