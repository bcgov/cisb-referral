import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { RegionsModule } from './regions/regions.module';
import { MinistriesModule } from './ministries/ministries.module';
import { AgencyTypesModule } from './agency-types/agency-types.module';
import { UsersModule } from './users/users.module';
import { ReferralsModule } from './referrals/referrals.module';
import { AuthModule } from './auth/auth.module';
import { HTTPLoggerMiddleware } from './middleware/req.res.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RegionsModule,
    MinistriesModule,
    AgencyTypesModule,
    UsersModule,
    ReferralsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLoggerMiddleware).forRoutes('*');
  }
}
