import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category';
import { Category } from '../../../core/models/category';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss',
})
export class AdminCategories {
  private fb = inject(FormBuilder);
  private categoryApi = inject(CategoryService);

  categories: Category[] = [];
  editingId: number | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.categoryApi.getAll().subscribe((res) => (this.categories = res));
  }

  save() {
    if (this.form.invalid) return;
    const data = this.form.value as Category;
    const req = this.editingId
      ? this.categoryApi.update(this.editingId, data)
      : this.categoryApi.create(data);

    req.subscribe(() => {
      this.form.reset();
      this.editingId = null;
      this.fetchCategories();
    });
  }

  edit(c: Category) {
    this.editingId = c.id;
    this.form.patchValue(c);
  }

  delete(id: number) {
    if (!confirm('Delete this category?')) return;
    this.categoryApi.delete(id).subscribe(() => this.fetchCategories());
  }
}
