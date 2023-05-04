import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { TokenModule } from 'src/token/token.module';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    TokenModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }])
  ],
  providers: [ProductService, JwtStrategy],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
