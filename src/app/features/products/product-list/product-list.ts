import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { CategoryService } from '../../../core/services/category';
import { catchError, combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { Category } from '../../../core/models/category';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private productsApi = inject(ProductService);
  private categoriesApi = inject(CategoryService);
  private route = inject(ActivatedRoute);

  categories$: Observable<Category[]> = of([]);
  products$: Observable<Product[]> = of([]);
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.categories$ = this.categoriesApi.getAll().pipe(catchError(() => of([])));

    this.products$ = this.route.queryParamMap.pipe(
      map((params) => {
        const id = params.get('categoryId');
        return id ? Number(id) : undefined;
      }),
      switchMap((categoryId) =>
        this.productsApi.getAll({ categoryId }).pipe(
          catchError((err) => {
            this.errorMessage = 'Failed to load products.';
            return of([]);
          }),
          startWith([] as Product[])
        )
      )
    );

    combineLatest([this.categories$, this.products$]).subscribe(() => (this.isLoading = false));
  }
}
