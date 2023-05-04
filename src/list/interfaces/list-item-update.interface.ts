import { IProduct } from "src/product/interfaces/product.interface";

export interface IListItemUpdate {
  readonly uId: string;
  readonly productId: string;
  readonly productDetails: IProduct;
  status: string;
};
