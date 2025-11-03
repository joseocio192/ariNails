'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@mui/material';
import { ServiciosSelectionStep } from './ServiciosSelectionStep';
import { HorarioSelectionStep } from './HorarioSelectionStep';
import { CheckoutStep } from './CheckoutStep';
import { useToast } from '../../hooks/useToast';

const steps = ['Seleccionar Servicios', 'Elegir Horario', 'Confirmar y Pagar'];

export interface CitaFormData {
  serviciosIds: number[];
  horarioId: number;
  empleadoNombre?: string;
  fecha?: string;
  hora?: string;
}

/**
 * Módulo de Agendar Cita para clientes
 * Flujo en 3 pasos: Servicios -> Horario -> Checkout
 */
export const AgendarCitaModule: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [citaData, setCitaData] = useState<CitaFormData>({
    serviciosIds: [],
    horarioId: 0,
  });
  const { showToast } = useToast();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleServiciosChange = (serviciosIds: number[]) => {
    setCitaData((prev) => ({ ...prev, serviciosIds }));
  };

  const handleHorarioChange = (horario: {
    horarioId: number;
    empleadoNombre: string;
    fecha: string;
    hora: string;
  }) => {
    setCitaData((prev) => ({
      ...prev,
      horarioId: horario.horarioId,
      empleadoNombre: horario.empleadoNombre,
      fecha: horario.fecha,
      hora: horario.hora,
    }));
  };

  const handleReset = () => {
    setActiveStep(0);
    setCitaData({
      serviciosIds: [],
      horarioId: 0,
    });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ServiciosSelectionStep
            selectedServicios={citaData.serviciosIds}
            onServiciosChange={handleServiciosChange}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <HorarioSelectionStep
            serviciosIds={citaData.serviciosIds}
            onHorarioSelect={handleHorarioChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <CheckoutStep
            citaData={citaData}
            onBack={handleBack}
            onComplete={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="700" gutterBottom>
        Agendar Cita
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Selecciona tus servicios y elige el horario que mejor te convenga
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        {/* Stepper de progreso */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Contenido del paso actual */}
        <Box sx={{ mt: 3 }}>{getStepContent(activeStep)}</Box>
      </Paper>
    </Box>
  );
};
