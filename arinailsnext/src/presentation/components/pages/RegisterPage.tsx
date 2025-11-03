'use client';

import React, { useState, useEffect } from 'react';
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
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  ArrowForward,
  AccountCircle,
  Phone
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegister, useAuth } from '../../hooks/useSimpleAuth';
import { ACCENT_GRADIENT, BACKGROUND, ACCENT_SOLID } from '../../theme/colors';
import { RegisterData } from '../../../core/domain/entities/User';
import { PhoneInput } from '../common/PhoneInput';

// Estilos compartidos para los inputs (sin cambios)
const inputSx = {
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
};

/**
 * Register Page Component
 * Handles user registration with a clean, responsive layout
 */
export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    usuario: '',
    email: '',
    telefono: '',
    password: '',
  });
  const [countryCode, setCountryCode] = useState('+52'); // México por defecto
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const registerMutation = useRegister();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Redirect based on user role
      if (user.rol?.nombre === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.rol?.nombre === 'empleado') {
        router.push('/dashboard/employee');
      } else {
        router.push('/dashboard/client');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleInputChange = (field: keyof RegisterData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.nombres.trim()) errors.push('El nombre es requerido');
    if (!formData.apellidoPaterno.trim()) errors.push('El apellido paterno es requerido');
    if (!formData.usuario.trim() || formData.usuario.length < 3) {
      errors.push('El usuario debe tener al menos 3 caracteres');
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email no es válido');
    }
    if (!phoneNumber.trim() || phoneNumber.length < 7) {
      errors.push('El número de teléfono no es válido');
    }
    if (!formData.password || formData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (formData.password !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      return;
    }
    
    // Combinar código de país y número de teléfono
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const dataToSubmit = {
      ...formData,
      telefono: fullPhoneNumber,
    };
    
    registerMutation.mutate(dataToSubmit, {
      onSuccess: () => {
        router.push('/dashboard/client');
      },
    });
  };

  const isLoading = registerMutation.isPending;
  const error = registerMutation.error;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: BACKGROUND,
      display: 'flex',
      alignItems: 'center',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="md">
        {/* Contenedor principal para alinear el logo y la tarjeta */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}>
            <Box 
              onClick={() => router.push('/')}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(127, 161, 123, 0.3)',
                background: 'white',
                mb: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px rgba(127, 161, 123, 0.4)',
                },
              }}
            >
              <img
                src="/logo.png"
                alt="Ari Nails Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

          {/* Tarjeta de Registro */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 600,
              p: { xs: 3, sm: 4 },
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
                textAlign: 'left',
                mb: 3,
                fontWeight: 'bold',
                color: 'text.primary'
              }}
            >
              Crear Cuenta Nueva
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                {error.message || 'Error al crear la cuenta. Inténtalo de nuevo.'}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* CAMBIO: Usamos un único Grid container para un layout consistente */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombres"
                    variant="outlined"
                    value={formData.nombres}
                    onChange={handleInputChange('nombres')}
                    disabled={isLoading}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    variant="outlined"
                    value={formData.apellidoPaterno}
                    onChange={handleInputChange('apellidoPaterno')}
                    disabled={isLoading}
                    required
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Apellido Materno (Opcional)"
                    variant="outlined"
                    value={formData.apellidoMaterno}
                    onChange={handleInputChange('apellidoMaterno')}
                    disabled={isLoading}
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Usuario"
                    variant="outlined"
                    value={formData.usuario}
                    onChange={handleInputChange('usuario')}
                    disabled={isLoading}
                    required
                    helperText="Mínimo 3 caracteres"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={isLoading}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12}>
                  <PhoneInput
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                    disabled={isLoading}
                    required
                    helperText="Ingresa tu número de teléfono"
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    disabled={isLoading}
                    required
                    helperText="Mínimo 6 caracteres"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    error={confirmPassword !== '' && formData.password !== confirmPassword}
                    helperText={
                      confirmPassword !== '' && formData.password !== confirmPassword
                        ? 'Las contraseñas no coinciden'
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || validateForm().length > 0}
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
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(125, 150, 116, 0.2)' } }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>o</Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                ¿Ya tienes una cuenta?
              </Typography>
              <Button
                component={Link}
                href="/login"
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
                Iniciar sesión
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};