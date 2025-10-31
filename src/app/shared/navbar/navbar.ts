import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  isAuthenticated$ = this.auth.isAuthenticated$;
  user$ = this.auth.currentUser$;

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  closeMenu() {
    this.menuOpen = false;
  }

  async goLogin() {
    await this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  async goOrders() {
    this.closeMenu();
    await this.router.navigate(['/orders']);
  }

  async goAdmin() {
    this.closeMenu();
    await this.router.navigate(['/admin']);
  }

  async logout() {
    this.closeMenu();
    this.auth.logout();
    await this.router.navigate(['/']);
  }
}
