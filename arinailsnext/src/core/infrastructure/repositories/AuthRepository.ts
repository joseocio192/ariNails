import { IAuthRepository, ITokenStorage } from '../../domain/repositories/IAuthRepository';
import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  UpdateProfileData,
  BackendResponse
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
      
      // El backend ahora devuelve: { data: { token: "...", user: {...} }, message: "Login exitoso", isValid: true }
      if (response.isValid && response.data) {
        // Extraer el token del objeto data
        const { token, user } = response.data;
        this.tokenStorage.setToken(token);
        
        // Retornar la respuesta completa
        return response;
      } else {
        throw new AuthError(
          response.message || 'Credenciales inválidas',
          'LOGIN_ERROR'
        );
      }
    } catch (error: any) {
      console.error('Login error in repository:', error);
      
      // Extraer el mensaje de error del backend si está disponible
      let errorMessage = 'Error al iniciar sesión';
      
      // Verificar si el error viene del backend con un mensaje específico
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Si el backend devuelve "El usuario no existe"
      if (errorMessage.includes('usuario no existe') || errorMessage.includes('User not found')) {
        errorMessage = 'El usuario no existe. Por favor, verifica tu nombre de usuario.';
      }
      
      // Si el backend devuelve "La contraseña es incorrecta"
      if (errorMessage.includes('contraseña es incorrecta') || errorMessage.includes('password')) {
        errorMessage = 'La contraseña es incorrecta. Por favor, inténtalo de nuevo.';
      }
      
      throw new AuthError(
        errorMessage,
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
        telefono: userData.telefono,
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
      
      // Mapear username → usuario si es necesario
      if (response.data && 'username' in response.data && !response.data.usuario) {
        const userData: any = { ...response.data };
        userData.usuario = userData.username;
        userData.id = userData.userId || userData.id;
        
        // Construir el objeto rol si no existe
        if (!userData.rol && userData.rolId) {
          userData.rol = {
            id: userData.rolId,
            nombre: userData.rolNombre || '',
            descripcion: userData.rolDescripcion || '',
          };
        }
        
        // Construir nombresCompletos si no existe
        if (!userData.nombresCompletos) {
          userData.nombresCompletos = `${userData.nombres} ${userData.apellidoPaterno} ${userData.apellidoMaterno || ''}`.trim();
        }
        
        // Mapear datos del cliente si existen (telefono y direccion)
        if (userData.clientes && userData.clientes.length > 0) {
          userData.telefono = userData.clientes[0].telefono;
          userData.direccion = userData.clientes[0].direccion;
        } else if (userData.telefono === undefined) {
          // Si no hay clientes, asegurarse de que existan los campos aunque sean null
          userData.telefono = userData.telefono || null;
          userData.direccion = userData.direccion || null;
        }
        
        // Retornar un nuevo objeto con los datos mapeados
        return {
          ...response,
          data: userData
        };
      }
      
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

  async updateProfile(profileData: UpdateProfileData): Promise<BackendResponse<User>> {
    try {
      const response = await this.httpClient.patch<BackendResponse<User>>('/usuario/profile', profileData);
      
      // Si el backend ya envía los datos en formato correcto, simplemente asegurarse de que
      // telefono y direccion estén extraídos del array clientes si es necesario
      if (response.data) {
        const userData: any = { ...response.data };
        
        // Mapear username → usuario si es necesario
        if ('username' in userData && !userData.usuario) {
          userData.usuario = userData.username;
          userData.id = userData.userId || userData.id;
        }
        
        // Construir el objeto rol si no existe
        if (!userData.rol && userData.rolId) {
          userData.rol = {
            id: userData.rolId,
            nombre: userData.rolNombre || '',
            descripcion: userData.rolDescripcion || '',
          };
        }
        
        // Construir nombresCompletos si no existe
        if (!userData.nombresCompletos) {
          userData.nombresCompletos = `${userData.nombres} ${userData.apellidoPaterno} ${userData.apellidoMaterno || ''}`.trim();
        }

        // Siempre asegurarse de que telefono y direccion estén en el nivel superior
        // (el backend ya los envía, pero por si acaso)
        if (userData.clientes && userData.clientes.length > 0) {
          if (!userData.telefono) {
            userData.telefono = userData.clientes[0].telefono;
          }
          if (!userData.direccion) {
            userData.direccion = userData.clientes[0].direccion;
          }
        }
        
        return {
          ...response,
          data: userData
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('Update profile error in repository:', error);
      throw new AuthError(
        error.message || 'Error al actualizar perfil',
        'UPDATE_PROFILE_ERROR',
        error.response?.status
      );
    }
  }
}