import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { ExpensesModule } from '@jnscas/cy/src/application/expenses/expenses.module'
import { GmailModule } from '@jnscas/cy/src/application/gmail/gmail.module'
import { UsersModule } from '@jnscas/cy/src/application/users/users.module'
import { HealthCheckController } from '@jnscas/cy/src/application/health-check.controller'
import { AuthModule } from '@jnscas/cy/src/application/auth/auth.module'
import { EncryptionModule } from '@jnscas/cy/src/infrastructure/encryption/encryption.module'

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
