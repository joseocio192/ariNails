import { IAuthUseCases, AuthError } from '../interfaces/IAuthUseCases';
import { IAuthRepository, ITokenStorage } from '../../domain/repositories/IAuthRepository';
import { LoginCredentials, RegisterData, User, UpdateProfileData } from '../../domain/entities/User';

/**
 * Authentication Use Cases Implementation
 * Orchestrates business logic and enforces business rules
 */
export class AuthUseCases implements IAuthUseCases {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenStorage: ITokenStorage
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    // Business rule: validate credentials format
    this.validateLoginCredentials(credentials);

    try {
      const result = await this.authRepository.login(credentials);
      
      if (!result.isValid || !result.data) {
        throw new AuthError('Credenciales inválidas', 'INVALID_CREDENTIALS');
      }

      // El backend ahora retorna el usuario directamente en la respuesta
      const { user } = result.data;
      
      if (!user) {
        throw new AuthError('Error al obtener datos del usuario', 'USER_DATA_ERROR');
      }

      return user;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Login error:', error);
      throw new AuthError('Error al iniciar sesión', 'LOGIN_FAILED');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      // Log error but don't throw - logout should always succeed
      console.error('Logout error:', error);
    }
  }

  async register(userData: RegisterData): Promise<User> {
    // Business rule: validate registration data
    this.validateRegistrationData(userData);

    try {
      const result = await this.authRepository.register(userData);
      
      if (!result.isValid) {
        throw new AuthError(
          result.message || 'Error en el registro', 
          'REGISTRATION_FAILED'
        );
      }

      // After successful registration, login the user
      const loginResult = await this.login({
        username: userData.usuario,
        password: userData.password
      });

      return loginResult;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new AuthError('Error al registrar usuario', 'REGISTRATION_FAILED');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const profileResponse = await this.authRepository.getProfile();
      
      if (!profileResponse.isValid || !profileResponse.data) {
        return null;
      }

      return profileResponse.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    // Business rule: validate profile data
    this.validateProfileData(profileData);

    try {
      const result = await this.authRepository.updateProfile(profileData);
      
      if (!result.isValid || !result.data) {
        throw new AuthError(
          result.message || 'Error al actualizar perfil', 
          'UPDATE_PROFILE_FAILED'
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Update profile error:', error);
      throw new AuthError('Error al actualizar perfil', 'UPDATE_PROFILE_FAILED');
    }
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!credentials.username || credentials.username.trim().length === 0) {
      throw new AuthError('El nombre de usuario es requerido', 'INVALID_USERNAME');
    }

    if (!credentials.password || credentials.password.length < 6) {
      throw new AuthError('La contraseña debe tener al menos 6 caracteres', 'INVALID_PASSWORD');
    }
  }

  private validateRegistrationData(userData: RegisterData): void {
    if (!userData.nombres || userData.nombres.trim().length === 0) {
      throw new AuthError('El nombre es requerido', 'INVALID_NAMES');
    }

    if (!userData.apellidoPaterno || userData.apellidoPaterno.trim().length === 0) {
      throw new AuthError('El apellido paterno es requerido', 'INVALID_LASTNAME');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new AuthError('El email no es válido', 'INVALID_EMAIL');
    }

    if (!userData.usuario || userData.usuario.trim().length < 3) {
      throw new AuthError('El usuario debe tener al menos 3 caracteres', 'INVALID_USERNAME');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new AuthError('La contraseña debe tener al menos 6 caracteres', 'INVALID_PASSWORD');
    }
  }

  private validateProfileData(profileData: UpdateProfileData): void {
    if (profileData.email && !this.isValidEmail(profileData.email)) {
      throw new AuthError('El email no es válido', 'INVALID_EMAIL');
    }

    if (profileData.telefono && !/^\d{10}$/.test(profileData.telefono)) {
      throw new AuthError('El teléfono debe tener 10 dígitos', 'INVALID_PHONE');
    }

    if (profileData.direccion && profileData.direccion.trim().length < 10) {
      throw new AuthError('La dirección debe tener al menos 10 caracteres', 'INVALID_ADDRESS');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}