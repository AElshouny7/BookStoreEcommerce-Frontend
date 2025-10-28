import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/categories`;

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.base}/${id}`);
  }

  // Admin Only
  create(payload: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.base, payload);
  }
  update(id: number, payload: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, payload);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
