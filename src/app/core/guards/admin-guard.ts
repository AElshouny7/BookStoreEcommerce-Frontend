import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    take(1),
    map((user) => {
      const isAdmin = String(user?.role).toLowerCase() === 'admin';
      if (isAdmin) return true;

      console.log('Guard sees user:', user);

      router.navigate(['/']);
      return false;
    })
  );
};
