'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useGetHorariosDisponibles } from '../../hooks/useHorarios';
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface HorarioSelectionStepProps {
  serviciosIds: number[];
  onHorarioSelect: (horario: {
    horarioId: number;
    empleadoNombre: string;
    fecha: string;
    hora: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

type ViewMode = 'semana' | 'mes';

interface HorarioDisponible {
  horarioId: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

/**
 * Paso 2: Selección de horario
 * Muestra horarios disponibles con filtros por semana/mes
 */
export const HorarioSelectionStep: React.FC<HorarioSelectionStepProps> = ({
  serviciosIds,
  onHorarioSelect,
  onNext,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('semana');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHorario, setSelectedHorario] = useState<{
    horarioId: number;
    empleadoNombre: string;
    fecha: string;
    hora: string;
  } | null>(null);

  // Calcular rango de fechas según el modo de vista
  const dateRange = useMemo(() => {
    if (viewMode === 'semana') {
      const start = startOfWeek(currentDate, { locale: es });
      const end = endOfWeek(currentDate, { locale: es });
      return { start, end };
    } else {
      // Para vista de mes, mostramos 4 semanas
      const start = startOfWeek(currentDate, { locale: es });
      const end = addDays(start, 27); // 4 semanas
      return { start, end };
    }
  }, [currentDate, viewMode]);

  // Generar fechas para mostrar
  const displayDates = useMemo(() => {
    const dates: Date[] = [];
    let current = dateRange.start;
    while (current <= dateRange.end) {
      dates.push(current);
      current = addDays(current, 1);
    }
    return dates;
  }, [dateRange]);

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  const { data: horarios, isLoading, error } = useGetHorariosDisponibles(selectedDate);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handlePrevPeriod = () => {
    if (viewMode === 'semana') {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => subWeeks(prev, 4));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'semana') {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, 4));
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setSelectedHorario(null);
  };

  const handleHorarioSelect = (horario: HorarioDisponible) => {
    const selected = {
      horarioId: horario.horarioId,
      empleadoNombre: horario.empleadoNombre,
      fecha: horario.fecha,
      hora: horario.horaInicio,
    };
    setSelectedHorario(selected);
  };

  const handleContinue = () => {
    if (selectedHorario) {
      onHorarioSelect(selectedHorario);
      onNext();
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  const isSelectedDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === selectedDate;
  };

  const horariosDisponibles = horarios?.filter((h: HorarioDisponible) => h.disponible) || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Selecciona un horario disponible
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Elige la fecha y hora que mejor te convenga
      </Typography>

      {/* Controles de vista */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="modo de vista"
          size="small"
        >
          <ToggleButton value="semana" aria-label="vista semanal">
            Semana
          </ToggleButton>
          <ToggleButton value="mes" aria-label="vista mensual">
            Mes
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={handlePrevPeriod}>
            Anterior
          </Button>
          <Button size="small" onClick={handleNextPeriod}>
            Siguiente
          </Button>
        </Box>
      </Box>

      {/* Selector de fechas */}
      <Box sx={{ mb: 4, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1, pb: 2, minWidth: 'max-content' }}>
          {displayDates.map((date) => (
            <Button
              key={format(date, 'yyyy-MM-dd')}
              variant={isSelectedDate(date) ? 'contained' : 'outlined'}
              onClick={() => handleDateSelect(date)}
              sx={{
                minWidth: 80,
                flexDirection: 'column',
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                border: isToday(date) ? '2px solid' : undefined,
                borderColor: isToday(date) ? 'secondary.main' : undefined,
              }}
            >
              <Typography variant="caption" sx={{ mb: 0.5 }}>
                {format(date, 'EEE', { locale: es })}
              </Typography>
              <Typography variant="h6" fontWeight="700">
                {format(date, 'd')}
              </Typography>
              <Typography variant="caption">
                {format(date, 'MMM', { locale: es })}
              </Typography>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Lista de horarios disponibles */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
          Horarios disponibles para {format(parseISO(selectedDate), "d 'de' MMMM", { locale: es })}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Error al cargar los horarios. Por favor, intenta nuevamente.
          </Alert>
        ) : horariosDisponibles.length === 0 ? (
          <Alert severity="info">
            No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {horariosDisponibles.map((horario: HorarioDisponible) => (
              <Grid item xs={12} sm={6} md={4} key={horario.horarioId}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor:
                      selectedHorario?.horarioId === horario.horarioId
                        ? 'primary.main'
                        : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleHorarioSelect(horario)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40,
                          mr: 1.5,
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        {horario.empleadoNombre}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TimeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {horario.horaInicio} - {horario.horaFin}
                      </Typography>
                    </Box>

                    <Chip
                      label="Disponible"
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Botones de navegación */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Atrás
        </Button>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleContinue}
          disabled={!selectedHorario}
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
