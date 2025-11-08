import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order } from '../../../core/models/order';
import { OrderService } from '../../../core/services/order';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private api = inject(OrderService);

  // state
  loading = signal(false);
  error = signal<string>('');
  orders = signal<Order[]>([]);
  // per-row selected status values
  selected = signal<Record<number, string>>({});

  // Align with backend enum Status { Pending, Completed, Cancelled }
  readonly statuses = ['Pending', 'Completed', 'Cancelled'] as const;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.getAll().subscribe({
      next: (items) => {
        this.orders.set(items ?? []);
        // initialize selected map from current statuses
        const map: Record<number, string> = {};
        for (const o of items ?? []) {
          if (o?.id != null && o?.status) map[o.id] = o.status;
        }
        this.selected.set(map);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load orders.');
      },
    });
  }

  onChangeStatus(id: number, value: string) {
    this.selected.update((s) => ({ ...s, [id]: value }));
  }

  save(o: Order) {
    const current = this.selected()[o.id] || o.status || 'Pending';
    this.api.updateStatus(o.id, current).subscribe({
      next: (updated) => {
        // reflect in list
        this.orders.update((arr) =>
          arr.map((it) => (it.id === o.id ? { ...it, status: updated.status ?? current } : it))
        );
      },
      error: () => {
        // keep UI value but show feedback
        alert('Failed to update status');
      },
    });
  }
}
