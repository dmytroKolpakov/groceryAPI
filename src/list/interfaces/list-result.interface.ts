import { IProduct } from "src/product/interfaces/product.interface";

export interface IListResult {
  readonly uId: string;
  readonly productId: string;
  readonly status: string;
  readonly productDetails: IProduct;
};