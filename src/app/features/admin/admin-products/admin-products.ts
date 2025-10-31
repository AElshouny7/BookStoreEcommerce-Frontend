import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../core/models/product';
import { Observable, tap } from 'rxjs';
import { CategoryService } from '../../../core/services/category';
import { Category } from '../../../core/models/category';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProducts {
  private fb = inject(FormBuilder);
  private productApi = inject(ProductService);
  private categoryApi = inject(CategoryService);

  products: Product[] = [];
  loading = false;
  categories$: Observable<Category[]> = this.categoryApi.getAll();
  editingId: number | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    imageURL: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: [0, Validators.required],
  });

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = true;
    this.productApi
      .getAll()
      .pipe(tap(() => (this.loading = false)))
      .subscribe({
        next: (res) => (this.products = res),
        error: () => (this.loading = false),
      });
  }

  save() {
    if (this.form.invalid) return;
    const data = this.form.value as Partial<Product>;

    const request = this.editingId
      ? this.productApi.update(this.editingId, data)
      : this.productApi.create(data);

    request.subscribe(() => {
      this.form.reset();
      this.editingId = null;
      this.fetchProducts();
    });
  }

  edit(p: Product) {
    this.editingId = p.id;
    this.form.patchValue({
      title: p.title,
      imageURL: p.imageURL ?? '',
      price: p.price,
      description: p.description ?? '',
      stockQuantity: p.stockQuantity ?? 0,
      categoryId: p.categoryId, // <-- select shows the category
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number) {
    if (!confirm('Are you sure?')) return;
    this.productApi.delete(id).subscribe(() => this.fetchProducts());
  }

  clearForm() {
    this.form.reset({
      title: '',
      imageURL: '',
      price: 0,
      description: '',
      stockQuantity: 0,
      categoryId: null,
    });
    this.editingId = null;
  }
}
