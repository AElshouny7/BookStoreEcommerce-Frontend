import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { catchError, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsApi = inject(ProductService);

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

  buyNow(p: Product | null) {
    if (!p) return;
    // for now just navigate to checkout and pass product info
    this.router.navigate(['/checkout'], { state: { items: [{ productId: p.id, quantity: 1 }] } });
  }
}
