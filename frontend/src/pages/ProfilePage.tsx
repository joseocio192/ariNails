import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  CircularProgress, 
  Avatar, 
  Card, 
  CardContent, 
  Box,
  Container,
  Paper,
  Stack
} from '@mui/material';
import { useAuth, useLogout } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, Person, Email, CalendarToday, Star, Favorite } from '@mui/icons-material';
import CitaModal from '../components/CitaModal';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleVerHistorial = () => {
    navigate('/mis-citas');
  };

  if (isLoading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#ec4899', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Cargando perfil...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Box 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          {/* Header con avatar y nombre */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              mb: 4
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  width: 96,
                  height: 96,
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)'
                }}
              >
                {user?.nombres?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  ¡Hola, {user?.nombres +" "+ user?.apellidoPaterno}!
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Bienvenido/a a AriNails
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<LogoutOutlined />}
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  textTransform: 'none',
                  fontWeight: 'semibold',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: '#fef2f2',
                  },
                }}
              >
                {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
              </Button>
            </Box>
          </Paper>

          {/* Cards de información */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
            {/* Información personal */}
            <Box sx={{ flex: 1 }}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Person sx={{ color: '#ec4899', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                      Información Personal
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Person sx={{ color: 'text.secondary', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Nombre de Usuario
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
                          {user?.username}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Email sx={{ color: 'text.secondary', mr: 2 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Correo Electrónico
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Estadísticas */}
            <Box sx={{ flex: 1 }}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 3 }}>
                    Tu Actividad
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                        color: 'white'
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>0</Typography>
                      <Typography variant="body2">Citas Agendadas</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Acciones rápidas */}
          <Paper 
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 3 }}>
              Acciones Rápidas
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CalendarToday />}
                  onClick={handleOpenModal}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    textTransform: 'none',
                    fontWeight: 'semibold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
                    }
                  }}
                >
                  Agendar Cita
                </Button>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Star />}
                  onClick={handleVerHistorial}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#ec4899',
                    color: '#ec4899',
                    textTransform: 'none',
                    fontWeight: 'semibold',
                    '&:hover': {
                      borderColor: '#db2777',
                      backgroundColor: 'rgba(236, 72, 153, 0.04)',
                    }
                  }}
                >
                  Ver Historial
                </Button>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                  <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Favorite />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    textTransform: 'none',
                    fontWeight: 'semibold',
                    '&:hover': {
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(139, 92, 246, 0.04)',
                    }
                  }}
                  >
                  Probar diseños
                  </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
      <CitaModal open={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default ProfilePage;
