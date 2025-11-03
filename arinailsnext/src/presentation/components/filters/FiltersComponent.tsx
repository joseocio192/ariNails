'use client';

import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import { ACCENT_SOLID } from '../../theme/colors';

interface FiltersComponentProps {
  selectedFilters: {
    servicios: string[];
    cliente?: string;
    tipo?: string;
    estado?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const FiltersComponent: React.FC<FiltersComponentProps> = ({
  selectedFilters,
  onFiltersChange,
}) => {
  const serviciosOptions = [
    { value: 'cortas', label: 'Cortas' },
    { value: 'medianas', label: 'Medianas' },
    { value: 'largas', label: 'Largas' },
  ];

  const estadosOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const handleServicioChange = (servicio: string, checked: boolean) => {
    const newServicios = checked 
      ? [...selectedFilters.servicios, servicio]
      : selectedFilters.servicios.filter(s => s !== servicio);
    
    onFiltersChange({
      ...selectedFilters,
      servicios: newServicios
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Filtros por Servicios */}
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: ACCENT_SOLID 
            }} 
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: ACCENT_SOLID }}>
            Servicios
          </Typography>
        </Stack>
        
        {serviciosOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                size="small"
                checked={selectedFilters.servicios.includes(option.value)}
                onChange={(e) => handleServicioChange(option.value, e.target.checked)}
                sx={{
                  color: ACCENT_SOLID,
                  '&.Mui-checked': {
                    color: ACCENT_SOLID,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                {option.label}
              </Typography>
            }
            sx={{ ml: 0.5 }}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Filtro por Cliente */}
      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ 
          fontWeight: 600, 
          color: ACCENT_SOLID,
          backgroundColor: 'rgba(125, 150, 116, 0.1)',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          textAlign: 'center'
        }}>
          Cliente
        </Typography>
        
        <TextField
          size="small"
          placeholder="Buscar cliente..."
          value={selectedFilters.cliente || ''}
          onChange={(e) => onFiltersChange({
            ...selectedFilters,
            cliente: e.target.value
          })}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(125, 150, 116, 0.05)',
              '&:hover fieldset': {
                borderColor: ACCENT_SOLID,
              },
              '&.Mui-focused fieldset': {
                borderColor: ACCENT_SOLID,
              },
            },
          }}
        />
      </Stack>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Filtro por Tipo */}
      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ 
          fontWeight: 600, 
          color: ACCENT_SOLID,
          backgroundColor: 'rgba(125, 150, 116, 0.1)',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          textAlign: 'center'
        }}>
          Tipo
        </Typography>
        
        <TextField
          select
          size="small"
          value={selectedFilters.tipo || ''}
          onChange={(e) => onFiltersChange({
            ...selectedFilters,
            tipo: e.target.value
          })}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(125, 150, 116, 0.05)',
              '&:hover fieldset': {
                borderColor: ACCENT_SOLID,
              },
              '&.Mui-focused fieldset': {
                borderColor: ACCENT_SOLID,
              },
            },
          }}
        >
            {/*TODO: made dinamic services*/}
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="manicure">Manicure</MenuItem>
          <MenuItem value="pedicure">Pedicure</MenuItem>
          <MenuItem value="unas_gel">Uñas Gel</MenuItem>
          <MenuItem value="decoracion">Decoración</MenuItem>
        </TextField>
      </Stack>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Filtro por Estado */}
      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ 
          fontWeight: 600, 
          color: ACCENT_SOLID,
          backgroundColor: 'rgba(125, 150, 116, 0.1)',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          textAlign: 'center'
        }}>
          Estado
        </Typography>
        
        <TextField
          select
          size="small"
          value={selectedFilters.estado || ''}
          onChange={(e) => onFiltersChange({
            ...selectedFilters,
            estado: e.target.value
          })}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(125, 150, 116, 0.05)',
              '&:hover fieldset': {
                borderColor: ACCENT_SOLID,
              },
              '&.Mui-focused fieldset': {
                borderColor: ACCENT_SOLID,
              },
            },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {estadosOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};