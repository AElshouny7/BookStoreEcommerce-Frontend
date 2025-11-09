import { Component, inject, OnInit, signal } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { AuthService } from './core/services/auth';
import { GameballWidget } from './core/services/gameball-widget';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { filter } from 'rxjs';

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
  private gameball = inject(GameballWidget);

  async ngOnInit() {
    // Initialize Gameball for guests by default; will switch to customer on auth
    await this.gameball.initGuest();

    this.auth.initFromStorage();

    this.auth.currentUser$
      .pipe(filter((u) => u !== undefined)) // wait until auth resolves
      .subscribe(async (user) => {
        if (user && user.id) {
          await this.gameball.initCustomer(user.id, {
            displayName: user.fullName,
            email: user.email,
            firstName: user.fullName,
          });
        } else {
          await this.gameball.initGuest();
        }
      });

    // Example: wire callbacks to your analytics/telemetry
    this.gameball.widgetOpen$.subscribe(() => {
      // e.g., send event to your analytics layer / Datadog RUM
      // rum.addAction('gameball_widget_open');
      console.log('🎉 Gameball widget opened');
    });
    this.gameball.widgetClose$.subscribe(() => {
      console.log('👋 Gameball widget closed');
    });
  }
}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
});
