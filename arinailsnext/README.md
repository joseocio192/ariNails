# Ari Nails - Next.js Application

Una aplicación moderna de salón de uñas construida con Next.js, implementando Clean Architecture, principios SOLID y patrones de diseño modernos.

## � Estado Actual

✅ **Sistema de Autenticación Integrado** - Login y Registro completamente funcionales con el backend NestJS


---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Backend NestJS ejecutándose en `http://localhost:3000`

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# .env.local ya está configurado con:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5000`

### Probar la Integración

1. **Herramienta de prueba interactiva**:
   ```
   http://localhost:5000/test-integration.html
   ```

2. **Registro de usuario**:
   ```
   http://localhost:5000/register
   ```

3. **Login**:
   ```
   http://localhost:5000/login
   ```

---

## �🏗️ Arquitectura

Esta aplicación implementa **Clean Architecture** con las siguientes capas:

### 📁 Estructura del Proyecto

```
src/
├── core/                           # Lógica de negocio central
│   ├── domain/                     # Capa de Dominio
│   │   ├── entities/              # Entidades de dominio
│   │   └── repositories/          # Interfaces de repositorios
│   ├── application/               # Capa de Aplicación
│   │   ├── interfaces/            # Interfaces de casos de uso
│   │   └── usecases/             # Implementación de casos de uso
│   ├── infrastructure/            # Capa de Infraestructura
│   │   ├── storage/              # Almacenamiento (localStorage, etc.)
│   │   ├── http/                 # Clientes HTTP
│   │   └── repositories/         # Implementaciones de repositorios
│   └── di/                       # Contenedor de Inyección de Dependencias
├── presentation/                  # Capa de Presentación
│   ├── components/               # Componentes React
│   │   ├── layout/              # Componentes de layout
│   │   ├── pages/               # Componentes de páginas
│   │   ├── auth/                # Componentes de autenticación
│   │   └── ui/                  # Componentes de UI reutilizables
│   ├── hooks/                   # Custom React hooks
│   ├── providers/               # Context providers
│   └── theme/                   # Sistema de diseño y temas
└── app/                         # Next.js App Router
    ├── layout.tsx              # Layout principal
    ├── page.tsx               # Página de inicio
    ├── login/                 # Página de login
    ├── register/              # Página de registro
    └── profile/               # Página de perfil
```

## 🎯 Principios Aplicados

### Clean Architecture
- **Separación de responsabilidades** por capas
- **Inversión de dependencias** - las capas externas dependen de las internas
- **Independencia de frameworks** - la lógica de negocio no depende de React/Next.js

### Principios SOLID
- **S - Single Responsibility Principle**: Cada clase tiene una sola responsabilidad
- **O - Open/Closed Principle**: Abierto para extensión, cerrado para modificación
- **L - Liskov Substitution Principle**: Las implementaciones son intercambiables
- **I - Interface Segregation Principle**: Interfaces específicas y pequeñas
- **D - Dependency Inversion Principle**: Dependencias invertidas mediante interfaces

### Patrones de Diseño

#### Repository Pattern
```typescript
// Interfaz abstracta
interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  getProfile(): Promise<User>;
}

// Implementación concreta
class AuthRepository implements IAuthRepository {
  // Implementación específica
}
```

#### Dependency Injection
```typescript
class DIContainer {
  // Maneja la creación y gestión de dependencias
  getAuthUseCases(): IAuthUseCases;
}
```

#### Use Case Pattern
```typescript
class AuthUseCases implements IAuthUseCases {
  constructor(private authRepository: IAuthRepository) {}
  
  async login(credentials: LoginCredentials): Promise<User> {
    // Lógica de negocio pura
  }
}
```

## 🛠️ Tecnologías Utilizadas

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Material-UI** - Sistema de componentes
- **React Query** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **Emotion** - Styling solution

## 🚀 Características

### ✅ Implementadas
- ✅ Autenticación completa (Login/Register)
- ✅ Gestión de estado con React Query
- ✅ Rutas protegidas
- ✅ Sistema de temas consistente
- ✅ Responsive design
- ✅ Manejo de errores
- ✅ Validación de formularios
- ✅ Clean Architecture
- ✅ Principios SOLID
- ✅ Inyección de dependencias

### 📋 Por Implementar
- [ ] Sistema de citas
- [ ] Calendario de disponibilidad
- [ ] Notificaciones
- [ ] Galería de trabajos
- [ ] Sistema de pagos
- [ ] Panel de administración

## 🎨 Sistema de Diseño

### Colores
```typescript
const colors = {
  primary: {
    500: '#7d9674', // Verde sage principal
    600: '#5f7556', // Verde sage oscuro
  },
  background: {
    primary: '#f5f2e8', // Beige crema
    card: '#ffffff',     // Blanco para cards
  }
}
```

## 🔧 Configuración

### Instalación
```bash
npm install
```

### Variables de Entorno
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Ari Nails
```

### Desarrollo
```bash
npm run dev
```

### Construcción
```bash
npm run build
npm start
```

## 📱 Páginas

### Pública
- **/** - Página de inicio con servicios y testimonios
- **/login** - Inicio de sesión
- **/register** - Registro de usuarios

### Protegida
- **/profile** - Perfil del usuario (requiere autenticación)

## 🔐 Autenticación

El sistema implementa autenticación basada en JWT con:
- Almacenamiento seguro en localStorage
- Interceptores de Axios para tokens automáticos
- Rutas protegidas con componente ProtectedRoute
- Manejo de expiración de tokens

---

## 🏛️ Beneficios de la Arquitectura

### Mantenibilidad
- Código organizado y predecible
- Fácil localización de bugs
- Cambios aislados por capas

### Escalabilidad
- Fácil agregar nuevas características
- Componentes reutilizables
- Patrones consistentes

### Testabilidad
- Lógica de negocio aislada
- Dependencias inyectadas
- Interfaces mockeable

### Flexibilidad
- Fácil cambio de implementaciones
- Independiente del framework
- Adaptable a nuevos requerimientos
