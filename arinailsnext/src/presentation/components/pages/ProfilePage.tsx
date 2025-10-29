'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Stack,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Email, 
  ExitToApp,
  CalendarToday,
  Star
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth, useLogout } from '../../hooks/useSimpleAuth';
import { UserEntity } from '../../../core/domain/entities/User';
import { ACCENT_SOLID, ACCENT_GRADIENT, CARD_BG } from '../../theme/colors';
import { ProtectedRoute } from '../auth/ProtectedRoute';

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

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  const userEntity = new UserEntity(user);
  const initials = user.nombres.charAt(0) + user.apellidoPaterno.charAt(0);

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
                    </Stack>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Stack spacing={2} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
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
            <Grid item xs={12} md={6}>
              <InfoCard
                icon={<Email />}
                title="Correo Electrónico"
                value={user.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard
                icon={<CalendarToday />}
                title="Miembro desde"
                value="Octubre 2024"
              />
            </Grid>
          </Grid>

          {/* Activity Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: CARD_BG,
              border: '1px solid rgba(125, 150, 116, 0.15)',
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Star sx={{ color: ACCENT_SOLID }} />
              Actividad Reciente
            </Typography>

            <Divider sx={{ mb: 3, borderColor: 'rgba(125, 150, 116, 0.15)' }} />

            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary' 
            }}>
              <CalendarToday sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No hay actividad reciente
              </Typography>
              <Typography variant="body2">
                Las citas y actividades aparecerán aquí una vez que comiences a usar nuestros servicios.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  background: ACCENT_GRADIENT,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Agendar Primera Cita
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ProtectedRoute>
  );
};