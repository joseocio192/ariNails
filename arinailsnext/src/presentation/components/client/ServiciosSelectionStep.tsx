'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useGetServicios } from '../../hooks/useServicios';

interface ServiciosSelectionStepProps {
  selectedServicios: number[];
  onServiciosChange: (serviciosIds: number[]) => void;
  onNext: () => void;
}

/**
 * Paso 1: Selección de servicios
 * Muestra lista de servicios con checkboxes
 */
export const ServiciosSelectionStep: React.FC<ServiciosSelectionStepProps> = ({
  selectedServicios,
  onServiciosChange,
  onNext,
}) => {
  const { data: servicios, isLoading, error } = useGetServicios();
  const [selected, setSelected] = useState<number[]>(selectedServicios);

  useEffect(() => {
    setSelected(selectedServicios);
  }, [selectedServicios]);

  const handleToggleServicio = (servicioId: number) => {
    setSelected((prev) => {
      if (prev.includes(servicioId)) {
        return prev.filter((id) => id !== servicioId);
      } else {
        return [...prev, servicioId];
      }
    });
  };

  const handleContinue = () => {
    onServiciosChange(selected);
    onNext();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error al cargar los servicios. Por favor, intenta nuevamente.
      </Alert>
    );
  }

  const serviciosActivos = servicios?.filter((s) => s.estaActivo) || [];

  // Agrupar servicios por categoría
  const serviciosBasicos = serviciosActivos.filter((s) => s.categoria === 'basico');
  const serviciosExtras = serviciosActivos.filter((s) => s.categoria === 'extra');

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Selecciona los servicios que deseas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Puedes seleccionar uno o más servicios
      </Typography>

      {serviciosActivos.length === 0 ? (
        <Alert severity="info">
          No hay servicios disponibles en este momento.
        </Alert>
      ) : (
        <Box>
          {/* Servicios Básicos */}
          {serviciosBasicos.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                💅 Servicios Básicos
              </Typography>
              <Grid container spacing={2}>
                {serviciosBasicos.map((servicio) => (
                  <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selected.includes(servicio.id)
                          ? 'primary.main'
                          : 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleToggleServicio(servicio.id)}
                    >
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selected.includes(servicio.id)}
                              onChange={() => handleToggleServicio(servicio.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600">
                                {servicio.nombre}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {servicio.descripcion}
                              </Typography>
                              <Typography
                                variant="h6"
                                color="primary.main"
                                fontWeight="700"
                                sx={{ mt: 1 }}
                              >
                                ${servicio.precio}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Servicios Extras */}
          {serviciosExtras.length > 0 && (
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                ✨ Servicios Extras
              </Typography>
              <Grid container spacing={2}>
                {serviciosExtras.map((servicio) => (
                  <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selected.includes(servicio.id)
                          ? 'secondary.main'
                          : 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'secondary.main',
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleToggleServicio(servicio.id)}
                    >
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selected.includes(servicio.id)}
                              onChange={() => handleToggleServicio(servicio.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600">
                                {servicio.nombre}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {servicio.descripcion}
                              </Typography>
                              <Typography
                                variant="h6"
                                color="secondary.main"
                                fontWeight="700"
                                sx={{ mt: 1 }}
                              >
                                ${servicio.precio}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleContinue}
          disabled={selected.length === 0}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
};
