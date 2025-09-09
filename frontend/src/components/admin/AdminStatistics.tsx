import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Build as ServiceIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface EstadisticasCitas {
  totalCitas: number;
  citasCanceladas: number;
  citasCompletadas: number;
  citasHoy: number;
  ingresosTotales: number;
}

interface EstadisticaDashboard {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  color: string;
  tendencia?: string;
}

const AdminStatistics: React.FC = () => {
  const [estadisticasCitas, setEstadisticasCitas] = useState<EstadisticasCitas | null>(null);
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autorización');
        return;
      }

      const response = await axios.get(`${apiUrl}/citas/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.exito) {
        setEstadisticasCitas(response.data.data);
        setUltimaActualizacion(new Date());
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentajeCompletadas = () => {
    if (!estadisticasCitas || estadisticasCitas.totalCitas === 0) return 0;
    return Math.round((estadisticasCitas.citasCompletadas / estadisticasCitas.totalCitas) * 100);
  };

  const calcularPromedioDiario = () => {
    if (!estadisticasCitas) return 0;
    // Estimación simple: dividir ingresos totales entre 30 días
    return estadisticasCitas.ingresosTotales / 30;
  };

  const estadisticasPrincipales: EstadisticaDashboard[] = estadisticasCitas ? [
    {
      titulo: 'Total de Citas',
      valor: estadisticasCitas.totalCitas,
      icono: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      titulo: 'Citas Hoy',
      valor: estadisticasCitas.citasHoy,
      icono: <CalendarIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32'
    },
    {
      titulo: 'Ingresos Totales',
      valor: `$${estadisticasCitas.ingresosTotales.toFixed(2)}`,
      icono: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02'
    },
    {
      titulo: 'Tasa de Éxito',
      valor: `${calcularPorcentajeCompletadas()}%`,
      icono: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    }
  ] : [];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard Administrativo
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={cargarEstadisticas}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Estadísticas principales */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
        {estadisticasPrincipales.map((stat, index) => (
          <Box key={index} flex="1 1 250px" minWidth="250px">
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.titulo}
                    </Typography>
                    <Typography variant="h3" component="div" color={stat.color}>
                      {stat.valor}
                    </Typography>
                    {stat.tendencia && (
                      <Typography variant="body2" color="textSecondary">
                        {stat.tendencia}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icono}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Detalles y métricas adicionales */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Estado de las citas */}
        <Box flex="1 1 400px" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de las Citas
              </Typography>
              
              {estadisticasCitas && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">Citas Completadas</Typography>
                    <Chip 
                      label={estadisticasCitas.citasCompletadas}
                      color="success"
                      icon={<CompleteIcon />}
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={calcularPorcentajeCompletadas()} 
                    sx={{ mb: 1, height: 10, borderRadius: 5 }}
                    color="success"
                  />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">Citas Canceladas</Typography>
                    <Chip 
                      label={estadisticasCitas.citasCanceladas}
                      color="error"
                      icon={<CancelIcon />}
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(estadisticasCitas.citasCanceladas / estadisticasCitas.totalCitas) * 100} 
                    sx={{ mb: 2, height: 10, borderRadius: 5 }}
                    color="error"
                  />

                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="textSecondary">
                    Total de citas registradas: {estadisticasCitas.totalCitas}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Información adicional */}
        <Box flex="1 1 400px" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas del Negocio
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Promedio Diario Estimado"
                    secondary={`$${calcularPromedioDiario().toFixed(2)}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Citas de Hoy"
                    secondary={estadisticasCitas ? `${estadisticasCitas.citasHoy} citas programadas` : 'Cargando...'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tasa de Éxito"
                    secondary={`${calcularPorcentajeCompletadas()}% de citas completadas exitosamente`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Panel de acciones rápidas */}
        <Box width="100%">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 200px" minWidth="200px">
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EventIcon />}
                  sx={{ height: 60 }}
                >
                  Ver Citas del Día
                </Button>
              </Box>
              
              <Box flex="1 1 200px" minWidth="200px">
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ServiceIcon />}
                  sx={{ height: 60 }}
                >
                  Gestionar Servicios
                </Button>
              </Box>
              
              <Box flex="1 1 200px" minWidth="200px">
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CalendarIcon />}
                  sx={{ height: 60 }}
                >
                  Configurar Horarios
                </Button>
              </Box>
              
              <Box flex="1 1 200px" minWidth="200px">
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{ height: 60 }}
                >
                  Ver Empleados
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Información de última actualización */}
      <Box mt={3} display="flex" justifyContent="center">
        <Typography variant="body2" color="textSecondary">
          Última actualización: {ultimaActualizacion.toLocaleString('es-ES')}
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminStatistics;