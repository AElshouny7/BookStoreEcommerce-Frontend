import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../core/models/product';
import { Category } from '../../core/models/category';
import { ProductService } from '../../core/services/product';
import { CategoryService } from '../../core/services/category';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  isLoading = false;
  errorMessage = '';

  categories$: Observable<Category[]> = of([]);
  featuredProducts$: Observable<Product[]> = of([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // this.isLoading = true;
    // this.categories$ = this.categoryService.getAll().pipe(catchError(() => of([])));
    // this.featuredProducts$ = this.productService.getAll().pipe(
    //   map((products) => products.slice(0, 8)),
    //   tap(() => (this.isLoading = false)),
    //   catchError((err) => {
    //     this.isLoading = false;
    //     this.errorMessage = 'Failed to load products.';
    //     return of([]);
    //   })
    // );
  }
}
