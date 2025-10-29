'use client';

import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton,
  Container,
  Stack,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock, ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin } from '../../hooks/useSimpleAuth';
import { ACCENT_GRADIENT, BACKGROUND, ACCENT_SOLID } from '../../theme/colors';

/**
 * Login Page Component
 * Handles user authentication with clean form design
 */
export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    loginMutation.mutate(
      { username: username.trim(), password },
      {
        onSuccess: () => {
          router.push('/profile');
        },
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isLoading = loginMutation.isPending;
  const error = loginMutation.error;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: BACKGROUND,
      display: 'flex',
      alignItems: 'center',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(127, 161, 123, 0.3)',
              background: 'white',
              mb: 2,
            }}>
              <img 
                src="/logo.png" 
                alt="Ari Nails Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: ACCENT_GRADIENT,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              Ari Nails
            </Typography>
          </Box>

          {/* Login Card */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 400,
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(125, 150, 116, 0.15)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)'
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                textAlign: 'center', 
                mb: 3, 
                fontWeight: 'bold',
                color: 'text.primary'
              }}
            >
              Iniciar Sesión
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                {error.message || 'Error al iniciar sesión. Verifica tus credenciales.'}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: ACCENT_SOLID,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENT_SOLID,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENT_SOLID,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: ACCENT_SOLID,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENT_SOLID,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENT_SOLID,
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || !username.trim() || !password.trim()}
                  endIcon={<ArrowForward />}
                  sx={{
                    background: ACCENT_GRADIENT,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(125, 150, 116, 0.25)',
                    '&:hover': {
                      background: ACCENT_GRADIENT,
                      boxShadow: '0 6px 20px rgba(125, 150, 116, 0.35)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: 'rgba(125, 150, 116, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Stack>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(125, 150, 116, 0.2)' } }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                o
              </Typography>
            </Divider>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                ¿No tienes una cuenta?
              </Typography>
              <Button
                component={Link}
                href="/register"
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: ACCENT_SOLID,
                  color: ACCENT_SOLID,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1.2,
                  '&:hover': {
                    backgroundColor: 'rgba(125, 150, 116, 0.04)',
                    borderColor: ACCENT_SOLID,
                  },
                }}
              >
                Crear cuenta nueva
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};