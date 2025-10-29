/**
 * Core Layer Export Barrel
 * Centralized exports for domain entities, use cases, and infrastructure
 * Note: Some exports are commented out until the full implementation is ready
 */

// Domain Entities
export type { User, LoginCredentials, RegisterData, AuthResult } from './domain/entities/User';
export { UserEntity } from './domain/entities/User';

// Domain Repositories (Interfaces)
export type { IAuthRepository, ITokenStorage } from './domain/repositories/IAuthRepository';

// Application Interfaces
export type { IAuthUseCases } from './application/interfaces/IAuthUseCases';
export { AuthError, ValidationError } from './application/interfaces/IAuthUseCases';

// Application Use Cases
// export { AuthUseCases } from './application/usecases/AuthUseCases';

// Infrastructure
export { BrowserTokenStorage } from './infrastructure/storage/BrowserTokenStorage';
// export { AxiosHttpClient } from './infrastructure/http/AxiosHttpClient';
// export { AuthRepository } from './infrastructure/repositories/AuthRepository';

// Dependency Injection
// export { DIContainer } from './di/DIContainer';

// Note: Some exports are commented out to prevent hydration issues.
// These can be uncommented when implementing the full authentication system.