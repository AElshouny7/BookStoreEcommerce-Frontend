import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.auth
      .login(this.form.value as any)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          setTimeout(() => this.router.navigateByUrl(this.returnUrl), 100);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Invalid email or password.';
        },
      });
  }
}
