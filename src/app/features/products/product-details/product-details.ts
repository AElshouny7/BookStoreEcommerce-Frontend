import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { catchError, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Product } from '../../../core/models/product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsApi = inject(ProductService);

  quantity = 1;

  product$: Observable<Product | null> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id')) || 0),
    switchMap((id) => (id ? this.productsApi.getById(id) : of(null))),
    catchError(() => of(null)),
    shareReplay(1)
  );
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        if (!id) {
          this.errorMessage = 'Invalid product id.';
          return of(null);
        }

        console.log(this.product$);

        return this.productsApi.getById(id).pipe(
          tap(() => (this.isLoading = false)),
          catchError((err) => {
            this.isLoading = false;
            this.errorMessage = 'Product not found.';
            return of(null);
          })
        );
      })
    );
  }

  private clamp(val: number, min: number, max: number) {
    if (!Number.isFinite(val) || val < min) return min;
    if (val > max) return max;
    return Math.floor(val);
  }

  onQtyChange(stock: number) {
    this.quantity = this.clamp(this.quantity, 1, stock);
  }

  inc(stock: number) {
    this.quantity = this.clamp(this.quantity + 1, 1, stock);
  }

  dec() {
    this.quantity = this.clamp(this.quantity - 1, 1, Number.MAX_SAFE_INTEGER);
  }

  buyNow(p: Product | null) {
    if (!p) return;
    const qty = this.clamp(this.quantity, 1, p.stockQuantity ?? 1);
    this.router.navigate(['/checkout'], {
      state: { items: [{ productId: p.id, quantity: qty, title: p.title, price: p.price }] },
    });
  }
}
