import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  AuthResult,
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  UpdateProfileData 
} from '../entities/User';

/**
 * Authentication Repository Interface
 * Following the Repository pattern and Dependency Inversion Principle
 */
export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
  register(userData: RegisterData): Promise<RegisterResponse>;
  getProfile(): Promise<ProfileResponse>;
  updateProfile(profileData: UpdateProfileData): Promise<ProfileResponse>;
}

/**
 * Token Storage Interface
 * Abstracts token storage mechanism
 */
export interface ITokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  isAuthenticated(): boolean;
}