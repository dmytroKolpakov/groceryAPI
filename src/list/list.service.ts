import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isObjectIdOrHexString } from 'mongoose';
import { IListItem } from './interfaces/list-item.interface';
import { ProductService } from 'src/product/product.service';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { IListItemUpdate } from './interfaces/list-item-update.interface';
import { UpdateListItemDto } from './dto/update-list-item.dto';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { IProduct } from 'src/product/interfaces/product.interface';
import { IListResult } from './interfaces/list-result.interface';
import { statusEnum } from './enums/status.enum';
import { UserService } from 'src/user/user.service';
import { EventsGateway } from 'src/events/events.gateway';
import { eventEnum } from 'src/events/enums/event-type.enum';
import { ICreateListItemMany } from './interfaces/list-item-create-many.interface';
import { SyncListDto } from './dto/sync-list.dto';
import { SyncDto } from './dto/sync.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectModel('List') private readonly listModel: Model<IListItem>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createList(): Promise<boolean> {
    const list = await new this.listModel();
    list.save();
    return true;
  };

  async match(idList: Array<string>, uId: string): Promise<Array<IProduct>> {
    const listItems = await this.listModel.aggregate([
      {
        $match: {
          _id: {
            $in: idList?.map(i => new ObjectId(i))
          }
        }
      },
    ]);

    return listItems;
  }

  async createMany(list: Array<ICreateListItemMany>): Promise<boolean> {
    await this.listModel.insertMany(list);
    return true;
  }

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
    const { deviceId } = (await this.userService.find(id)).toObject();
    const isExists = await this.isExistingProductInList(productId);
    if (isExists)
      throw new HttpException('Already exists.', HttpStatus.BAD_REQUEST);

    const createdListItem = new this.listModel({ ..._.omit(createListItemDto, ['title']), productId, uId: id });
    createdListItem.save();

    const createdListItemObject = createdListItem.toObject();
    const response = { ...createdListItemObject, productDetails: product, productId };
    this.eventsGateway.customEmit(deviceId, response, eventEnum.create, createListItemDto?.excludeId);
    return response;
  };

  async update(updateListItemDto: UpdateListItemDto, userId: string): Promise<IListItemUpdate> {
    const user = (await this.userService.find(userId)).toObject();
    const listItem = await this.listModel.findById(updateListItemDto._id).exec();
    if (!listItem)
      throw new HttpException('Not Found.', HttpStatus.NOT_FOUND);

    const responseObject = listItem.toObject();
    const product = await this.productService.findProduct(responseObject.productId);
    const updatedResponse = _.assignIn(responseObject, { status: updateListItemDto.status, productDetails: product });
    await this.listModel.updateOne({ _id: updateListItemDto._id }, { status: updateListItemDto.status }).exec();
    this.eventsGateway.customEmit(user.deviceId, updatedResponse, eventEnum.update, updateListItemDto?.excludeId);
    return updatedResponse;
  };

  async delete(id: string, userId: string, excludeId?: string,): Promise<boolean> {
    if (!id && isObjectIdOrHexString(id))
      throw new HttpException("No list item id.", HttpStatus.BAD_REQUEST);
    try {
      new ObjectId(id);
    } catch (e) {
      throw new HttpException("_id must be an ObjectId", HttpStatus.BAD_REQUEST);
    }
    const listItem = await this.getListItem(String(id));
    if (!listItem)
      throw new HttpException("Item with this id was not found.", HttpStatus.NOT_FOUND);

    if (userId !== String(listItem.uId))
      throw new HttpException('You dont have permission to delete this item.', HttpStatus.UNAUTHORIZED);

    const { deviceId } = (await this.userService.find(userId)).toObject();
    this.eventsGateway.customEmit(deviceId, listItem, eventEnum.delete, excludeId);

    await this.listModel.deleteOne({ _id: id }).exec();
    return true;
  };

  async clearCart(userId: string): Promise<IListResult[]> {
    await this.listModel.updateMany({ uId: userId }, { status: statusEnum.home });
    return await this.getUserProductsList(userId);
  };

  async syncData(syncDto: SyncDto, userId: string): Promise<any> {
    const syncListDto = syncDto.list;
    const excludeId = syncDto?.excludeId;
    const moveToCartList = syncListDto.filter((item) => item.status === statusEnum.cart);
    const moveToHomeList = syncListDto.filter((item) => item.status === statusEnum.home);
    const cartIds = moveToCartList?.map(item => item?._id);
    const homeIds = moveToHomeList?.map(item => item?._id);
    let cartResponse = [];
    let homeResponse = [];
    const { deviceId } = (await this.userService.find(userId)).toObject();
    if (cartIds?.length) {
      const cartItemsToUpdate = await this.match(cartIds, userId);
      if (cartItemsToUpdate?.length) {
        await this.listModel.updateMany(
          { _id: { $in: cartItemsToUpdate?.map((i) => i._id) }},
          { $set: { status: statusEnum.cart }}
        );
        cartResponse = cartItemsToUpdate?.map((i) => ({ _id: i._id, status: statusEnum.cart }))
      }
    };

    if (homeIds?.length) {
      const homeItemsToUpdate = await this.match(homeIds, userId);
      if (homeItemsToUpdate?.length) {
        await this.listModel.updateMany(
          { _id: { $in: homeItemsToUpdate?.map((i) => i._id) }},
          { $set: { status: statusEnum.home }}
        );
        homeResponse = homeItemsToUpdate?.map((i) => ({ _id: i._id, status: statusEnum.home }));
      };
    };

    const response: SyncListDto[] = [...cartResponse, ...homeResponse];
    this.eventsGateway.customEmit(deviceId, response, eventEnum.sync, excludeId);
    return response;
  }
}
