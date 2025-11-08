import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/order';
import { Order as OrderModel } from '../../core/models/order';
import { OrderCreateDto } from '../../core/models/orderCreateDto';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private router = inject(Router);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);

  user$ = this.auth.currentUser$;

  placing = false;
  errorMsg = '';

  OrderItems: { productId: number; quantity: number; title?: string; price?: number }[] =
    Array.isArray(this.router.currentNavigation()?.extras?.state?.['items'])
      ? this.router.currentNavigation()!.extras!.state!['items']
      : Array.isArray(history.state?.['items'])
      ? history.state['items']
      : [];

  clampQuantity(q: number) {
    return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
  }

  onQtyChange(i: number) {
    this.OrderItems[i].quantity = this.clampQuantity(this.OrderItems[i].quantity);
  }

  remove(i: number) {
    this.OrderItems.splice(i, 1);
  }

  get previewTotal(): number {
    return this.OrderItems.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0);
  }

  get total(): number {
    return this.previewTotal;
  }

  placeOrder() {
    this.errorMsg = '';
    if (this.OrderItems.length === 0) {
      this.errorMsg = 'Your checkout list is empty.';
      return;
    }

    this.placing = true;

    const dto: OrderCreateDto = {
      OrderItems: this.OrderItems.map((i) => ({
        productId: i.productId,
        quantity: this.clampQuantity(i.quantity),
      })),
    };

    this.orderService.createOrder(dto).subscribe({
      next: (order: OrderModel) => {
        this.placing = false;
        this.router.navigate(['/order', order.id]);
      },
      error: (err) => {
        this.placing = false;

        if (err?.status === 409 && err?.error?.shortages?.length) {
          const lines = err.error.shortages.map(
            (s: any) =>
              `Product ${s.productId}: requested ${s.requested ?? '?'} but only ${
                s.available ?? 0
              } in stock`
          );
          this.errorMsg = `Some items exceed available stock:\n• ${lines.join('\n• ')}`;
          return;
        }

        if (err?.status === 401) {
          this.errorMsg = 'Your session expired. Please sign in again.';
          return;
        }

        this.errorMsg = 'Could not place the order. Please try again.';
      },
    });
  }
}
