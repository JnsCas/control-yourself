import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(user: User): Promise<User> {
    await new this.userModel(user.toDocument()).save();
    return user;
  }

  async findOneByTelegramId(telegramId: string): Promise<User | null> {
    const result = await this.userModel.findOne({ telegramId }).exec();
    return result ? User.restore(result) : null;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const result = await this.userModel.findOne({ username }).exec();
    return result ? User.restore(result) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.userModel.findById(id).exec();
    return result ? User.restore(result) : null;
  }

  async updateLastEmailSync(userId: string): Promise<User | null> {
    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { lastEmailSync: new Date() } },
      { new: true }
    ).exec();
    return result ? User.restore(result) : null;
  }

  async updateByTelegramId(telegramId: string, updateData: Partial<User>): Promise<User | null> {
    const result = await this.userModel.findOneAndUpdate(
      { telegramId },
      { $set: updateData },
      { new: true }
    ).exec();
    return result ? User.restore(result) : null;
  }

  async updateById(id: string, updateData: Partial<User>): Promise<User | null> {
    const result = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
    return result ? User.restore(result) : null;
  }

  async findUsersWithAutoExpense(): Promise<User[]> {
    const results = await this.userModel.find({ autoExpenseEnabled: true }).exec();
    return User.restoreList(results);
  }
} 