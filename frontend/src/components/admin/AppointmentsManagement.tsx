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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  FilterList as FilterIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import axios from 'axios';

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  horaInicio?: string;
  horaFinEsperada?: string;
  horaFin?: string;
  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
  };
  empleado?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  servicios: Array<{
    id: number;
    nombre: string;
    precio: number;
  }>;
  precio: number;
  precioFull: number;
  descuento: number;
  precioFinal: number;
  cancelada: boolean;
  motivoCancelacion?: string;
}

interface EstadisticasCitas {
  totalCitas: number;
  citasCanceladas: number;
  citasCompletadas: number;
  citasHoy: number;
  ingresosTotales: number;
}

const AppointmentsManagement: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCitas | null>(null);
  const [fechaFiltro, setFechaFiltro] = useState<Date | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todas');
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [dialogoEstado, setDialogoEstado] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [accionEstado, setAccionEstado] = useState<'completada' | 'cancelada'>('completada');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    cargarCitas();
    cargarEstadisticas();
  }, [fechaFiltro]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      let url = `${apiUrl}/citas/admin/todas`;
      if (fechaFiltro) {
        const fechaStr = fechaFiltro.toISOString().split('T')[0];
        url += `?fecha=${fechaStr}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.exito) {
        let citasFiltradas = response.data.data;
        
        // Aplicar filtro de estado
        if (estadoFiltro === 'activas') {
          citasFiltradas = citasFiltradas.filter((cita: Cita) => !cita.cancelada);
        } else if (estadoFiltro === 'canceladas') {
          citasFiltradas = citasFiltradas.filter((cita: Cita) => cita.cancelada);
        }

        setCitas(citasFiltradas);
      }
    } catch (error) {
      mostrarError('Error al cargar citas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/citas/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.exito) {
        setEstadisticas(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleCambiarEstado = async () => {
    if (!citaSeleccionada) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      await axios.put(
        `${apiUrl}/citas/admin/${citaSeleccionada.id}/estado`,
        {
          estado: accionEstado,
          motivo: accionEstado === 'cancelada' ? motivo : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      mostrarExito(`Cita ${accionEstado === 'completada' ? 'completada' : 'cancelada'} exitosamente`);
      setDialogoEstado(false);
      setCitaSeleccionada(null);
      setMotivo('');
      await cargarCitas();
      await cargarEstadisticas();
    } catch (error) {
      mostrarError('Error al cambiar estado de la cita');
      console.error('Error:', error);
    }
  };

  const abrirDialogoEstado = (cita: Cita, accion: 'completada' | 'cancelada') => {
    setCitaSeleccionada(cita);
    setAccionEstado(accion);
    setDialogoEstado(true);
  };

  const cerrarDialogoEstado = () => {
    setDialogoEstado(false);
    setCitaSeleccionada(null);
    setMotivo('');
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

  const filtrarHoy = () => {
    setFechaFiltro(new Date());
  };

  const limpiarFiltros = () => {
    setFechaFiltro(null);
    setEstadoFiltro('todas');
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        {/* Estadísticas */}
        {estadisticas && (
          <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
            <Box flex="1 1 200px" minWidth="200px">
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Citas
                  </Typography>
                  <Typography variant="h4">
                    {estadisticas.totalCitas}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Citas Hoy
                  </Typography>
                  <Typography variant="h4">
                    {estadisticas.citasHoy}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completadas
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {estadisticas.citasCompletadas}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Canceladas
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {estadisticas.citasCanceladas}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box flex="1 1 200px" minWidth="200px">
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Ingresos Totales
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    ${estadisticas.ingresosTotales.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Header con controles */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Gestión de Citas
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={filtrarHoy}
            >
              Hoy
            </Button>
            <IconButton onClick={cargarCitas} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <DatePicker
              label="Filtrar por fecha"
              value={fechaFiltro}
              onChange={(newValue) => setFechaFiltro(newValue)}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="activas">Activas</MenuItem>
                <MenuItem value="canceladas">Canceladas</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              startIcon={<FilterIcon />}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </Paper>

        {/* Tabla de citas */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Servicios</TableCell>
                <TableCell align="right">Precio Final</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citas.map((cita) => (
                <TableRow key={cita.id}>
                  <TableCell>{cita.id}</TableCell>
                  <TableCell>{formatearFecha(cita.fecha)}</TableCell>
                  <TableCell>{cita.hora}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {cita.cliente.nombres} {cita.cliente.apellidos}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {cita.cliente.telefono}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {cita.empleado ? (
                      `${cita.empleado.nombres} ${cita.empleado.apellidos}`
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Sin asignar
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {cita.servicios.map(servicio => servicio.nombre).join(', ') || 'Sin servicios'}
                  </TableCell>
                  <TableCell align="right">
                    ${cita.precioFinal.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cita.cancelada ? 'Cancelada' : 'Activa'}
                      color={cita.cancelada ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {!cita.cancelada ? (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEstado(cita, 'completada')}
                          color="success"
                          sx={{ mr: 1 }}
                        >
                          <CompleteIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEstado(cita, 'cancelada')}
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        {cita.motivoCancelacion || 'Cancelada'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {citas.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No hay citas disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog para cambiar estado */}
        <Dialog open={dialogoEstado} onClose={cerrarDialogoEstado} maxWidth="sm" fullWidth>
          <DialogTitle>
            {accionEstado === 'completada' ? 'Completar Cita' : 'Cancelar Cita'}
          </DialogTitle>
          <DialogContent>
            {citaSeleccionada && (
              <Box>
                <Typography variant="body1" mb={2}>
                  Cliente: {citaSeleccionada.cliente.nombres} {citaSeleccionada.cliente.apellidos}
                </Typography>
                <Typography variant="body1" mb={2}>
                  Fecha: {formatearFecha(citaSeleccionada.fecha)} - {citaSeleccionada.hora}
                </Typography>
                {accionEstado === 'cancelada' && (
                  <TextField
                    margin="dense"
                    label="Motivo de cancelación"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarDialogoEstado}>
              Cancelar
            </Button>
            <Button
              onClick={handleCambiarEstado}
              variant="contained"
              color={accionEstado === 'completada' ? 'success' : 'error'}
              disabled={accionEstado === 'cancelada' && !motivo.trim()}
            >
              {accionEstado === 'completada' ? 'Completar' : 'Cancelar Cita'}
            </Button>
          </DialogActions>
        </Dialog>

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

export default AppointmentsManagement;