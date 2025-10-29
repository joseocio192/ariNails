/**
 * User Entity - Core Domain Model
 * Represents a user in the system following Domain-Driven Design principles
 */
export interface User {
  readonly id: number;
  readonly usuario: string;
  readonly email: string;
  readonly nombres: string;
  readonly apellidoPaterno: string;
  readonly apellidoMaterno: string;
  readonly rolId: number;
  readonly rolNombre: string;
  readonly rolDescripcion: string;
}

/**
 * Value Object for user credentials
 */
export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

/**
 * Value Object for user registration data
 */
export interface RegisterData {
  readonly nombres: string;
  readonly apellidoPaterno: string;
  readonly apellidoMaterno: string;
  readonly usuario: string;
  readonly email: string;
  readonly password: string;
}

/**
 * Backend response wrapper
 */
export interface BackendResponse<T = any> {
  readonly data: T;
  readonly message: string;
  readonly isValid: boolean;
}

/**
 * Authentication result from backend
 */
export interface AuthResult {
  readonly isValid: boolean;
  readonly data?: string; // JWT token
  readonly message?: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse extends BackendResponse<string> {
  // data contains the JWT token
}

/**
 * Register response from backend
 */
export interface RegisterResponse extends BackendResponse<User> {
  // data contains the created user
}

/**
 * Profile response from backend
 */
export interface ProfileResponse extends BackendResponse<User> {
  // data contains the user profile
}

/**
 * User domain methods
 */
export class UserEntity {
  constructor(private readonly user: User) {}

  get fullName(): string {
    return `${this.user.nombres} ${this.user.apellidoPaterno} ${this.user.apellidoMaterno}`.trim();
  }

  get isAdmin(): boolean {
    return this.user.rolNombre.toLowerCase() === 'admin';
  }

  get isClient(): boolean {
    return this.user.rolNombre.toLowerCase() === 'cliente';
  }

  toJSON(): User {
    return { ...this.user };
  }
}