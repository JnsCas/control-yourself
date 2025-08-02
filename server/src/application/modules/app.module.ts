import { AuthModule } from '@jnscas/cy/src/application/modules/auth.module'
import { ExpensesModule } from '@jnscas/cy/src/application/modules/expenses.module'
import { GmailModule } from '@jnscas/cy/src/application/modules/gmail.module'
import { HealthCheckController } from '@jnscas/cy/src/application/controllers/health-check/health-check.controller'
import { UsersModule } from '@jnscas/cy/src/application/modules/users.module'
import { EncryptionModule } from '@jnscas/cy/src/infrastructure/encryption/encryption.module'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ExpensesModule,
    GmailModule,
    AuthModule,
    EncryptionModule,
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}
