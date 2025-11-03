'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CitaItem } from './CitaItem';
import { ACCENT_SOLID } from '../../theme/colors';
import { Cita } from '../../../core/domain/types/citas';



interface CitasListProps {
  citas: Cita[];
  isAdmin: boolean;
  groupByDate?: boolean;
  title?: string;
  emptyMessage?: string;
  onCancelar?: (cita: Cita) => void;
}

export const CitasList: React.FC<CitasListProps> = ({
  citas = [],
  isAdmin,
  groupByDate = false,
  title = "Citas",
  emptyMessage = "No hay citas en el rango seleccionado",
  onCancelar,
}) => {
  const citasAgrupadas = React.useMemo(() => {
    if (!groupByDate) {
      return [{ fecha: null, citas }];
    }

    const grupos = citas.reduce((acc, cita) => {
      const fechaStr = format(new Date(cita.fecha), 'yyyy-MM-dd');
      if (!acc[fechaStr]) {
        acc[fechaStr] = [];
      }
      acc[fechaStr].push(cita);
      return acc;
    }, {} as Record<string, Cita[]>);

    return Object.entries(grupos)
      .map(([fechaStr, citasDelDia]) => ({
        // Agregar 'T12:00:00' para evitar problemas de zona horaria
        fecha: new Date(fechaStr + 'T12:00:00'),
        citas: citasDelDia.sort((a, b) => a.hora.localeCompare(b.hora)),
      }))
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [citas, groupByDate]);

  const totalCitas = citas.length;
  const citasCanceladas = citas.filter(c => c.cancelada).length;
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length;
  const citasCompletadas = citas.filter(c => c.estado === 'completada').length;

  if (totalCitas === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'rgba(125, 150, 116, 0.02)',
          border: '1px solid rgba(125, 150, 116, 0.1)',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 1, fontWeight: 500 }}
        >
          📅 {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona un rango de fechas en el calendario para ver las citas
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header con título y estadísticas */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: ACCENT_SOLID }}>
            {title}
          </Typography>
          <Chip
            label={`${totalCitas} total`}
            size="small"
            sx={{
              backgroundColor: 'rgba(125, 150, 116, 0.15)',
              color: ACCENT_SOLID,
              fontWeight: 700,
              fontSize: '0.8rem',
              border: '1px solid rgba(125, 150, 116, 0.3)',
            }}
          />
        </Box>
        
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {citasConfirmadas > 0 && (
            <Chip
              label={`✅ ${citasConfirmadas} Confirmadas`}
              size="small"
              sx={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#16a34a',
                fontWeight: 600,
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            />
          )}
          {citasCompletadas > 0 && (
            <Chip
              label={`✓ ${citasCompletadas} Completadas`}
              size="small"
              sx={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#2563eb',
                fontWeight: 600,
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            />
          )}
          {citasCanceladas > 0 && (
            <Chip
              label={`❌ ${citasCanceladas} Canceladas`}
              size="small"
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#dc2626',
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            />
          )}
          {totalCitas - citasConfirmadas - citasCompletadas - citasCanceladas > 0 && (
            <Chip
              label={`⏳ ${totalCitas - citasConfirmadas - citasCompletadas - citasCanceladas} Pendientes`}
              size="small"
              sx={{
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                color: '#d97706',
                fontWeight: 600,
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            />
          )}
        </Stack>
      </Stack>

      {/* Lista de citas */}
      <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {citasAgrupadas.map((grupo, idx) => (
          <Box key={grupo.fecha?.toISOString() || 'sin-fecha'} sx={{ mb: 2 }}>
            {/* Header de fecha (solo si se agrupa por fecha) */}
            {groupByDate && grupo.fecha && (
              <Box 
                sx={{ 
                  mb: 3,
                  p: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(125, 150, 116, 0.15) 0%, rgba(125, 150, 116, 0.08) 100%)',
                  border: '2px solid rgba(125, 150, 116, 0.25)',
                  boxShadow: '0 2px 8px rgba(125, 150, 116, 0.1)',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: ACCENT_SOLID,
                        textTransform: 'capitalize',
                        mb: 0.5,
                      }}
                    >
                      📅 {format(grupo.fecha, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      Resumen del día
                    </Typography>
                  </Box>
                  <Chip
                    label={`${grupo.citas.length} cita${grupo.citas.length !== 1 ? 's' : ''}`}
                    size="medium"
                    sx={{
                      backgroundColor: ACCENT_SOLID,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      height: 32,
                      boxShadow: '0 2px 4px rgba(125, 150, 116, 0.3)',
                    }}
                  />
                </Stack>
              </Box>
            )}

            {/* Lista de citas del grupo */}
            <List disablePadding>
              {grupo.citas.map((cita, citaIdx) => (
                <Box key={cita.id}>
                  <CitaItem
                    cita={cita}
                    isAdmin={isAdmin}
                    showDate={!groupByDate}
                    onCancel={onCancelar}
                  />
                  {citaIdx < grupo.citas.length - 1 && (
                    <Divider sx={{ my: 2, borderColor: 'rgba(125, 150, 116, 0.15)' }} />
                  )}
                </Box>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
};