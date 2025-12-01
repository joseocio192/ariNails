'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { ClienteListItem, UpdateClienteData } from '@/core/domain/types/clientes';

interface EditClienteModalProps {
  open: boolean;
  cliente: ClienteListItem | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (data: UpdateClienteData) => Promise<void>;
}

/**
 * Modal para editar datos del cliente
 * Permite modificar: nombres, apellidos, email, teléfono, dirección
 */
export const EditClienteModal: React.FC<EditClienteModalProps> = ({
  open,
  cliente,
  loading = false,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateClienteData>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string>('');

  // Cargar datos del cliente cuando se abre el modal
  useEffect(() => {
    if (cliente && open) {
      const [nombres = '', apellidoPaterno = '', apellidoMaterno = ''] =
        cliente.nombreCompleto.split(' ');
      
      setFormData({
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion || '',
      });
      setErrors({});
      setSaveError('');
    }
  }, [cliente, open]);

  const handleChange = (field: keyof UpdateClienteData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setSaveError('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres?.trim()) {
      newErrors.nombres = 'El nombre es requerido';
    }

    if (!formData.apellidoPaterno?.trim()) {
      newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setSaveError(error.message || 'Error al guardar los cambios');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Editar Cliente
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Actualiza la información del cliente
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {saveError}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Nombres */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombres"
              value={formData.nombres}
              onChange={handleChange('nombres')}
              error={!!errors.nombres}
              helperText={errors.nombres}
              disabled={loading}
              required
            />
          </Grid>

          {/* Apellidos */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido Paterno"
              value={formData.apellidoPaterno}
              onChange={handleChange('apellidoPaterno')}
              error={!!errors.apellidoPaterno}
              helperText={errors.apellidoPaterno}
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido Materno"
              value={formData.apellidoMaterno}
              onChange={handleChange('apellidoMaterno')}
              disabled={loading}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              required
            />
          </Grid>

          {/* Teléfono */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={handleChange('telefono')}
              error={!!errors.telefono}
              helperText={errors.telefono}
              disabled={loading}
              required
            />
          </Grid>

          {/* Dirección */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion}
              onChange={handleChange('direccion')}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
            },
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
