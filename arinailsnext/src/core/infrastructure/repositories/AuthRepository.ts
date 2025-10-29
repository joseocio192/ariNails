import { IAuthRepository, ITokenStorage } from '../../domain/repositories/IAuthRepository';
import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  LoginResponse,
  RegisterResponse,
  ProfileResponse 
} from '../../domain/entities/User';
import { IHttpClient } from '../http/AxiosHttpClient';
import { AuthError } from '../../application/interfaces/IAuthUseCases';

/**
 * Authentication Repository Implementation
 * Handles communication with the authentication API
 */
export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly tokenStorage: ITokenStorage
  ) {}

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Backend espera { username, password }
      const response = await this.httpClient.post<LoginResponse>('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      // El backend devuelve: { data: "token", message: "Login exitoso", isValid: true }
      if (response.isValid && response.data) {
        // response.data es el token JWT
        this.tokenStorage.setToken(response.data);
      } else {
        throw new AuthError(
          response.message || 'Credenciales inválidas',
          'LOGIN_ERROR'
        );
      }
      
      return response;
    } catch (error: any) {
      console.error('Login error in repository:', error);
      throw new AuthError(
        error.message || 'Error al iniciar sesión',
        'LOGIN_ERROR',
        error.response?.status
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await this.httpClient.post('/auth/logout', {});
    } catch (error) {
      // Log error but don't throw - logout should always succeed locally
      console.error('Error during server logout:', error);
    } finally {
      this.tokenStorage.removeToken();
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      // Backend endpoint: POST /usuario/cliente
      const response = await this.httpClient.post<RegisterResponse>('/usuario/cliente', {
        nombres: userData.nombres,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        usuario: userData.usuario,
        email: userData.email,
        password: userData.password
      });
      
      // El backend devuelve: { data: Usuario, message: "cliente registrado exitosamente", isValid: true }
      if (!response.isValid) {
        throw new AuthError(
          response.message || 'Error al registrar usuario',
          'REGISTER_ERROR'
        );
      }
      
      return response;
    } catch (error: any) {
      console.error('Register error in repository:', error);
      
      // Manejar errores específicos del backend
      if (error.message && error.message.includes('Usuario already exists')) {
        throw new AuthError(
          'El usuario o correo electrónico ya está registrado',
          'USER_EXISTS',
          error.response?.status
        );
      }
      
      throw new AuthError(
        error.message || 'Error al registrar usuario',
        'REGISTER_ERROR',
        error.response?.status
      );
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    try {
      // Backend endpoint: GET /profile (protected)
      const response = await this.httpClient.get<ProfileResponse>('/profile');
      return response;
    } catch (error: any) {
      console.error('Get profile error in repository:', error);
      throw new AuthError(
        error.message || 'Error al obtener perfil',
        'PROFILE_ERROR',
        error.response?.status
      );
    }
  }
}