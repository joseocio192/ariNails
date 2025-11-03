'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Avatar,
  Chip,
  IconButton,
  ListItem,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  Person,
  Phone,
  PersonOutline,
  WhatsApp,
  Image as ImageIcon,
  Cancel,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ACCENT_SOLID, ACCENT_GRADIENT } from '../../theme/colors';
import { Cita } from '../../../core/domain/types/citas';



interface CitaItemProps {
  cita: Cita;
  isAdmin: boolean;
  showDate?: boolean;
  onCancel?: (cita: Cita) => void;
}

export const CitaItem: React.FC<CitaItemProps> = ({
  cita,
  isAdmin,
  showDate = true,
  onCancel,
}) => {
  const handleWhatsAppClick = () => {
    const phoneNumber = cita.cliente.telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  // Calcular hora de fin basada en la duración
  const calcularHoraFin = () => {
    const [hours, minutes] = cita.hora.split(':').map(Number);
    const duracionMinutos = cita.duracion || 60; // Por defecto 60 minutos
    
    const totalMinutos = hours * 60 + minutes + duracionMinutos;
    const horaFin = Math.floor(totalMinutos / 60);
    const minutosFin = totalMinutos % 60;
    
    return `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;
  };

  const horaFin = calcularHoraFin();

  return (
    <ListItem
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: 'rgba(125, 150, 116, 0.03)',
        border: '1px solid rgba(125, 150, 116, 0.1)',
        '&:hover': {
          backgroundColor: 'rgba(125, 150, 116, 0.08)',
          boxShadow: '0 4px 12px rgba(125, 150, 116, 0.15)',
        },
        transition: 'all 0.3s',
      }}
    >
      <Grid container spacing={2}>
        {/* Fecha y Hora - Diseño mejorado */}
        <Grid item xs={12} sm={showDate ? 3 : 2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(125, 150, 116, 0.1) 0%, rgba(125, 150, 116, 0.05) 100%)',
              border: '2px solid rgba(125, 150, 116, 0.2)',
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {showDate && (
              <Box>
                <CalendarToday sx={{ color: ACCENT_SOLID, fontSize: 20, mb: 0.5 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: ACCENT_SOLID,
                    lineHeight: 1.2,
                  }}
                >
                  {format(new Date(cita.fecha), 'd', { locale: es })}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: ACCENT_SOLID,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  {format(new Date(cita.fecha), 'MMM', { locale: es })}
                </Typography>
                <Divider sx={{ my: 1, borderColor: 'rgba(125, 150, 116, 0.3)' }} />
              </Box>
            )}
            <Box>
              <AccessTime sx={{ color: ACCENT_SOLID, fontSize: 20, mb: 0.5 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: ACCENT_SOLID,
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  mb: 0.5,
                }}
              >
                {cita.hora}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 2,
                    backgroundColor: 'text.secondary',
                    borderRadius: 1,
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {horaFin}
                </Typography>
              </Stack>
              <Chip
                label={`${cita.duracion || 60} min`}
                size="small"
                icon={<AccessTime sx={{ fontSize: 14 }} />}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(125, 150, 116, 0.15)',
                  color: ACCENT_SOLID,
                  fontWeight: 600,
                  border: '1px solid rgba(125, 150, 116, 0.3)',
                }}
              />
            </Box>
          </Box>
        </Grid>

        {/* Información del Cliente */}
        <Grid item xs={12} sm={isAdmin ? (showDate ? 4 : 5) : (showDate ? 6 : 7)}>
          <Stack spacing={1.5}>
            {/* Nombre del cliente */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                background: ACCENT_GRADIENT,
                boxShadow: '0 2px 8px rgba(125, 150, 116, 0.3)',
              }}>
                <Person sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {cita.cliente.nombres} {cita.cliente.apellidos}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                  <Phone sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {cita.cliente.telefono}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Mostrar empleado si es admin */}
            {isAdmin && cita.empleado && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <PersonOutline sx={{ fontSize: 14, color: '#3b82f6' }} />
                  <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                    Empleado: {cita.empleado.nombres} {cita.empleado.apellidos}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Servicios */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Servicios:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {cita.servicios.slice(0, 2).map((servicio, idx) => (
                  <Chip
                    key={idx}
                    label={typeof servicio === 'string' ? servicio : servicio.nombre}
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem',
                      height: 24,
                      backgroundColor: 'rgba(125, 150, 116, 0.15)',
                      color: ACCENT_SOLID,
                      fontWeight: 600,
                      border: '1px solid rgba(125, 150, 116, 0.3)',
                    }}
                  />
                ))}
                {cita.servicios.length > 2 && (
                  <Chip
                    label={`+${cita.servicios.length - 2} más`}
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem',
                      height: 24,
                      backgroundColor: 'rgba(125, 150, 116, 0.25)',
                      color: ACCENT_SOLID,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Stack>
        </Grid>

        {/* Acciones */}
        <Grid item xs={12} sm={isAdmin ? (showDate ? 5 : 5) : (showDate ? 3 : 3)}>
          <Stack spacing={1.5} alignItems="flex-end" sx={{ height: '100%', justifyContent: 'space-between' }}>
            {/* Estado */}
            <Chip
              label={
                cita.cancelada 
                  ? '❌ Cancelada' 
                  : cita.estado === 'confirmada'
                  ? '✅ Confirmada'
                  : cita.estado === 'completada'
                  ? '✓ Completada'
                  : '⏳ Pendiente'
              }
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 26,
                px: 1.5,
                fontWeight: 700,
                backgroundColor: 
                  cita.cancelada
                    ? 'rgba(239, 68, 68, 0.15)'
                    : cita.estado === 'confirmada' 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : cita.estado === 'completada'
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'rgba(251, 191, 36, 0.15)',
                color: 
                  cita.cancelada
                    ? '#dc2626'
                    : cita.estado === 'confirmada' 
                    ? '#16a34a' 
                    : cita.estado === 'completada'
                    ? '#2563eb'
                    : '#d97706',
                border: `1.5px solid ${
                  cita.cancelada
                    ? '#ef4444'
                    : cita.estado === 'confirmada' 
                    ? '#22c55e' 
                    : cita.estado === 'completada'
                    ? '#3b82f6'
                    : '#f59e0b'
                }`,
              }}
            />
            
            {/* Botones de acción */}
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small"
                onClick={handleWhatsAppClick}
                sx={{ 
                  backgroundColor: '#25D366',
                  color: 'white',
                  width: 32,
                  height: 32,
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                  '&:hover': { 
                    backgroundColor: '#128C7E',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <WhatsApp fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(125, 150, 116, 0.15)',
                  color: ACCENT_SOLID,
                  width: 32,
                  height: 32,
                  border: '1px solid rgba(125, 150, 116, 0.3)',
                  '&:hover': { 
                    backgroundColor: 'rgba(125, 150, 116, 0.25)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
              
              {/* Botón de cancelar/reagendar - disponible para admin y empleados */}
              {!cita.cancelada && cita.estado !== 'completada' && onCancel && (
                <IconButton 
                  size="small"
                  onClick={() => onCancel(cita)}
                  sx={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#dc2626',
                    width: 32,
                    height: 32,
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    '&:hover': { 
                      backgroundColor: 'rgba(239, 68, 68, 0.25)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </ListItem>
  );
};