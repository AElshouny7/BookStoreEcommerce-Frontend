import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlaceOrderItem {
  productId: number;
  quantity: number;
  unitPrice?: number;
}

export interface PlaceOrderDto {
  userId?: number; // backend can infer from token if you prefer
  items: PlaceOrderItem[];
  totalAmount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Order {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/orders`;

  placeOrder(dto: PlaceOrderDto): Observable<Order> {
    return this.http.post<Order>(this.base, dto);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  getForUser(userId: number): Observable<Order[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Order[]>(this.base, { params });
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status });
  }
}
