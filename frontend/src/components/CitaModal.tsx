import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
} from '@mui/material';
import { Close, Person } from '@mui/icons-material';
import { horarioService, type HorarioDisponible } from '../services/horarioService';
import { useAuth } from '../hooks/useAuth';

interface CitaModalProps {
  open: boolean;
  onClose: () => void;
  onCitaCreada?: () => void;
}

const CitaModal: React.FC<CitaModalProps> = ({ open, onClose, onCitaCreada }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedHorario, setSelectedHorario] = useState<HorarioDisponible | null>(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [diaActivo, setDiaActivo] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingCita, setCreatingCita] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  const cargarHorariosDisponibles = async (fecha: string) => {
    if (!fecha) return;
    
    setLoading(true);
    setError('');
    
    try {
      const [horarios, activo] = await Promise.all([
        horarioService.obtenerHorariosDisponibles(fecha),
        horarioService.verificarDiaActivo(fecha)
      ]);
      
      setHorariosDisponibles(horarios);
      setDiaActivo(activo);
    } catch (error) {
      setError('Error al cargar los horarios disponibles');
      setHorariosDisponibles([]);
      setDiaActivo(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedDate) {
      cargarHorariosDisponibles(selectedDate);
    }
  }, [open, selectedDate]);

  const handleHorarioSelect = (horario: HorarioDisponible) => {
    setSelectedHorario(horario);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedHorario(null);
  };

  const handleConfirmarCita = async () => {
    if (!selectedHorario || !selectedDate) return;

    setCreatingCita(true);
    setError('');
    setSuccess('');

    try {
      // Verificar autenticación usando el hook
      if (!isAuthenticated || !user) {
        setError('Debes iniciar sesión para agendar una cita');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión para agendar una cita');
        return;
      }

      // Obtener el clienteId del usuario autenticado
      const clienteId = user.clienteId;
      if (!clienteId) {
        setError('No se encontró información del cliente');
        return;
      }

      const citaDto = {
        clienteId,
        empleadoId: selectedHorario.empleado.id,
        fecha: selectedDate,
        hora: selectedHorario.hora,
        serviciosIds: [], // Por ahora sin servicios específicos
      };

      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/citas/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(citaDto),
      });

      if (response.ok) {
        setSuccess('¡Cita agendada exitosamente!');
        setTimeout(() => {
          onCitaCreada?.();
          handleClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear la cita');
      }
    } catch (error) {
      setError('Error al crear la cita');
    } finally {
      setCreatingCita(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedHorario(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const agruparHorarios = (horarios: HorarioDisponible[]) => {
    const manana = horarios.filter(h => {
      const hora = parseInt(h.hora.split(':')[0]);
      return hora < 14; // Antes de las 2 PM
    });
    
    const tarde = horarios.filter(h => {
      const hora = parseInt(h.hora.split(':')[0]);
      return hora >= 14; // Después de las 2 PM
    });
    
    return { manana, tarde };
  };

  const { manana, tarde } = agruparHorarios(horariosDisponibles);

  const formatHora = (hora: string) => {
    const [h, m] = hora.split(':');
    const horaNum = parseInt(h);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum === 0 ? 12 : horaNum > 12 ? horaNum - 12 : horaNum;
    return `${hora12}:${m} ${ampm}`;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="cita-modal-title"
      aria-describedby="cita-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '80%', md: '700px' },
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography id="cita-modal-title" variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Agendar Nueva Cita
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Selecciona una fecha"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            inputProps={{ min: today }}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            helperText={selectedDate && !diaActivo ? "Este día no hay atención disponible" : ""}
            error={Boolean(selectedDate && !diaActivo)}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : diaActivo && horariosDisponibles.length > 0 ? (
          <>
            <Typography sx={{ mb: 3, color: 'text.secondary' }}>
              Selecciona un horario disponible para el {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES')}.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, maxHeight: '50vh', overflowY: 'auto' }}>
              {manana.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    🌅 Mañana
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 2, 
                    mb: 3 
                  }}>
                    {manana.map((horario) => (
                      <Paper
                        key={`${horario.hora}-${horario.empleado.id}`}
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedHorario === horario ? '2px solid' : '1px solid',
                          borderColor: selectedHorario === horario ? 'primary.main' : 'grey.300',
                          backgroundColor: selectedHorario === horario ? 'primary.light' : 'transparent',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.light',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onClick={() => handleHorarioSelect(horario)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <Person />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatHora(horario.hora)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {horario.empleado.nombre} {horario.empleado.apellidos}
                            </Typography>
                          </Box>
                          {selectedHorario === horario && (
                            <Chip 
                              label="Seleccionado" 
                              color="primary" 
                              size="small"
                            />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}

              {tarde.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    🌆 Tarde
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 2 
                  }}>
                    {tarde.map((horario) => (
                      <Paper
                        key={`${horario.hora}-${horario.empleado.id}`}
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedHorario === horario ? '2px solid' : '1px solid',
                          borderColor: selectedHorario === horario ? 'primary.main' : 'grey.300',
                          backgroundColor: selectedHorario === horario ? 'primary.light' : 'transparent',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.light',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onClick={() => handleHorarioSelect(horario)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <Person />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatHora(horario.hora)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {horario.empleado.nombre} {horario.empleado.apellidos}
                            </Typography>
                          </Box>
                          {selectedHorario === horario && (
                            <Chip 
                              label="Seleccionado" 
                              color="primary" 
                              size="small"
                            />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </>
        ) : diaActivo && horariosDisponibles.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              No hay horarios disponibles
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              No hay empleados disponibles para la fecha seleccionada.
              <br />
              Por favor, selecciona otra fecha.
            </Typography>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              Día no disponible
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              No hay atención disponible para este día.
              <br />
              Por favor, selecciona otra fecha.
            </Typography>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            disabled={!selectedDate || !selectedHorario || creatingCita}
            onClick={handleConfirmarCita}
            sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
              }
            }}
          >
            {creatingCita ? <CircularProgress size={24} /> : 'Confirmar Cita'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CitaModal;
