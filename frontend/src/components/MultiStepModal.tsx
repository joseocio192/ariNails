import React, { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Paper,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import StepperButtons from './StepperButtons';

type MultiStepModalProps = {
  open?: boolean;
  onClose?: () => void;
  steps: number;
  title?: string;
  initialStep?: number;
  renderStep?: (stepIndex: number, goTo: (i: number) => void) => ReactNode;
  onFinish?: () => void;
  variant?: 'modal' | 'card';
  // stepper visual indicators removed; only buttons are shown
};

const MultiStepModal: React.FC<MultiStepModalProps> = ({
  open,
  onClose,
  steps,
  title,
  initialStep = 0,
  renderStep,
  onFinish,
  variant = 'modal',
  
}) => {
  const [activeStep, setActiveStep] = useState(initialStep);

  const handleNext = () => {
    if (activeStep < steps - 1) setActiveStep((s) => s + 1);
    else if (onFinish) onFinish();
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((s) => s - 1);
    else onClose?.();
  };

  const goTo = (i: number) => setActiveStep(Math.max(0, Math.min(steps - 1, i)));
  // no stepper visuals required — we render only Back/Next buttons (styled in StepperButtons)
  if (variant === 'card') {
    return (
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box component="h3" sx={{ m: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</Box>
        </Box>

        <Box sx={{ minHeight: 160 }}>{renderStep ? renderStep(activeStep, goTo) : null}</Box>

        <Box sx={{ mt: 3 }}>
          <StepperButtons activeStep={activeStep} steps={steps} onNext={handleNext} onBack={handleBack} />
        </Box>
      </Paper>
    );
  }

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ minHeight: 140 }}>{renderStep ? renderStep(activeStep, goTo) : null}</Box>
      </DialogContent>

    <DialogActions sx={{ flexDirection: 'column', alignItems: 'center', gap: 2, p: 2 }}>
      <Box sx={{ width: '100%', pb: 1 }}>
        <StepperButtons activeStep={activeStep} steps={steps} onNext={handleNext} onBack={handleBack} size="large" fullWidth />
      </Box>
    </DialogActions>
    </Dialog>
  );
};

export default MultiStepModal;
