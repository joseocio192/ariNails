import React from 'react';
import { Button, Box } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

type Props = {
  activeStep: number;
  steps: number;
  onNext: () => void;
  onBack: () => void;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
};

const StepperButtons: React.FC<Props> = ({ activeStep, steps, onNext, onBack, size = 'medium', fullWidth = false }) => {
  const gradientBtnSx = {
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    color: 'white',
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    py: 1.25,
    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.18)',
    transition: 'opacity 180ms ease, transform 160ms ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.22)',
      transform: 'translateY(-1px)'
    }
  } as const;

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <Button
        size={size}
        onClick={onBack}
        sx={{ ...gradientBtnSx, minWidth: 125, opacity: activeStep > 0 ? 1 : 0, visibility: activeStep > 0 ? 'visible' : 'hidden' }}
        disabled={activeStep === 0}
        aria-hidden={activeStep === 0}
      >
        <KeyboardArrowLeft sx={{ mr: 0.3 }} />
        {activeStep === 0 ? 'Cancelar' : 'Atrás'}
      </Button>

      <Button
        size={size}
        onClick={onNext}
        sx={{ ...gradientBtnSx, minWidth: 125 }}
        fullWidth={fullWidth}
      >
        {activeStep === steps - 1 ? 'Finalizar' : 'Siguiente'}
        {activeStep !== steps - 1 && <KeyboardArrowRight sx={{ ml: 0.3 }} />}
      </Button>
    </Box>
  );
};

export default StepperButtons;
