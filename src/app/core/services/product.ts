import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/products`;

  getAll(opts?: { categoryId?: number }): Observable<Product[]> {
    if (opts?.categoryId !== undefined) {
      return this.http.get<Product[]>(
        `${environment.apiBaseUrl}/products/category/${opts.categoryId}`
      );
    }
    return this.http.get<Product[]>(this.base);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  // Admin Only
  create(payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, payload);
  }
  update(id: number, payload: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, payload);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
