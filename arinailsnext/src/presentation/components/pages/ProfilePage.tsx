'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Email, 
  ExitToApp,
  CalendarToday,
  Star,
  AdminPanelSettings,
  Person,
  WorkOutline,
  Badge,
  Phone,
  Home,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth, useLogout, useUpdateProfile } from '../../hooks/useSimpleAuth';
import { UserEntity } from '../../../core/domain/entities/User';
import { ACCENT_SOLID, ACCENT_GRADIENT, CARD_BG } from '../../theme/colors';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { PhoneInput } from '../common/PhoneInput';

/**
 * Profile Information Card Component
 */
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      background: CARD_BG,
      border: '1px solid rgba(125, 150, 116, 0.15)',
      height: '100%',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      },
    }}
  >
    <Stack spacing={2}>
      <Box sx={{ 
        color: ACCENT_SOLID,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {icon}
        <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Paper>
);

/**
 * Profile Page Component
 * Displays user profile information and account management options
 */
export const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper function to parse phone number
  const parsePhoneNumber = (fullPhone: string) => {
    if (!fullPhone) return { countryCode: '+52', phoneNumber: '' };
    
    // Try to extract country code (starts with +)
    const match = fullPhone.match(/^(\+\d{1,4})(.+)$/);
    if (match) {
      return {
        countryCode: match[1],
        phoneNumber: match[2]
      };
    }
    
    // If no country code found, assume it's a Mexican number
    return {
      countryCode: '+52',
      phoneNumber: fullPhone
    };
  };

  const initialPhone = parsePhoneNumber(user?.telefono || '');
  const [countryCode, setCountryCode] = useState(initialPhone.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.phoneNumber);

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || ''
  });

  const [errors, setErrors] = useState({
    email: '',
    telefono: '',
    direccion: ''
  });

  // Update form when user changes
  React.useEffect(() => {
    if (user) {
      const parsed = parsePhoneNumber(user.telefono || '');
      setCountryCode(parsed.countryCode);
      setPhoneNumber(parsed.phoneNumber);
      setFormData({
        email: user.email,
        telefono: user.telefono || '',
        direccion: user.direccion || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      telefono: '',
      direccion: ''
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Phone validation
    if (phoneNumber && phoneNumber.length < 7) {
      newErrors.telefono = 'El número de teléfono no es válido';
    }

    // Address validation
    if (formData.direccion && formData.direccion.trim().length < 10) {
      newErrors.direccion = 'La dirección debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - restore original values
      if (user) {
        const parsed = parsePhoneNumber(user.telefono || '');
        setCountryCode(parsed.countryCode);
        setPhoneNumber(parsed.phoneNumber);
        setFormData({
          email: user.email,
          telefono: user.telefono || '',
          direccion: user.direccion || ''
        });
      }
      setErrors({ email: '', telefono: '', direccion: '' });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updateData: any = {};
    
    // Combine country code and phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    // Only send changed fields
    if (formData.email !== user?.email) {
      updateData.email = formData.email;
    }
    if (fullPhoneNumber !== user?.telefono) {
      updateData.telefono = fullPhoneNumber;
    }
    if (formData.direccion !== user?.direccion) {
      updateData.direccion = formData.direccion;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      setIsEditMode(false);
      return;
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditMode(false);
        setShowSuccess(true);
      },
      onError: (error: any) => {
        const message = error?.message || 'Error al actualizar perfil';
        if (message.includes('correo') || message.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Este correo ya está en uso' }));
        } else if (message.includes('teléfono') || message.includes('telefono')) {
          setErrors(prev => ({ ...prev, telefono: 'Este teléfono ya está en uso' }));
        } else {
          setErrorMessage(message);
          setShowError(true);
        }
      },
    });
  };

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    // Clear error when user types
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  const userEntity = new UserEntity(user);
  const initials = (user.nombres || '').charAt(0) + (user.apellidoPaterno || '').charAt(0);
  
  // Determinar el icono y color según el rol
  const getRoleConfig = () => {
    if (userEntity.isAdmin) {
      return {
        icon: <AdminPanelSettings />,
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.1)',
        label: 'Administrador'
      };
    }
    if (userEntity.isEmployee) {
      return {
        icon: <WorkOutline />,
        color: '#2563eb',
        bgColor: 'rgba(37, 99, 235, 0.1)',
        label: 'Empleado'
      };
    }
    return {
      icon: <Person />,
      color: ACCENT_SOLID,
      bgColor: 'rgba(125, 150, 116, 0.1)',
      label: 'Cliente'
    };
  };
  
  const roleConfig = getRoleConfig();

  return (
    <ProtectedRoute>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #f5f2e8 0%, #ede9dc 100%)',
        py: { xs: 4, md: 6 }
      }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: CARD_BG,
              border: '1px solid rgba(125, 150, 116, 0.15)',
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Decoration */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: `linear-gradient(135deg, ${ACCENT_SOLID}20, ${ACCENT_SOLID}10)`,
              borderRadius: '50%',
              zIndex: 0,
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                      sx={{
                        width: { xs: 80, md: 100 },
                        height: { xs: 80, md: 100 },
                        background: ACCENT_GRADIENT,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        fontWeight: 'bold',
                        border: '4px solid white',
                        boxShadow: '0 8px 24px rgba(125, 150, 116, 0.3)',
                      }}
                    >
                      {initials}
                    </Avatar>
                    
                    <Stack spacing={1}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'text.primary',
                          fontSize: { xs: '1.5rem', md: '2rem' }
                        }}
                      >
                        {userEntity.fullName}
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor: roleConfig.bgColor,
                        width: 'fit-content'
                      }}>
                        <Box sx={{ color: roleConfig.color, display: 'flex', alignItems: 'center' }}>
                          {roleConfig.icon}
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: roleConfig.color,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          {roleConfig.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        @{user.usuario}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Stack spacing={2} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
                    {!isEditMode ? (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={handleEditToggle}
                        sx={{
                          borderColor: ACCENT_SOLID,
                          color: ACCENT_SOLID,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: ACCENT_SOLID,
                            backgroundColor: `${ACCENT_SOLID}10`,
                          },
                        }}
                      >
                        Editar Perfil
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          sx={{
                            background: ACCENT_GRADIENT,
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': {
                              background: ACCENT_SOLID,
                            },
                          }}
                        >
                          {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleEditToggle}
                          disabled={updateProfileMutation.isPending}
                          sx={{
                            borderColor: '#dc2626',
                            color: '#dc2626',
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#dc2626',
                              backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            },
                          }}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    <Button
                      variant="contained"
                      startIcon={<ExitToApp />}
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      sx={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                        },
                      }}
                    >
                      {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Information Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <InfoCard
                icon={<Badge />}
                title="Nombre Completo"
                value={userEntity.fullName}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              {isEditMode ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: CARD_BG,
                    border: '1px solid rgba(125, 150, 116, 0.15)',
                    height: '100%',
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ 
                      color: ACCENT_SOLID,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Email />
                      <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Correo Electrónico
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover fieldset': {
                            borderColor: ACCENT_SOLID,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: ACCENT_SOLID,
                          },
                        },
                      }}
                    />
                  </Stack>
                </Paper>
              ) : (
                <InfoCard
                  icon={<Email />}
                  title="Correo Electrónico"
                  value={user?.email || ''}
                />
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard
                icon={<Person />}
                title="Usuario"
                value={`@${user?.usuario}`}
                subtitle={userEntity.roleDescription}
              />
            </Grid>

            {/* Phone Field */}
            <Grid item xs={12} md={6}>
              {isEditMode ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: CARD_BG,
                    border: '1px solid rgba(125, 150, 116, 0.15)',
                    height: '100%',
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ 
                      color: ACCENT_SOLID,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Phone />
                      <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Teléfono
                      </Typography>
                    </Box>
                    <PhoneInput
                      countryCode={countryCode}
                      phoneNumber={phoneNumber}
                      onCountryCodeChange={setCountryCode}
                      onPhoneNumberChange={setPhoneNumber}
                      error={errors.telefono}
                      helperText={errors.telefono || 'Ingresa tu número de teléfono'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover fieldset': {
                            borderColor: ACCENT_SOLID,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: ACCENT_SOLID,
                          },
                        },
                      }}
                    />
                  </Stack>
                </Paper>
              ) : (
                <InfoCard
                  icon={<Phone />}
                  title="Teléfono"
                  value={user?.telefono || 'No registrado'}
                />
              )}
            </Grid>

            {/* Address Field */}
            <Grid item xs={12} md={6}>
              {isEditMode ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: CARD_BG,
                    border: '1px solid rgba(125, 150, 116, 0.15)',
                    height: '100%',
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ 
                      color: ACCENT_SOLID,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Home />
                      <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Dirección
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.direccion}
                      onChange={handleInputChange('direccion')}
                      error={!!errors.direccion}
                      helperText={errors.direccion || 'Mínimo 10 caracteres'}
                      placeholder="Calle, número, colonia, ciudad..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover fieldset': {
                            borderColor: ACCENT_SOLID,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: ACCENT_SOLID,
                          },
                        },
                      }}
                    />
                  </Stack>
                </Paper>
              ) : (
                <InfoCard
                  icon={<Home />}
                  title="Dirección"
                  value={user?.direccion || 'No registrada'}
                />
              )}
            </Grid>
          </Grid>

          {/* Success/Error Snackbars */}
          <Snackbar
            open={showSuccess}
            autoHideDuration={6000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
              ¡Perfil actualizado exitosamente!
            </Alert>
          </Snackbar>

          <Snackbar
            open={showError}
            autoHideDuration={6000}
            onClose={() => setShowError(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
              {errorMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ProtectedRoute>
  );
};