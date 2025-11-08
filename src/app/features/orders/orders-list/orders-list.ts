import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OrderService } from '../../../core/services/order';
import { Order } from '../../../core/models/order';

@Component({
  selector: 'app-orders-list',
  // standalone default is true in v20; no need to set explicitly
  imports: [CommonModule, RouterModule, FormsModule], // ngModel for the Status <select>
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersList {
  private ordersService = inject(OrderService);

  loading = signal(false);
  error = signal<string>('');
  status = signal<string | undefined>(undefined); // "Pending" | "Completed" | "Cancelled" | undefined

  // Data shape matches your template: data()?.items
  data = signal<{ items: Order[] } | null>(null);

  // Popup state
  selectedOrder = signal<Order | null>(null);
  modalLoading = signal(false);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.ordersService.getForUser().subscribe({
      next: (orders: Order[]) => {
        const s = this.status(); // current status filter (if any)
        const filtered = s
          ? orders.filter((o) => (o.status ?? '').toLowerCase() === s.toLowerCase())
          : orders;
        this.data.set({ items: filtered ?? [] });
        this.loading.set(false);
      },
      error: (err: { status?: number }) => {
        this.loading.set(false);
        this.error.set(err?.status === 401 ? 'Please sign in again.' : 'Failed to load orders.');
      },
    });
  }

  openOrder(o: Order) {
    // If order items are already present, show immediately
    if (o.orderItems && o.orderItems.length > 0) {
      this.selectedOrder.set(o);
      return;
    }
    // Otherwise, fetch full details
    this.modalLoading.set(true);
    this.selectedOrder.set({ ...o });
    this.ordersService.getById(o.id).subscribe({
      next: (full) => {
        this.selectedOrder.set(full);
        this.modalLoading.set(false);
      },
      error: () => {
        // Keep minimal info and stop loading; optionally show a message inside dialog
        this.modalLoading.set(false);
      },
    });
  }

  closeOrder() {
    this.selectedOrder.set(null);
  }
}
