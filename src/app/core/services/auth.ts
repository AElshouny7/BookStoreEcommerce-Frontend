import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
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
  private readonly MS_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  private readonly MS_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
  private readonly MS_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'access_token';

  // other components can subscribe to this
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginDto) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        const token = res.token;
        this.saveToken(token);
        this.updateAuthState(token);
      })
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<{ token?: string }>(`${this.baseUrl}/register`, dto);
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
      this.updateAuthState(token);
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

    // handle Microsoft-style role claim (Fixing Policies)
    const role = decoded[this.MS_ROLE] || decoded['role'] || 'User';

    const email = decoded[this.MS_EMAIL] || decoded.sub || '';

    const name = decoded[this.MS_NAME] || email;

    const user = {
      name,
      email,
      role,
    };

    console.log('Decoded user:', user);

    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
  }
}
