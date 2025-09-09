import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as EnableIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  EventBusy as BlockDayIcon,
  Event as EnableDayIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';
import axios from 'axios';

interface HorarioCalendario {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  empleado: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  activo: boolean;
  ocupado: boolean;
}

const CalendarManagement: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioCalendario[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [fechaFin, setFechaFin] = useState<Date>(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [empleadoFiltro] = useState<number | 'todos'>('todos');
  const [vistaCalendario, setVistaCalendario] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    cargarHorarios();
  }, [fechaInicio, fechaFin, empleadoFiltro]);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      const fechaInicioStr = format(fechaInicio, 'yyyy-MM-dd');
      const fechaFinStr = format(fechaFin, 'yyyy-MM-dd');

      const response = await axios.get(
        `${apiUrl}/horarios/admin/calendario?fechaInicio=${fechaInicioStr}&fechaFin=${fechaFinStr}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.exito) {
        let horariosData = response.data.data;
        
        // Filtrar por empleado si está seleccionado
        if (empleadoFiltro !== 'todos') {
          horariosData = horariosData.filter((h: HorarioCalendario) => h.empleado.id === empleadoFiltro);
        }

        setHorarios(horariosData);
      }
    } catch (error) {
      mostrarError('Error al cargar horarios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHorario = async (horario: HorarioCalendario) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      const accion = horario.activo ? 'bloquear' : 'habilitar';
      const endpoint = `${apiUrl}/horarios/admin/${accion}/${horario.id}`;

      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      mostrarExito(`Horario ${horario.activo ? 'bloqueado' : 'habilitado'} exitosamente`);
      await cargarHorarios();
    } catch (error) {
      mostrarError(`Error al ${horario.activo ? 'bloquear' : 'habilitar'} horario`);
      console.error('Error:', error);
    }
  };

  const bloquearDiaCompleto = async (fecha: string, empleadoId?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      await axios.post(
        `${apiUrl}/horarios/admin/bloquear-dia`,
        { fecha, empleadoId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      mostrarExito('Día bloqueado exitosamente');
      await cargarHorarios();
    } catch (error) {
      mostrarError('Error al bloquear día');
      console.error('Error:', error);
    }
  };

  const habilitarDiaCompleto = async (fecha: string, empleadoId?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      await axios.post(
        `${apiUrl}/horarios/admin/habilitar-dia`,
        { fecha, empleadoId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      mostrarExito('Día habilitado exitosamente');
      await cargarHorarios();
    } catch (error) {
      mostrarError('Error al habilitar día');
      console.error('Error:', error);
    }
  };

  const mostrarExito = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const mostrarError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const cambiarSemana = (direccion: 'anterior' | 'siguiente') => {
    const dias = direccion === 'siguiente' ? 7 : -7;
    const nuevaFechaInicio = addDays(fechaInicio, dias);
    const nuevaFechaFin = addDays(fechaFin, dias);
    
    setFechaInicio(nuevaFechaInicio);
    setFechaFin(nuevaFechaFin);
  };

  const irAHoy = () => {
    const hoy = new Date();
    setFechaInicio(startOfWeek(hoy, { weekStartsOn: 1 }));
    setFechaFin(endOfWeek(hoy, { weekStartsOn: 1 }));
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearDiaSemana = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Agrupar horarios por fecha
  const horariosPorFecha = horarios.reduce((acc, horario) => {
    if (!acc[horario.fecha]) {
      acc[horario.fecha] = [];
    }
    acc[horario.fecha].push(horario);
    return acc;
  }, {} as Record<string, HorarioCalendario[]>);

  const fechasUnicas = Object.keys(horariosPorFecha).sort();

  const VistaCalendario = () => (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {fechasUnicas.map(fecha => (
        <Box key={fecha} flex="1 1 300px" minWidth="300px" maxWidth="400px">
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="div">
                  {formatearDiaSemana(fecha)}
                </Typography>
                <Chip
                  label={`${horariosPorFecha[fecha].filter(h => h.activo).length}/${horariosPorFecha[fecha].length}`}
                  size="small"
                  color={horariosPorFecha[fecha].every(h => h.activo) ? 'success' : 'warning'}
                />
              </Box>
              
              <Box mb={2}>
                {horariosPorFecha[fecha].map(horario => (
                  <Box
                    key={horario.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={0.5}
                  >
                    <Typography variant="body2">
                      {horario.horaInicio} - {horario.horaFin}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleHorario(horario)}
                      color={horario.activo ? 'success' : 'error'}
                    >
                      {horario.activo ? <EnableIcon /> : <BlockIcon />}
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Typography variant="caption" display="block" color="textSecondary" mb={1}>
                Empleados: {[...new Set(horariosPorFecha[fecha].map(h => `${h.empleado.nombres} ${h.empleado.apellidos}`))].join(', ')}
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                startIcon={<BlockDayIcon />}
                onClick={() => bloquearDiaCompleto(fecha, empleadoFiltro !== 'todos' ? Number(empleadoFiltro) : undefined)}
                color="error"
              >
                Bloquear Día
              </Button>
              <Button
                size="small"
                startIcon={<EnableDayIcon />}
                onClick={() => habilitarDiaCompleto(fecha, empleadoFiltro !== 'todos' ? Number(empleadoFiltro) : undefined)}
                color="success"
              >
                Habilitar Día
              </Button>
            </CardActions>
          </Card>
        </Box>
      ))}
    </Box>
  );

  const VistaTabla = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Día</TableCell>
            <TableCell>Horario</TableCell>
            <TableCell>Empleado</TableCell>
            <TableCell align="center">Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {horarios.map((horario) => (
            <TableRow key={horario.id}>
              <TableCell>{formatearFecha(horario.fecha)}</TableCell>
              <TableCell>
                {new Date(horario.fecha).toLocaleDateString('es-ES', { weekday: 'long' })}
              </TableCell>
              <TableCell>{horario.horaInicio} - {horario.horaFin}</TableCell>
              <TableCell>
                {horario.empleado.nombres} {horario.empleado.apellidos}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={horario.activo ? 'Activo' : 'Bloqueado'}
                  color={horario.activo ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => toggleHorario(horario)}
                  color={horario.activo ? 'error' : 'success'}
                >
                  {horario.activo ? <BlockIcon /> : <EnableIcon />}
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {horarios.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hay horarios disponibles para el período seleccionado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        {/* Header con controles */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Gestión de Calendario
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={vistaCalendario}
                  onChange={(e) => setVistaCalendario(e.target.checked)}
                />
              }
              label="Vista Calendario"
            />
            <IconButton onClick={cargarHorarios} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Controles de navegación y filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  onClick={() => cambiarSemana('anterior')}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => cambiarSemana('siguiente')}
                >
                  Siguiente →
                </Button>
              </Box>
            </Box>
            
            <Box>
              <Button
                variant="contained"
                startIcon={<TodayIcon />}
                onClick={irAHoy}
              >
                Ir a Hoy
              </Button>
            </Box>

            <Box>
              <DatePicker
                label="Fecha inicio"
                value={fechaInicio}
                onChange={(newValue) => newValue && setFechaInicio(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>

            <Box>
              <DatePicker
                label="Fecha fin"
                value={fechaFin}
                onChange={(newValue) => newValue && setFechaFin(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Período: {format(fechaInicio, 'dd/MM/yyyy')} - {format(fechaFin, 'dd/MM/yyyy')}
            </Typography>
          </Box>
        </Paper>

        {/* Contenido principal */}
        {vistaCalendario ? <VistaCalendario /> : <VistaTabla />}

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarManagement;