import { ITokenStorage } from '../../domain/repositories/IAuthRepository';

/**
 * Browser Token Storage Implementation
 * Handles token storage in localStorage with error handling
 */
export class BrowserTokenStorage implements ITokenStorage {
  private readonly TOKEN_KEY = 'auth_token';

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in storage:', error);
    }
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from storage:', error);
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple token validation - check if it's not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
}