import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async createUser(telegramId: string, username: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ telegramId });
    if (existingUser) {
      return existingUser;
    }

    const user = new this.userModel({
      telegramId,
      username,
      autoExpenseEnabled: false,
    });

    return user.save();
  }

  async getUser(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({ telegramId });
  }

  async updateUser(telegramId: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { $set: updateData },
      { new: true }
    );
  }
} 