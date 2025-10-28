export interface Product {
  id: number;
  title: string;
  imageUrl?: string;
  price: number;
  description?: string;
  stockQuantity?: number;
  categoryId: number;
}
