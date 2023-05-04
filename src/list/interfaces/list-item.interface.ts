import { IProduct } from "src/product/interfaces/product.interface";

export interface IListItem {
  readonly uId: string,
  readonly status: string;
  readonly productId: string;
  readonly productDetails: IProduct;
};