import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Stack,
  Avatar,
  IconButton,
  Container,
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface CitaCliente {
  id: number;
  fecha: Date;
  hora: string;
  empleado: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  servicios: string[];
  precio: number;
  cancelada: boolean;
}

const MisCitas: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const clienteId = user?.clienteId;

  const [citas, setCitas] = useState<CitaCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      cargarCitas();
    }
  }, [clienteId]);

  const cargarCitas = async () => {
    if (!clienteId) {
      setError('No se encontró información del cliente');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${API_BASE_URL}/citas/cliente/${clienteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCitas(data.data.map((c: any) => ({
          ...c,
          fecha: new Date(c.fecha),
        })));
      } else {
        throw new Error('Error al cargar citas');
      }
    } catch (error) {
      setError('Error al cargar las citas');
    }
    setLoading(false);
  };

  const cancelarCita = async (citaId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${API_BASE_URL}/citas/cancelar/${citaId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo: 'Cancelada por el cliente' }),
        }
      );

      if (response.ok) {
        setSuccess('Cita cancelada exitosamente');
        cargarCitas();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cancelar la cita');
      }
    } catch (error) {
      setError('Error al cancelar la cita');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.length === 5 ? time : `${time}:00`;
  };

  const isUpcoming = (fecha: Date, hora: string) => {
    const now = new Date();
    const citaDateTime = new Date(fecha);
    const [hours, minutes] = hora.split(':').map(Number);
    citaDateTime.setHours(hours, minutes, 0, 0);
    
    return citaDateTime > now;
  };

  const isPast = (fecha: Date, hora: string) => {
    const now = new Date();
    const citaDateTime = new Date(fecha);
    const [hours, minutes] = hora.split(':').map(Number);
    citaDateTime.setHours(hours, minutes, 0, 0);
    
    return citaDateTime < now;
  };

  const citasProximas = citas.filter(cita => !cita.cancelada && isUpcoming(cita.fecha, cita.hora));
  const citasPasadas = citas.filter(cita => !cita.cancelada && isPast(cita.fecha, cita.hora));
  const citasCanceladas = citas.filter(cita => cita.cancelada);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: 4,
          }}
        >
          {/* Header con botón de regreso */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton
                onClick={() => navigate('/profile')}
                sx={{
                  mr: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Mis Citas
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ ml: 7 }}>
              Consulta y gestiona tus citas programadas
            </Typography>
          </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" onClose={clearMessages} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={clearMessages} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Citas Próximas */}
            {citasProximas.length > 0 && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mb: 3,
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    pb: 1,
                  }}
                >
                  Próximas Citas
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3,
                  }}
                >
                  {citasProximas.map((cita) => (
                    <Card
                      key={cita.id}
                      elevation={5}
                      sx={{
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                        border: '2px solid #4caf50',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
                        }}
                      />
                      <CardContent sx={{ pt: 3 }}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h5" fontWeight="bold" color="primary.main">
                                {formatTime(cita.hora)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <EventIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                  {formatDate(cita.fecha)}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label="Próxima"
                              color="success"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              bgcolor: 'rgba(255,255,255,0.8)',
                              borderRadius: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                mr: 2,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {cita.empleado.nombres} {cita.empleado.apellidos}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Especialista en belleza
                              </Typography>
                            </Box>
                          </Box>

                          {cita.servicios.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Servicios incluidos:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {cita.servicios.map((servicio, index) => (
                                  <Chip
                                    key={index}
                                    label={servicio}
                                    size="small"
                                    variant="outlined"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2 }}>
                            <Typography variant="h5" color="primary.main" fontWeight="bold">
                              ${cita.precio}
                            </Typography>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => cancelarCita(cita.id)}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'error.main',
                                  color: 'white',
                                },
                              }}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Citas Pasadas */}
            {citasPasadas.length > 0 && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.secondary',
                    mb: 3,
                    borderBottom: '2px solid',
                    borderColor: 'text.secondary',
                    pb: 1,
                  }}
                >
                  Historial de Citas
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {citasPasadas.map((cita) => (
                    <Card
                      key={cita.id}
                      elevation={2}
                      sx={{
                        background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">
                              {formatTime(cita.hora)}
                            </Typography>
                            <Chip label="Completada" color="default" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(cita.fecha)}
                          </Typography>
                          <Typography variant="body2">
                            Con: {cita.empleado.nombres} {cita.empleado.apellidos}
                          </Typography>
                          <Typography variant="h6" color="primary.main" textAlign="right">
                            ${cita.precio}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Citas Canceladas */}
            {citasCanceladas.length > 0 && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: 'error.main',
                    mb: 3,
                    borderBottom: '2px solid',
                    borderColor: 'error.main',
                    pb: 1,
                  }}
                >
                  Citas Canceladas
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {citasCanceladas.map((cita) => (
                    <Card
                      key={cita.id}
                      elevation={2}
                      sx={{
                        background: 'linear-gradient(135deg, #ffebee 0%, #f8bbd9 100%)',
                        border: '1px solid #f44336',
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">
                              {formatTime(cita.hora)}
                            </Typography>
                            <Chip label="Cancelada" color="error" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(cita.fecha)}
                          </Typography>
                          <Typography variant="body2">
                            Con: {cita.empleado.nombres} {cita.empleado.apellidos}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Sin citas */}
            {citas.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  No tienes citas programadas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ¡Agenda tu primera cita para disfrutar de nuestros servicios!
                </Typography>
              </Box>
            )}
          </Stack>
        )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MisCitas;
