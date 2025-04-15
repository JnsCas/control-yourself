import { Types } from 'mongoose'

export class MongoIdManager {
  static randomId(): string {
    return new Types.ObjectId().toString()
  }
}
