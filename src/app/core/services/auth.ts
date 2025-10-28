import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

interface DecodedToken {
  sub: string;
  exp: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'access_token';

  // other components can subscribe to this
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginDto) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, credentials).subscribe({
      next: (res) => {
        const token = res.token;
        this.saveToken(token);
        this.updateAuthState(token);
      },
      error: (err) => {
        console.error('Login failed', err);
      },
    });
  }

  register(dto: RegisterDto) {
    return this.http.post(`${this.baseUrl}/register`, dto);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  initFromStorage() {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      return;
    }

    const decoded = this.decodeToken(token);

    if (decoded && !this.isTokenExpired(decoded)) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(decoded);
    } else {
      this.logout(); // clear expired token
    }
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  private isTokenExpired(decoded: DecodedToken): boolean {
    const now = Date.now() / 1800; // seconds
    return decoded.exp < now;
  }

  private saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  private updateAuthState(token: string) {
    const decoded = this.decodeToken(token);
    if (!decoded) return;

    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(decoded);
  }
}
