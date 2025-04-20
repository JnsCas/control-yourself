import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'

@Module({
  providers: [
    {
      provide: OAuth2Client,
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(
          configService.get('GOOGLE_CLIENT_ID'),
          configService.get('GOOGLE_CLIENT_SECRET'),
          configService.get('GOOGLE_REDIRECT_URI'),
        )
      },
      inject: [ConfigService],
    },
  ],
  exports: [OAuth2Client],
})
export class OAuth2Module {}
