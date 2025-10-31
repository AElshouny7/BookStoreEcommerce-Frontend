export interface Product {
  id: number;
  title: string;
  imageURL?: string;
  price: number;
  description?: string;
  stockQuantity?: number;
  categoryId: number;
}
