import { LoginCredentials, RegisterData, User } from '@/core/domain/entities/User';

/**
 * Authentication Use Cases Interface
 * Application layer - orchestrates business logic
 */
export interface IAuthUseCases {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  register(userData: RegisterData): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
}

/**
 * Custom errors for better error handling
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}