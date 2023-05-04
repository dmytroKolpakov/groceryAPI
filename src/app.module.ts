import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { configureModule } from './configure.root';
import { ProductModule } from './product/product.module';
import { ListModule } from './list/list.module';

const environment = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    UserModule,
    AuthModule,
    configureModule,
    MongooseModule.forRoot(
      process.env.MONGODB_CONNECTION,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    ),
    TokenModule,
    ProductModule,
    ListModule,
  ],
})
export class AppModule {}
