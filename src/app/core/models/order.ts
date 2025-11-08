import { OrderItem } from './order-item';

export interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status?: string;
  orderItems?: OrderItem[];
}
