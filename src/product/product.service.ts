import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { IProduct } from './interfaces/product.interface';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private readonly productModel: Model<IProduct>) {}

  async create(createProductDto: CreateProductDto): Promise<IProduct> {
    const product = new this.productModel(createProductDto);
    return await product.save();
  };

  async deleteProduct(id: string): Promise<boolean> {
    try {
      this.productModel.deleteOne({ _id: id });
      return true;
    } catch (e) {
      throw new BadRequestException('Failed to delete');
    };
  };

  async findProduct(id: string): Promise<IProduct> {
    return await this.productModel.findById(id).exec();
  };

  async fintProductByTitle(title: string): Promise<IProduct> {
    return await this.productModel.findOne({ title }).exec();
  }

};
