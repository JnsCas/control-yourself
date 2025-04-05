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

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({ telegramId });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async updateUser(telegramId: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { $set: updateData },
      { new: true }
    );
  }

  async updateUserById(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async getUsersWithAutoExpense(): Promise<User[]> {
    return this.userModel.find({ autoExpenseEnabled: true });
  }

  async getUsersWithGoogleTokens(): Promise<User[]> {
    return this.userModel.find({
      googleAccessToken: { $exists: true, $ne: null }
    });
  }
} 