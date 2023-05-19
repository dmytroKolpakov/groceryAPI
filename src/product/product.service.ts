import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async createMany(list: Array<string>): Promise<Array<IProduct>> {
    const existedProducts = await this.match(list);
    const productsToCreate = list?.filter(product => !existedProducts?.map(p => p.title).includes(product));
    const insertMany = productsToCreate?.map(p => ({ title: p }));
    await this.productModel.insertMany(insertMany);
    return await this.match(list);
  }

  async match(titleList: Array<string>): Promise<Array<IProduct>> {
    const products = await this.productModel.aggregate([
      {
        $match: {
          title: {
            $in: titleList
          }
        }
      }
    ]);

    return products;
  }

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
