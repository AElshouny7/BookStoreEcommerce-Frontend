import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
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

    // Strategy: register, then (optionally) auto-login
    this.auth
      .register(this.form.value as any)
      .pipe(
        switchMap(() =>
          this.auth.login({
            email: this.form.value.email!,
            password: this.form.value.password!,
          })
        ),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Registration failed.';
        },
      });
  }
}
