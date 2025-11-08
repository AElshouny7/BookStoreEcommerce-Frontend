import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderCreateDto } from '../models/orderCreateDto';
import { Order as OrderModel } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/orders`;

  placeOrder(dto: OrderCreateDto): Observable<OrderModel> {
    return this.http.post<OrderModel>(this.base, dto);
  }

  getById(id: number): Observable<OrderModel> {
    return this.http.get<OrderModel>(`${this.base}/${id}`);
  }

  getForUser(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(`${this.base}/by-user`);
  }

  // Admin: get all orders in the system
  getAll(): Observable<OrderModel[]> {
    return this.http.get<OrderModel[]>(this.base);
  }

  // Admin: update order status using HTTP PUT per backend signature
  updateStatus(id: number, status: string): Observable<OrderModel> {
    return this.http.put<OrderModel>(`${this.base}/${id}/status`, { status });
  }

  createOrder(dto: OrderCreateDto): Observable<OrderModel> {
    return this.http.post<OrderModel>(`${this.base}`, dto);
  }
}
