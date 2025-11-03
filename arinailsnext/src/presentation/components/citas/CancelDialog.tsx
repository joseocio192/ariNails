'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Stack,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Warning,
  Person,
  AccessTime,
  CalendarToday,
  AttachMoney,
  Info,
  EventRepeat,
} from '@mui/icons-material';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ACCENT_SOLID, ACCENT_GRADIENT } from '../../theme/colors';
import { Cita } from '../../../core/domain/types/citas';



interface CancelDialogProps {
  open: boolean;
  cita: Cita | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, realizarReembolso: boolean, nuevaFecha?: string, nuevaHora?: string) => void;
}

export const CancelDialog: React.FC<CancelDialogProps> = ({
  open,
  cita,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const [motivo, setMotivo] = React.useState('');
  const [error, setError] = React.useState('');
  const [realizarReembolso, setRealizarReembolso] = React.useState(true); // Por defecto activado
  const [nuevaFecha, setNuevaFecha] = React.useState('');
  const [nuevaHora, setNuevaHora] = React.useState('');

  // Resetear estado al cerrar
  React.useEffect(() => {
    if (!open) {
      setMotivo('');
      setError('');
      setRealizarReembolso(true); // Resetear checkbox
      setNuevaFecha('');
      setNuevaHora('');
    }
  }, [open]);

  // Calcular fecha mínima (mañana)
  const fechaMinima = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError('Por favor, proporciona un motivo para la cancelación');
      return;
    }
    if (motivo.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return;
    }
    
    // Si NO hay reembolso, la reagendación es OBLIGATORIA
    if (!realizarReembolso) {
      if (!nuevaFecha || !nuevaHora) {
        setError('Debes proporcionar una nueva fecha y hora para la cita');
        return;
      }
    }
    
    setError('');
    onConfirm(motivo.trim(), realizarReembolso, nuevaFecha, nuevaHora);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!cita) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
          }}>
            <Warning />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Cancelar Cita
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Stack spacing={3}>
          {/* Información de la cita */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(125, 150, 116, 0.05)',
              border: '1px solid rgba(125, 150, 116, 0.1)',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: ACCENT_SOLID }}>
              Información de la Cita
            </Typography>
            
            <Stack spacing={1.5}>
              {/* Cliente */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>{cita.cliente.nombres} {cita.cliente.apellidos}</strong>
                </Typography>
              </Stack>

              {/* Fecha y hora */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {format(new Date(cita.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {cita.hora}
                </Typography>
              </Stack>

              {/* Empleado (si está disponible) */}
              {cita.empleado && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ 
                    width: 18, 
                    height: 18, 
                    background: ACCENT_GRADIENT,
                    fontSize: 10,
                  }}>
                    {cita.empleado.nombres[0]}
                  </Avatar>
                  <Typography variant="body2">
                    {cita.empleado.nombres} {cita.empleado.apellidos}
                  </Typography>
                </Stack>
              )}

              {/* Servicios */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Servicios:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {cita.servicios.map((servicio, idx) => (
                    <Chip
                      key={idx}
                      label={typeof servicio === 'string' ? servicio : servicio.nombre}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(125, 150, 116, 0.1)',
                        color: ACCENT_SOLID,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Campo de motivo */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Motivo de la cancelación *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo de la cancelación..."
              disabled={loading}
              error={!!error}
              helperText={error || 'Mínimo 5 caracteres'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: ACCENT_SOLID,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: ACCENT_SOLID,
                  },
                },
              }}
            />
          </Box>

          <Divider />

          {/* Sección de Reembolso o Reagendado */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: realizarReembolso ? 'rgba(59, 130, 246, 0.05)' : 'rgba(125, 150, 116, 0.05)',
              border: '1px solid',
              borderColor: realizarReembolso ? 'rgba(59, 130, 246, 0.2)' : 'rgba(125, 150, 116, 0.2)',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {realizarReembolso ? (
                  <>
                    <AttachMoney sx={{ color: '#2563eb', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                      Política de Reembolso
                    </Typography>
                  </>
                ) : (
                  <>
                    <EventRepeat sx={{ color: ACCENT_SOLID, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: ACCENT_SOLID }}>
                      Reagendar Cita (Obligatorio)
                    </Typography>
                  </>
                )}
              </Stack>

              <Alert severity={realizarReembolso ? "info" : "warning"} sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{realizarReembolso ? 'Política del negocio:' : '⚠️ Importante:'}</strong>
                </Typography>
                {realizarReembolso ? (
                  <>
                    <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                      • <strong>Cancelación por empleado/admin:</strong> Reembolso 100% al cliente
                    </Typography>
                    <Typography variant="caption" component="div">
                      • <strong>Cancelación por cliente:</strong> Sin reembolso
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" component="div">
                    Si no realizas el reembolso, <strong>debes reagendar la cita</strong> en una nueva fecha y hora.
                    El cliente tiene derecho a recibir su servicio o su dinero de vuelta.
                  </Typography>
                )}
              </Alert>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={realizarReembolso}
                    onChange={(e) => setRealizarReembolso(e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: '#2563eb',
                      '&.Mui-checked': {
                        color: '#2563eb',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    <strong>Realizar reembolso del 100% al cliente</strong>
                  </Typography>
                }
              />

              {realizarReembolso ? (
                <Alert severity="warning" icon={<Info />} sx={{ borderRadius: 2 }}>
                  <Typography variant="caption">
                    <strong>Nota sobre comisiones de Stripe:</strong> Stripe procesará el reembolso completo al cliente, 
                    pero las comisiones de transacción (≈3%) no serán devueltas. Estas comisiones quedan a cargo del negocio.
                  </Typography>
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    label="Nueva Fecha"
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    disabled={loading}
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: fechaMinima,
                    }}
                    helperText="Selecciona la nueva fecha para reagendar la cita"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: ACCENT_SOLID,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: ACCENT_SOLID,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: ACCENT_SOLID,
                      },
                    }}
                  />

                  <TextField
                    label="Nueva Hora"
                    type="time"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    disabled={loading}
                    fullWidth
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Selecciona la nueva hora para reagendar la cita"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: ACCENT_SOLID,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: ACCENT_SOLID,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: ACCENT_SOLID,
                      },
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Alerta de advertencia */}
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Atención:</strong> Una vez {realizarReembolso ? 'cancelada con reembolso' : 'reagendada'}, 
              la acción no se puede deshacer. Se notificará automáticamente al cliente sobre 
              {realizarReembolso ? ' la cancelación y el reembolso' : ' la nueva fecha y hora de su cita'}.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || !motivo.trim() || motivo.trim().length < 5 || (!realizarReembolso && (!nuevaFecha || !nuevaHora))}
          variant="contained"
          color={realizarReembolso ? "error" : "success"}
          sx={{
            minWidth: 180,
            fontWeight: 600,
            backgroundColor: realizarReembolso ? undefined : ACCENT_SOLID,
            '&:hover': {
              backgroundColor: realizarReembolso ? undefined : ACCENT_GRADIENT,
            },
            '&:disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            }
          }}
          startIcon={loading ? <CircularProgress size={16} /> : realizarReembolso ? undefined : <EventRepeat />}
        >
          {loading 
            ? 'Procesando...' 
            : realizarReembolso 
              ? 'Cancelar y Reembolsar' 
              : 'Reagendar Cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};