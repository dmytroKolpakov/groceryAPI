import { Body, Controller, Delete, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { IProduct } from './interfaces/product.interface';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post('/create')
  @UseGuards(AuthGuard())
  async createProduct(@Body(new ValidationPipe()) createProductDto: CreateProductDto): Promise<IProduct> {
    return await this.productService.create(createProductDto)
  };
};
