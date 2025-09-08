import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface HorarioEmpleado {
  id: number;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  cita?: {
    id: number;
    cliente: string;
    telefono: string;
  };
}

interface CitaEmpleado {
  id: number;
  fecha: Date;
  hora: string;
  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
    telefono: string;
  };
  servicios: string[];
  precio: number;
  cancelada: boolean;
}

const EmpleadoDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const empleadoId = user?.empleadoId;

  const [horarios, setHorarios] = useState<HorarioEmpleado[]>([]);
  const [citas, setCitas] = useState<CitaEmpleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [openDialog, setOpenDialog] = useState(false);

  // Estados para el formulario de crear horario
  const [newHorario, setNewHorario] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
  });

  // Estados para errores del modal
  const [modalError, setModalError] = useState<string | null>(null);

  // Estados para notificaciones toast
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [view, setView] = useState<'horarios' | 'citas'>('horarios');

  useEffect(() => {
    if (empleadoId) {
      cargarDatos();
    }
  }, [selectedDate, view, empleadoId]);

  const cargarDatos = async () => {
    if (!empleadoId) {
      setError('No se encontró información del empleado');
      return;
    }

    setLoading(true);
    try {
      if (view === 'horarios') {
        await cargarHorarios();
      } else {
        await cargarCitas();
      }
    } catch (error) {
      setError('Error al cargar los datos');
    }
    setLoading(false);
  };

  const cargarHorarios = async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `http://localhost:3000/horarios/empleado/${empleadoId}/detallado?fecha=${selectedDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setHorarios(data.data.map((h: any) => ({
        ...h,
        fecha: new Date(h.fecha),
      })));
    } else {
      throw new Error('Error al cargar horarios');
    }
  };

  const cargarCitas = async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `http://localhost:3000/citas/empleado/${empleadoId}?fecha=${selectedDate}`,
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
  };

  const crearHorario = async () => {
    if (!newHorario.horaInicio || !newHorario.horaFin) {
      setModalError('Debe seleccionar hora de inicio y fin');
      return;
    }

    // Limpiar errores previos
    setModalError(null);

    const token = localStorage.getItem('token');
    const horarioDto = {
      empleadoId,
      fecha: newHorario.fecha,
      horaInicio: newHorario.horaInicio,
      horaFin: newHorario.horaFin,
    };

    try {
      const response = await fetch('http://localhost:3000/horarios/empleado/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(horarioDto),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        // Éxito: cerrar modal y mostrar toast
        setOpenDialog(false);
        limpiarModal();
        showSuccessToast('¡Horario creado exitosamente!');
        cargarDatos();
      } else {
        // Error: mostrar en modal y toast
        let errorMessage = data.message || data.error || 'Error al crear horario';
        
        // Limpiar el mensaje si tiene prefijo redundante
        if (errorMessage.startsWith('Error al crear horario: ')) {
          errorMessage = errorMessage.replace('Error al crear horario: ', '');
        }
        
        setModalError(errorMessage);
        showErrorToast(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Error de conexión al crear horario';
      setModalError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const eliminarHorario = async (horarioId: number) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(
        `http://localhost:3000/horarios/empleado/${empleadoId}/horario/${horarioId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showSuccessToast('Horario eliminado exitosamente');
        cargarDatos();
      } else {
        const errorData = await response.json();
        showErrorToast(errorData.message || 'Error al eliminar horario');
      }
    } catch (error) {
      showErrorToast('Error al eliminar horario');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setModalError(null);
  };

  // Función para mostrar toast de éxito
  const showSuccessToast = (message: string) => {
    setToast({
      open: true,
      message,
      severity: 'success',
    });
    // Auto cerrar después de 3 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false }));
    }, 3000);
  };

  // Función para mostrar toast de error
  const showErrorToast = (message: string) => {
    setToast({
      open: true,
      message,
      severity: 'error',
    });
    // Auto cerrar después de 3 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false }));
    }, 3000);
  };

  // Función para cerrar toast manualmente
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Función para limpiar el modal
  const limpiarModal = () => {
    setNewHorario({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
    });
    setModalError(null);
  };

  // Función para cerrar el modal y limpiarlo
  const cerrarModal = () => {
    setOpenDialog(false);
    limpiarModal();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Función para formatear horas (asegurar formato HH:mm)
  const formatearHora = (hora: string) => {
    if (!hora) return '';
    // Si la hora no tiene segundos, agregarlos
    if (hora.length === 5) {
      return hora + ':00';
    }
    return hora;
  };

  // Función para manejar cambio de hora de inicio
  const handleHoraInicioChange = (value: string) => {
    const horaFormateada = formatearHora(value);
    setNewHorario({ ...newHorario, horaInicio: horaFormateada });
  };

  // Función para manejar cambio de hora de fin
  const handleHoraFinChange = (value: string) => {
    const horaFormateada = formatearHora(value);
    setNewHorario({ ...newHorario, horaFin: horaFormateada });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: 4,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Dashboard del Empleado
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Gestiona tus horarios y visualiza tus citas
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

        {/* Controles */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
          <TextField
            type="date"
            label="Seleccionar fecha"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Vista</InputLabel>
            <Select
              value={view}
              label="Vista"
              onChange={(e) => setView(e.target.value as 'horarios' | 'citas')}
            >
              <MenuItem value="horarios">Mis Horarios</MenuItem>
              <MenuItem value="citas">Mis Citas</MenuItem>
            </Select>
          </FormControl>
          {view === 'horarios' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
            >
              Crear Horario
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Contenido */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : view === 'horarios' ? (
          <Box>
            {horarios.length === 0 ? (
              <Alert severity="info">
                No tienes horarios configurados para esta fecha
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {horarios.map((horario) => (
                  <Card
                    key={horario.id}
                    elevation={3}
                    sx={{
                      background: horario.disponible
                        ? 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)'
                        : 'linear-gradient(135deg, #fff3e0 0%, #ffe8cc 100%)',
                      border: horario.disponible
                        ? '2px solid #4caf50'
                        : '2px solid #ff9800',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">
                            {horario.horaInicio} - {horario.horaFin}
                          </Typography>
                        </Box>
                        <Chip
                          label={horario.disponible ? 'Disponible' : 'Ocupado'}
                          color={horario.disponible ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(horario.fecha)}
                        </Typography>
                      </Box>

                      {horario.cita && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2" fontWeight="bold">
                              {horario.cita.cliente}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">
                              {horario.cita.telefono}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {horario.disponible && (
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <IconButton
                            color="error"
                            onClick={() => eliminarHorario(horario.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {citas.length === 0 ? (
              <Alert severity="info">
                No tienes citas programadas para esta fecha
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {citas.map((cita) => (
                  <Card
                    key={cita.id}
                    elevation={3}
                    sx={{
                      background: cita.cancelada
                        ? 'linear-gradient(135deg, #ffebee 0%, #f8bbd9 100%)'
                        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      border: cita.cancelada
                        ? '2px solid #f44336'
                        : '2px solid #2196f3',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">
                          {cita.hora}
                        </Typography>
                        <Chip
                          label={cita.cancelada ? 'Cancelada' : 'Activa'}
                          color={cita.cancelada ? 'error' : 'primary'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {cita.cliente.nombres} {cita.cliente.apellidos}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cita.cliente.telefono}
                        </Typography>
                      </Box>

                      {cita.servicios.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Servicios:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {cita.servicios.map((servicio, index) => (
                              <Chip
                                key={index}
                                label={servicio}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Typography variant="h6" color="primary.main" textAlign="right">
                        ${cita.precio}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Dialog para crear horario */}
        <Dialog open={openDialog} onClose={cerrarModal} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AddIcon sx={{ mr: 1 }} />
              Crear Nuevo Horario
            </Box>
          </DialogTitle>
          <DialogContent>
            {modalError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {modalError}
              </Alert>
            )}
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                type="date"
                label="Fecha"
                value={newHorario.fecha}
                onChange={(e) =>
                  setNewHorario({ ...newHorario, fecha: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  type="time"
                  label="Hora de inicio"
                  value={newHorario.horaInicio}
                  onChange={(e) => handleHoraInicioChange(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  label="Hora de fin"
                  value={newHorario.horaFin}
                  onChange={(e) => handleHoraFinChange(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarModal}>Cancelar</Button>
            <Button
              onClick={crearHorario}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
            >
              Crear Horario
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* Toast notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        sx={{ 
          zIndex: 99999,
          position: 'fixed'
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{ zIndex: 99999 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmpleadoDashboard;
