import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IListItem } from './interfaces/list-item.interface';
import { ProductService } from 'src/product/product.service';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { IListItemUpdate } from './interfaces/list-item-update.interface';
import { UpdateListItemDto } from './dto/update-list-item.dto';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { IProduct } from 'src/product/interfaces/product.interface';
import { IListResult } from './interfaces/list-result.interface';
import { DeleteListItemDto } from './dto/delete-llist-item.dto';
import { statusEnum } from './enums/status.enum';

@Injectable()
export class ListService {
  constructor(
    @InjectModel('List') private readonly listModel: Model<IListItem>,
    private readonly productService: ProductService,
  ) {}

  async createList(): Promise<boolean> {
    const list = await new this.listModel();
    list.save();
    return true;
  };

  async getListItem(id: string): Promise<IListItem> {
    return await this.listModel.findById(id).exec();
  };

  async isExistingProductInList(productId: string): Promise<boolean> {
    const product = await this.listModel.findOne({ productId });
    return !!product;
  }

  async getUserProductsList(id: string): Promise<IListResult[]> {
    const products = await this.listModel.aggregate([
      {
        $match: { uId: new ObjectId(id) },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $addFields: { productDetails: { $last: "$productInfo" } } },
      { $replaceWith: {
        $unsetField: {
           field: "productInfo",
           input: "$$ROOT"
      }}}
    ]);

    return products;
  };

  async clearUserProductList(id: string): Promise<boolean> {
    await this.listModel.deleteMany({ uId: id });
    return true
  }

  async addItemToList(createListItemDto: CreateListItemDto, id: string): Promise<IListResult> {
    let product: IProduct;
    product = await this.productService.fintProductByTitle(createListItemDto.title);
    if (!product)
      product = await this.productService.create({ title: createListItemDto.title });

    const { _id: productId } = product;
    const isExists = await this.isExistingProductInList(productId);
    if (isExists)
      throw new HttpException('Already exists.', HttpStatus.BAD_REQUEST);

    const createdListItem = new this.listModel({ ..._.omit(createListItemDto, ['title']), productId, uId: id });
    createdListItem.save();

    const createdListItemObject = createdListItem.toObject();
    return { ...createdListItemObject, productDetails: product, productId };
  };

  async update(updateListItemDto: UpdateListItemDto): Promise<IListItemUpdate> {
    const listItem = await this.listModel.findById(updateListItemDto._id).exec();
    if (!listItem)
      throw new HttpException('Not Found.', HttpStatus.NOT_FOUND);

    const responseObject = listItem.toObject();
    const updatedResponse = _.assignIn(responseObject, { status: updateListItemDto.status });
    await this.listModel.updateOne({ _id: updateListItemDto._id }, { status: updateListItemDto.status }).exec();
    return updatedResponse;
  };

  async delete(deleteListItemDto: DeleteListItemDto, userId: string): Promise<boolean> {
    const listItem = this.getListItem(String(deleteListItemDto._id));
    if (userId !== (await listItem).uId)
      throw new HttpException('You dont have permission to delete this item.', HttpStatus.UNAUTHORIZED);

    await this.listModel.deleteOne({ _id: deleteListItemDto._id }).exec();
    return true;
  };

  async clearCart(userId: string): Promise<IListResult[]> {
    await this.listModel.updateMany({ uId: userId }, { status: statusEnum.none });
    return await this.getUserProductsList(userId);
  }
}
