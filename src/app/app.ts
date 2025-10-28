import { Component, inject, OnInit, signal } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { AuthService } from './core/services/auth';
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

  ngOnInit(): void {
    this.auth.initFromStorage();
  }
}

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
});
