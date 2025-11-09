import { Component, inject, OnInit, signal } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { AuthService } from './core/services/auth';
import { GameballWidget } from './core/services/gameball-widget';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App implements OnInit {
  protected readonly title = signal('Shounzeetos');

  private auth = inject(AuthService);
  // private gameball = inject(GameballWidget);

  ngOnInit(): void {
    // Initialize Gameball for guests by default; will switch to customer on auth
    // this.gameball.initGuest();

    this.auth.initFromStorage();

    // this.auth.currentUser$.subscribe((user) => {
    //   if (user) {
    //     this.gameball.initCustomer(user.id, {
    //       displayName: user.name,
    //       email: user.email,
    //     });
    //   } else {
    //     this.gameball.resetToGuest();
    //   }
    // });
  }
}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
});
