import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  telegramId: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  googleAccessToken?: string;

  @Prop()
  googleRefreshToken?: string;

  @Prop({ default: false })
  autoExpenseEnabled: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 