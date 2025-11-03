'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Alert,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  useGetConfiguracionHorarios, 
  useCrearHorario, 
  useEliminarHorario 
} from '../../hooks/useHorarios';
import { CARD_BG } from '../../theme/colors';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const HORARIOS_DISPONIBLES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];

interface HorarioFormData {
  fecha: string; // YYYY-MM-DD
  horaInicio: string;
  horaFin: string;
}

/**
 * Componente para gestionar horarios laborales de empleados con fechas específicas
 */
export const HorariosManagement: React.FC = () => {
  const { isAdmin, empleadoId, user } = useUserRole();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fecha inicial: lunes de la semana actual
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 }) // 1 = lunes
  );

  const [formData, setFormData] = useState<HorarioFormData>({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    horaInicio: '09:00',
    horaFin: '18:00',
  });

  const { data: horariosRaw, isLoading } = useGetConfiguracionHorarios(empleadoId || 0);
  const crearHorarioMutation = useCrearHorario();
  const eliminarHorarioMutation = useEliminarHorario();

  // Verificar que tenemos empleadoId
  React.useEffect(() => {
    console.log('🔍 Debug - User data:', { user, empleadoId, isAdmin, isLoading });
    if (!empleadoId && !isLoading) {
      console.error('❌ No empleadoId found');
      setErrorMessage('No se pudo identificar el empleado. Asegúrate de haber iniciado sesión correctamente.');
    } else if (empleadoId) {
      console.log('✅ EmpleadoId found:', empleadoId);
      setErrorMessage('');
    }
  }, [empleadoId, isLoading, user, isAdmin]);

  // Procesar horarios raw del backend (con desde/hasta) a formato agrupado por fecha
  const horarios = React.useMemo(() => {
    if (!horariosRaw) return [];
    
    return horariosRaw.map(horario => {
      const desde = new Date(horario.desde);
      const hasta = new Date(horario.hasta);
      
      return {
        id: horario.id,
        empleadoId: horario.empleado?.id || empleadoId || 0,
        fecha: format(desde, 'yyyy-MM-dd'),
        fechaDisplay: format(desde, "EEEE d 'de' MMMM", { locale: es }),
        diaSemana: desde.getDay(),
        horaInicio: desde.toTimeString().slice(0, 5), // HH:mm
        horaFin: hasta.toTimeString().slice(0, 5), // HH:mm
        activo: horario.estaActivo,
        createdAt: horario.createdAt,
        updatedAt: horario.updatedAt,
      };
    });
  }, [horariosRaw, empleadoId]);

  // Generar array de 7 días desde el lunes actual
  const semanaActual = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = addDays(currentWeekStart, i);
      return {
        fecha: format(fecha, 'yyyy-MM-dd'),
        fechaDisplay: format(fecha, "EEEE d 'de' MMMM", { locale: es }),
        diaSemana: fecha.getDay(),
      };
    });
  }, [currentWeekStart]);

  const roleColor = isAdmin ? '#dc2626' : '#2563eb';

  // Función para verificar si una hora específica está bloqueada para la fecha seleccionada
  const isHoraBloqueada = React.useCallback((hora: string, fecha: string): boolean => {
    if (!horarios || horarios.length === 0) return false;

    const horaMinutos = hora.split(':').map(Number);
    const horaEnMinutos = horaMinutos[0] * 60 + horaMinutos[1];

    return horarios.some(h => {
      if (h.fecha !== fecha) return false;

      const inicioMinutos = h.horaInicio.split(':').map(Number);
      const finMinutos = h.horaFin.split(':').map(Number);
      const inicioEnMinutos = inicioMinutos[0] * 60 + inicioMinutos[1];
      const finEnMinutos = finMinutos[0] * 60 + finMinutos[1];

      // La hora está bloqueada si cae dentro de un horario existente
      return horaEnMinutos >= inicioEnMinutos && horaEnMinutos < finEnMinutos;
    });
  }, [horarios]);

  // Obtener horarios disponibles para inicio (excluir horas bloqueadas)
  const horariosInicioDisponibles = React.useMemo(() => {
    return HORARIOS_DISPONIBLES.filter(hora => !isHoraBloqueada(hora, formData.fecha));
  }, [formData.fecha, isHoraBloqueada]);

  // Obtener horarios disponibles para fin (basados en hora inicio seleccionada)
  const horariosFinDisponibles = React.useMemo(() => {
    if (!formData.horaInicio) return HORARIOS_DISPONIBLES;

    const inicioMinutos = formData.horaInicio.split(':').map(Number);
    const inicioEnMinutos = inicioMinutos[0] * 60 + inicioMinutos[1];

    return HORARIOS_DISPONIBLES.filter(hora => {
      const horaMinutos = hora.split(':').map(Number);
      const horaEnMinutos = horaMinutos[0] * 60 + horaMinutos[1];

      // La hora fin debe ser posterior a hora inicio
      if (horaEnMinutos <= inicioEnMinutos) return false;

      // Verificar que no esté bloqueada por otro horario
      return !isHoraBloqueada(hora, formData.fecha);
    });
  }, [formData.horaInicio, formData.fecha, isHoraBloqueada]);

  const handleOpenDialog = () => {
    const fechaInicial = format(new Date(), 'yyyy-MM-dd');
    const horariosEnFecha = horarios?.filter(h => h.fecha === fechaInicial) || [];
    
    // Si hay horarios en la fecha actual, usar el siguiente día hábil
    let fechaDisponible = fechaInicial;
    if (horariosEnFecha.length > 0) {
      const manana = addDays(new Date(), 1);
      fechaDisponible = format(manana, 'yyyy-MM-dd');
    }

    setFormData({
      fecha: fechaDisponible,
      horaInicio: '09:00',
      horaFin: '18:00',
    });
    setDialogOpen(true);
    setErrorMessage('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      fecha: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '09:00',
      horaFin: '18:00',
    });
    setErrorMessage('');
  };

  const handleChange = (field: keyof HorarioFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si se cambia la fecha, resetear las horas si están bloqueadas
      if (field === 'fecha') {
        const inicioDisponible = !isHoraBloqueada(newData.horaInicio, value);
        const finDisponible = !isHoraBloqueada(newData.horaFin, value);
        
        if (!inicioDisponible || !finDisponible) {
          // Buscar primera hora disponible
          const primeraHoraDisponible = HORARIOS_DISPONIBLES.find(h => !isHoraBloqueada(h, value));
          newData.horaInicio = primeraHoraDisponible || '09:00';
          newData.horaFin = '18:00';
        }
      }
      
      // Si se cambia hora inicio, ajustar hora fin si es necesaria
      if (field === 'horaInicio') {
        const inicioMinutos = value.split(':').map(Number);
        const finMinutos = newData.horaFin.split(':').map(Number);
        const inicioEnMin = inicioMinutos[0] * 60 + inicioMinutos[1];
        const finEnMin = finMinutos[0] * 60 + finMinutos[1];
        
        // Si hora fin es anterior o igual a hora inicio, ajustar
        if (finEnMin <= inicioEnMin) {
          const siguienteHora = HORARIOS_DISPONIBLES.find(h => {
            const hMin = h.split(':').map(Number);
            const hEnMin = hMin[0] * 60 + hMin[1];
            return hEnMin > inicioEnMin && !isHoraBloqueada(h, newData.fecha);
          });
          newData.horaFin = siguienteHora || '18:00';
        }
      }
      
      return newData;
    });
    setErrorMessage('');
  };

  const validateHorario = (): string | null => {
    if (!formData.fecha) {
      return 'Debe seleccionar una fecha';
    }

    if (!formData.horaInicio || !formData.horaFin) {
      return 'Debe seleccionar hora de inicio y fin';
    }

    const inicio = formData.horaInicio.split(':').map(Number);
    const fin = formData.horaFin.split(':').map(Number);
    
    const inicioMinutos = inicio[0] * 60 + inicio[1];
    const finMinutos = fin[0] * 60 + fin[1];

    if (finMinutos <= inicioMinutos) {
      return 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Verificar colisiones con horarios existentes más detalladamente
    const horarioConflictivo = horarios?.find(h => {
      if (h.fecha !== formData.fecha) return false;

      const hInicio = h.horaInicio.split(':').map(Number);
      const hFin = h.horaFin.split(':').map(Number);
      const hInicioMin = hInicio[0] * 60 + hInicio[1];
      const hFinMin = hFin[0] * 60 + hFin[1];

      // Detectar cualquier tipo de solapamiento
      const haySolapamiento = (
        // Nuevo horario empieza dentro de uno existente
        (inicioMinutos >= hInicioMin && inicioMinutos < hFinMin) ||
        // Nuevo horario termina dentro de uno existente
        (finMinutos > hInicioMin && finMinutos <= hFinMin) ||
        // Nuevo horario envuelve completamente a uno existente
        (inicioMinutos <= hInicioMin && finMinutos >= hFinMin)
      );

      return haySolapamiento;
    });
    
    if (horarioConflictivo) {
      return `Este horario colisiona con un horario existente: ${horarioConflictivo.horaInicio} - ${horarioConflictivo.horaFin}`;
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateHorario();
    if (error) {
      setErrorMessage(error);
      return;
    }

    if (!empleadoId) {
      setErrorMessage('No se pudo identificar el empleado');
      return;
    }

    try {
      console.log('📤 Creando horario:', {
        empleadoId,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
      });

      // Usar el endpoint de crear horario específico con fecha
      const resultado = await crearHorarioMutation.mutateAsync({
        empleadoId,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
      });
      
      console.log('✅ Horario creado exitosamente:', resultado);
      setSuccessMessage(`Horario creado: ${formData.fecha} de ${formData.horaInicio} a ${formData.horaFin}`);
      handleCloseDialog();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('❌ Error al crear horario:', error);
      setErrorMessage(error.message || 'Error al crear el horario');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!empleadoId) return;
    
    if (!confirm('¿Está seguro de eliminar este horario?')) {
      return;
    }

    try {
      await eliminarHorarioMutation.mutateAsync({ id, empleadoId });
      setSuccessMessage('Horario eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error al eliminar horario:', error);
      setErrorMessage(error.message || 'Error al eliminar el horario');
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Agrupar horarios por fecha
  const horariosPorFecha = semanaActual.map(dia => ({
    ...dia,
    horarios: horarios?.filter(h => h.fecha === dia.fecha) || [],
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: roleColor, mb: 1 }}>
              Horarios Laborales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configura tus horarios específicos para que los clientes puedan agendar citas
            </Typography>
            {horarios && horarios.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<ScheduleIcon />}
                  label={`${horarios.length} horario${horarios.length > 1 ? 's' : ''} configurado${horarios.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ 
                    bgcolor: `${roleColor}10`,
                    color: roleColor,
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={!empleadoId}
            sx={{
              bgcolor: roleColor,
              '&:hover': {
                bgcolor: roleColor,
                opacity: 0.9,
              },
            }}
          >
            Agregar Horario
          </Button>
        </Box>

        {/* Navegación de semana */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            background: CARD_BG,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePreviousWeek} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
              {format(currentWeekStart, "d 'de' MMMM", { locale: es })} - {format(addDays(currentWeekStart, 6), "d 'de' MMMM yyyy", { locale: es })}
            </Typography>
            <IconButton onClick={handleNextWeek} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={handleToday}
            sx={{
              borderColor: roleColor,
              color: roleColor,
              '&:hover': {
                borderColor: roleColor,
                bgcolor: `${roleColor}08`,
              },
            }}
          >
            Hoy
          </Button>
        </Paper>
      </Box>

      {/* Mensajes */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Grid de horarios por fecha */}
      <Grid container spacing={2}>
        {horariosPorFecha.map((dia) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={dia.fecha}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: CARD_BG,
                border: dia.horarios.length > 0
                  ? `2px solid ${roleColor}20` 
                  : '1px solid rgba(0, 0, 0, 0.08)',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Stack spacing={2}>
                {/* Header del día */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: roleColor }}>
                    {dia.fechaDisplay}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dia.fecha}
                  </Typography>
                  {dia.horarios.length > 0 && (
                    <Chip
                      label={`${dia.horarios.length} bloque${dia.horarios.length > 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        mt: 1,
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: `${roleColor}15`,
                        color: roleColor,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                {/* Horarios del día */}
                {dia.horarios.length > 0 ? (
                  <Stack spacing={1}>
                    {dia.horarios.map((horario) => (
                      <Box
                        key={horario.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `${roleColor}08`,
                          border: `1px solid ${roleColor}20`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 18, color: roleColor }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: roleColor }}>
                                {horario.horaInicio} - {horario.horaFin}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Bloque único de horario
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEliminar(horario.id)}
                            disabled={eliminarHorarioMutation.isPending}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        {horario.activo ? (
                          <Chip
                            label="Activo"
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor: 'success.light',
                              color: 'success.dark',
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Inactivo"
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor: 'grey.300',
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    opacity: 0.5,
                    minHeight: 100,
                  }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Sin horarios configurados
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para agregar horario */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScheduleIcon sx={{ color: roleColor }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Agregar Horario
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Se creará un único bloque de horario desde la hora de inicio hasta la hora de fin
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errorMessage && (
              <Alert severity="error">{errorMessage}</Alert>
            )}

            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                💡 Importante:
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Se creará un único bloque de horario desde la hora de inicio hasta la hora de fin
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                • Las horas <strong style={{ color: '#d32f2f' }}>tachadas</strong> están bloqueadas por otros horarios existentes
              </Typography>
              <Typography variant="caption" component="div">
                • No puedes crear horarios que se solapen con horarios existentes
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: format(new Date(), 'yyyy-MM-dd'), // No permitir fechas pasadas
              }}
              InputProps={{
                startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            {/* Mostrar horarios existentes para la fecha seleccionada */}
            {horarios && horarios.filter(h => h.fecha === formData.fecha).length > 0 && (
              <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Horarios ya registrados en esta fecha:
                </Typography>
                {horarios
                  .filter(h => h.fecha === formData.fecha)
                  .map(h => (
                    <Chip
                      key={h.id}
                      label={`${h.horaInicio} - ${h.horaFin}`}
                      size="small"
                      sx={{ 
                        mr: 0.5, 
                        mt: 0.5,
                        bgcolor: 'error.light',
                        color: 'error.dark',
                      }}
                    />
                  ))
                }
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Hora de inicio</InputLabel>
              <Select
                value={formData.horaInicio}
                label="Hora de inicio"
                onChange={(e) => handleChange('horaInicio', e.target.value)}
              >
                {HORARIOS_DISPONIBLES.map((hora) => {
                  const estaBloqueada = isHoraBloqueada(hora, formData.fecha);
                  return (
                    <MenuItem 
                      key={hora} 
                      value={hora}
                      disabled={estaBloqueada}
                      sx={{
                        opacity: estaBloqueada ? 0.5 : 1,
                        textDecoration: estaBloqueada ? 'line-through' : 'none',
                        color: estaBloqueada ? 'error.main' : 'inherit',
                      }}
                    >
                      {hora} {estaBloqueada && '(Bloqueada)'}
                    </MenuItem>
                  );
                })}
              </Select>
              {horariosInicioDisponibles.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  No hay horarios disponibles para esta fecha
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Hora de fin</InputLabel>
              <Select
                value={formData.horaFin}
                label="Hora de fin"
                onChange={(e) => handleChange('horaFin', e.target.value)}
                disabled={!formData.horaInicio}
              >
                {HORARIOS_DISPONIBLES.map((hora) => {
                  const estaBloqueada = isHoraBloqueada(hora, formData.fecha);
                  const inicioMinutos = formData.horaInicio ? 
                    parseInt(formData.horaInicio.split(':')[0]) * 60 + parseInt(formData.horaInicio.split(':')[1]) : 0;
                  const horaMinutos = parseInt(hora.split(':')[0]) * 60 + parseInt(hora.split(':')[1]);
                  const esAnteriorAInicio = horaMinutos <= inicioMinutos;
                  const estaDeshabilitada = estaBloqueada || esAnteriorAInicio;

                  return (
                    <MenuItem 
                      key={hora} 
                      value={hora}
                      disabled={estaDeshabilitada}
                      sx={{
                        opacity: estaDeshabilitada ? 0.5 : 1,
                        textDecoration: estaBloqueada ? 'line-through' : 'none',
                        color: estaBloqueada ? 'error.main' : esAnteriorAInicio ? 'text.disabled' : 'inherit',
                      }}
                    >
                      {hora} 
                      {estaBloqueada && ' (Bloqueada)'}
                      {esAnteriorAInicio && !estaBloqueada && ' (Antes de inicio)'}
                    </MenuItem>
                  );
                })}
              </Select>
              {formData.horaInicio && horariosFinDisponibles.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  No hay horarios de fin disponibles después de {formData.horaInicio}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={crearHorarioMutation.isPending}
            sx={{
              bgcolor: roleColor,
              '&:hover': {
                bgcolor: roleColor,
                opacity: 0.9,
              },
            }}
          >
            {crearHorarioMutation.isPending ? 'Guardando...' : 'Guardar Horario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
