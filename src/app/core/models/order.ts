import { OrderItem } from './order-item';

export interface Order {
  id: number;
  userId: number;
  orderDate: string; // use string since HTTP JSON sends ISO date strings
  totalAmount: number;
  status?: string;
  orderItems?: OrderItem[];
}
