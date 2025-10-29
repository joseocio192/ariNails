/**
 * Presentation Layer Export Barrel
 * Centralized exports for all presentation layer components, hooks, and utilities
 */

// Layout Components
export { Layout } from './components/layout/Layout';
export { Header } from './components/layout/Header';
export { Footer } from './components/layout/Footer';

// Page Components
export { HomePage } from './components/pages/HomePage';
export { LoginPage } from './components/pages/LoginPage';
export { RegisterPage } from './components/pages/RegisterPage';
export { ProfilePage } from './components/pages/ProfilePage';

// Auth Components
export { ProtectedRoute } from './components/auth/ProtectedRoute';

// UI Components
export { TestimonialCarousel } from './components/ui/TestimonialCarousel';
export { ClientOnly } from './components/common/ClientOnly';

// Providers
export { Providers } from './providers/Providers';
export { AuthProvider } from './providers/SimpleAuthProvider';

// Hooks
export * from './hooks/useSimpleAuth';

// Theme & Styling
export * from './theme/colors';
export { theme } from './theme/theme';