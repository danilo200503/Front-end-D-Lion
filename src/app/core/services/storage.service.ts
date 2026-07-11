import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TOKEN_KEY = 'dlion_token';
  private readonly REFRESH_KEY = 'dlion_refresh_token';
  private readonly USER_KEY = 'dlion_user';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  setUser<T>(user: T): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser<T>(): T | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
