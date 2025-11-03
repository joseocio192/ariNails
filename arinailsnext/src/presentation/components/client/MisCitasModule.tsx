'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  CalendarMonth,
  Schedule,
  Person,
  AttachMoney,
  Cancel,
  CheckCircle,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetMisCitas, useCancelarCita } from '@/presentation/hooks/useCitas';
import { useUserRole } from '@/presentation/hooks/useUserRole';
import { useToast } from '@/presentation/hooks/useToast';

interface CitaCliente {
  id: number;
  fecha: string;
  hora: string;
  empleado: {
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
  anticipoPagado: number;
  saldoPendiente: number;
  cancelada: boolean;
  motivoCancelacion?: string;
}

export const MisCitasModule: React.FC = () => {
  const { clienteId, isLoading: userLoading } = useUserRole();
  const { data: citas = [], isLoading, refetch } = useGetMisCitas(clienteId || undefined);
  const cancelarMutation = useCancelarCita();
  const { showToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<number | null>(null);

  const handleOpenDialog = (citaId: number) => {
    setSelectedCita(citaId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCita(null);
  };

  const handleCancelar = async () => {
    if (!selectedCita) return;

    try {
      await cancelarMutation.mutateAsync({
        citaId: selectedCita,
        motivo: 'Cancelada por el cliente',
        realizarReembolso: false, // Los clientes NO reciben reembolso según la política
      });
      showToast('success', 'Cita cancelada exitosamente');
      refetch();
      handleCloseDialog();
    } catch (error: any) {
      showToast('error', error.message || 'Error al cancelar la cita');
    }
  };

  if (userLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!citas || citas.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          No tienes citas programadas. ¡Agenda tu primera cita ahora!
        </Alert>
      </Box>
    );
  }

  const citasActivas = citas.filter((cita) => !cita.cancelada);
  const citasCanceladas = citas.filter((cita) => cita.cancelada);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Mis Citas
      </Typography>

      {/* Citas Activas */}
      {citasActivas.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Próximas Citas
          </Typography>
          <Grid container spacing={3}>
            {citasActivas.map((cita) => (
              <Grid item xs={12} md={6} lg={4} key={cita.id}>
                <Card elevation={3}>
                  <CardContent>
                    {/* Estado */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        icon={<CheckCircle />}
                        label="Activa"
                        color="success"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ID: {cita.id}
                      </Typography>
                    </Box>

                    {/* Fecha y Hora */}
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarMonth sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {format(new Date(cita.fecha), "EEEE, d 'de' MMMM yyyy", {
                          locale: es,
                        })}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">{cita.hora}</Typography>
                    </Box>

                    {/* Empleado */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Person sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="body2">
                        {cita.empleado.nombres} {cita.empleado.apellidos}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Servicios */}
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      Servicios:
                    </Typography>
                    <Box mb={2}>
                      {cita.servicios.map((servicio) => (
                        <Chip
                          key={servicio.id}
                          label={servicio.nombre}
                          size="small"
                          sx={{ 
                            mr: 0.5, 
                            mb: 0.5,
                            bgcolor: 'primary.50',
                            borderColor: 'primary.main',
                            border: '1px solid',
                            '&:hover': {
                              bgcolor: 'primary.100',
                            }
                          }}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Información de Pago */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Precio Total:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${Number(cita.precio || 0).toFixed(2)} MXN
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="success.main">
                          Anticipo Pagado:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ${Number(cita.anticipoPagado || 0).toFixed(2)} MXN
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="warning.main">
                          Saldo Pendiente:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          ${Number(cita.saldoPendiente || 0).toFixed(2)} MXN
                        </Typography>
                      </Box>
                    </Box>

                    {/* Botón Cancelar */}
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<Cancel />}
                      onClick={() => handleOpenDialog(cita.id)}
                    >
                      Cancelar Cita
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Citas Canceladas */}
      {citasCanceladas.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Citas Canceladas
          </Typography>
          <Grid container spacing={3}>
            {citasCanceladas.map((cita) => (
              <Grid item xs={12} md={6} lg={4} key={cita.id}>
                <Card elevation={1} sx={{ opacity: 0.7 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        icon={<Cancel />}
                        label="Cancelada"
                        color="error"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ID: {cita.id}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(cita.fecha), "EEEE, d 'de' MMMM yyyy", {
                          locale: es,
                        })}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {cita.hora}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {cita.empleado.nombres} {cita.empleado.apellidos}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Servicios */}
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary">
                      Servicios:
                    </Typography>
                    <Box mb={2}>
                      {cita.servicios.map((servicio) => (
                        <Chip
                          key={servicio.id}
                          label={servicio.nombre}
                          size="small"
                          sx={{ 
                            mr: 0.5, 
                            mb: 0.5,
                            opacity: 0.7,
                            bgcolor: 'grey.200',
                            borderColor: 'grey.400',
                            border: '1px solid',
                          }}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Mensaje de cancelación */}
                    {cita.motivoCancelacion && cita.motivoCancelacion.includes('Refund ID') ? (
                      // Caso: Cancelada por el empleado/admin con reembolso
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Cancelación por el salón
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Esta cita fue cancelada por el establecimiento. El reembolso de tu anticipo 
                          (${Number(cita.anticipoPagado || 0).toFixed(2)} MXN) será procesado 
                          automáticamente a tu método de pago en los próximos 5-10 días hábiles.
                        </Typography>
                      </Alert>
                    ) : (
                      // Caso: Cancelada por el cliente (sin reembolso)
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Anticipo pagado: ${Number(cita.anticipoPagado || 0).toFixed(2)} MXN (no reembolsable)
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Dialog de Confirmación */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Cancelar Cita</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cancelar esta cita?
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Importante:
            </Typography>
            <Typography variant="body2">
              Al cancelar la cita, estás de acuerdo en que el anticipo pagado{' '}
              <strong>NO será reembolsado</strong>. Esta acción no se puede deshacer.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No, mantener cita
          </Button>
          <Button
            onClick={handleCancelar}
            color="error"
            variant="contained"
            disabled={cancelarMutation.isPending}
          >
            {cancelarMutation.isPending ? 'Cancelando...' : 'Sí, cancelar cita'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
