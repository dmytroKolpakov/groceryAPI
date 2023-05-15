import { Controller, Delete, Get, Patch, Post, UseGuards, Request, Body, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { IListItem } from './interfaces/list-item.interface';
import { UpdateListItemDto } from './dto/update-list-item.dto';
import { IListItemUpdate } from './interfaces/list-item-update.interface';
import { ListService } from './list.service';
import { DeleteListItemDto } from './dto/delete-llist-item.dto';
import { IListResult } from './interfaces/list-result.interface';

@ApiTags('list')
@Controller('list')
export class ListController {
  constructor(private readonly listServise: ListService) { }

  @Get('/')
  @UseGuards(AuthGuard())
  async getProductsList(@Request() req: any): Promise<IListItem[]> {
    return this.listServise.getUserProductsList(req.user._id);
  }

  @Post('/add')
  @UseGuards(AuthGuard())
  async addItemToList(
    @Request() req: any,
    @Body(new ValidationPipe()) createListItemDto: CreateListItemDto
  ): Promise<IListItem> {
    return this.listServise.addItemToList(createListItemDto, req.user._id);
  };

  @Patch('/status')
  @UseGuards(AuthGuard())
  async updateStatus(
    @Request() req: any,
    @Body(new ValidationPipe()) updateListItemDto: UpdateListItemDto
  ): Promise<IListItemUpdate> {
    return this.listServise.update(updateListItemDto, req.user._id)
  }

  @Patch('/clearCart')
  @UseGuards(AuthGuard())
  async clearCart(@Request() req: any): Promise<IListResult[]> {
    return await this.listServise.clearCart(req.user._id);
  }

  @Delete('/delete')
  @UseGuards(AuthGuard())
  async deleteProductFromList(
    @Request() req: any,
    @Body(new ValidationPipe()) deleteListItemDto: DeleteListItemDto
  ): Promise<boolean> {
    return this.listServise.delete(deleteListItemDto, req.user._id);
  }

  @Delete('/deleteAll')
  @UseGuards(AuthGuard())
  async clearAllProductsInList(@Request() req: any) {
    return await this.listServise.clearUserProductList(req.user._id);
  }
};
