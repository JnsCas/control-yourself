import mongoose from "mongoose";

export class MongoIdManager {
  static randomId(): string {
    return new mongoose.Types.ObjectId().toString();
  }
}