import { IAuthRepository, ITokenStorage } from '../domain/repositories/IAuthRepository';
import { IAuthUseCases } from '../application/interfaces/IAuthUseCases';
import { BrowserTokenStorage } from '../infrastructure/storage/BrowserTokenStorage';
import { AxiosHttpClient, IHttpClient } from '../infrastructure/http/AxiosHttpClient';
import { AuthRepository } from '../infrastructure/repositories/AuthRepository';
import { AuthUseCases } from '../application/usecases/AuthUseCases';

/**
 * Dependency Injection Container
 * Manages object creation and dependencies following the Dependency Inversion Principle
 */
export class DIContainer {
  private static instance: DIContainer;
  private readonly dependencies = new Map<string, any>();

  private constructor() {
    this.registerDependencies();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private registerDependencies(): void {
    // Storage
    this.dependencies.set('ITokenStorage', new BrowserTokenStorage());

    // HTTP Client
    this.dependencies.set('IHttpClient', new AxiosHttpClient(
      this.dependencies.get('ITokenStorage')
    ));

    // Repositories
    this.dependencies.set('IAuthRepository', new AuthRepository(
      this.dependencies.get('IHttpClient'),
      this.dependencies.get('ITokenStorage')
    ));

    // Use Cases
    this.dependencies.set('IAuthUseCases', new AuthUseCases(
      this.dependencies.get('IAuthRepository'),
      this.dependencies.get('ITokenStorage')
    ));
  }

  get<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency ${key} not found`);
    }
    return dependency as T;
  }

  // Convenience methods for commonly used dependencies
  getAuthUseCases(): IAuthUseCases {
    return this.get<IAuthUseCases>('IAuthUseCases');
  }

  getTokenStorage(): ITokenStorage {
    return this.get<ITokenStorage>('ITokenStorage');
  }

  getAuthRepository(): IAuthRepository {
    return this.get<IAuthRepository>('IAuthRepository');
  }
}