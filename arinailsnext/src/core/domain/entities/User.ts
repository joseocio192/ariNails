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
  readonly nombresCompletos: string;
  readonly rol: {
    readonly id: number;
    readonly nombre: string;
    readonly descripcion: string;
  };
  readonly clienteId?: number | null;
  readonly empleadoId?: number | null;
  readonly telefono?: string; // From cliente table
  readonly direccion?: string; // From cliente table
  readonly clientes?: Array<{
    readonly id: number;
    readonly telefono: string;
    readonly direccion: string;
  }>;
  // Legacy fields for backward compatibility
  readonly rolId?: number;
  readonly rolNombre?: string;
  readonly rolDescripcion?: string;
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
  readonly telefono: string;
  readonly password: string;
}

/**
 * Value Object for updating user profile
 */
export interface UpdateProfileData {
  readonly email?: string;
  readonly telefono?: string;
  readonly direccion?: string;
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
export interface LoginResponse extends BackendResponse<{
  token: string;
  user: User;
}> {
  // data contains the token and user info
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
    return this.user.nombresCompletos || `${this.user.nombres} ${this.user.apellidoPaterno} ${this.user.apellidoMaterno}`.trim();
  }

  get isAdmin(): boolean {
    return (this.user.rol?.nombre || this.user.rolNombre || '').toLowerCase() === 'admin';
  }

  get isClient(): boolean {
    return (this.user.rol?.nombre || this.user.rolNombre || '').toLowerCase() === 'cliente';
  }
  
  get isEmployee(): boolean {
    return (this.user.rol?.nombre || this.user.rolNombre || '').toLowerCase() === 'empleado';
  }
  
  get roleName(): string {
    return this.user.rol?.nombre || this.user.rolNombre || '';
  }
  
  get roleDescription(): string {
    return this.user.rol?.descripcion || this.user.rolDescripcion || '';
  }

  toJSON(): User {
    return { ...this.user };
  }
}