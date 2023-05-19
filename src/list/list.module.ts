import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { TokenModule } from 'src/token/token.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ListSchema } from './schemas/list.schema';
import { ProductModule } from 'src/product/product.module';
import { EventsModule } from 'src/events/events.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TokenModule,
    ProductModule,
    EventsModule,
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'List', schema: ListSchema }]),
  ],
  providers: [ListService, JwtStrategy],
  controllers: [ListController],
  exports: [ListService],
})
export class ListModule {}
