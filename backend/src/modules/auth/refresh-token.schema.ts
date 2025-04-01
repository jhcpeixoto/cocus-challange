import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@Schema({ timestamps: true })
@ObjectType()
export class RefreshToken extends Document {
  @Prop({ required: true })
  @Field()
  userId: string;

  @Prop({ required: true })
  @Field()
  token: string;

  @Prop({ required: true })
  @Field()
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);