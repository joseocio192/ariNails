'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Logout as LogoutIcon, Close as CloseIcon } from '@mui/icons-material';
import { ACCENT_GRADIENT, ACCENT_SOLID } from '../../theme/colors';

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modal de confirmación para cerrar sesión
 * Muestra un diálogo centrado con opciones de confirmar o cancelar
 */
export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      {/* Botón de cerrar */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'grey.500',
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Título con ícono */}
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogoutIcon sx={{ fontSize: 32, color: '#ef4444' }} />
          </Box>
        </Box>
        <Typography variant="h5" fontWeight="bold">
          ¿Cerrar Sesión?
        </Typography>
      </DialogTitle>

      {/* Contenido */}
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          ¿Estás seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder nuevamente.
        </Typography>
      </DialogContent>

      {/* Botones de acción */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'grey.300',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'grey.400',
              backgroundColor: 'grey.50',
            },
          }}
        >
          No, Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="large"
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            },
          }}
        >
          Sí, Cerrar Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
};