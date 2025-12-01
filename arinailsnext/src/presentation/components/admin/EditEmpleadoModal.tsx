"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
} from '@mui/material';
import { EmpleadoListItem, UpdateEmpleadoData } from '@/core/domain/types/empleados';

interface EditEmpleadoModalProps {
  open: boolean;
  empleado: EmpleadoListItem | null;
  loading: boolean;
  onClose: () => void;
  onSave: (data: UpdateEmpleadoData) => void;
}

export const EditEmpleadoModal: React.FC<EditEmpleadoModalProps> = ({
  open,
  empleado,
  loading,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateEmpleadoData>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (empleado) {
      const [nombres, apellidoPaterno, ...resto] = empleado.nombreCompleto.split(' ');
      const apellidoMaterno = resto.join(' ');

      setFormData({
        nombres: nombres || '',
        apellidoPaterno: apellidoPaterno || '',
        apellidoMaterno: apellidoMaterno || '',
        email: empleado.email,
        telefono: empleado.telefono,
        direccion: empleado.direccion,
      });
    }
  }, [empleado]);

  const validateForm = (): boolean => {
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

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof UpdateEmpleadoData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Empleado</DialogTitle>
      <DialogContent>
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Por favor corrige los errores en el formulario
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombres"
              value={formData.nombres || ''}
              onChange={handleChange('nombres')}
              error={!!errors.nombres}
              helperText={errors.nombres}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido Paterno"
              value={formData.apellidoPaterno || ''}
              onChange={handleChange('apellidoPaterno')}
              error={!!errors.apellidoPaterno}
              helperText={errors.apellidoPaterno}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido Materno"
              value={formData.apellidoMaterno || ''}
              onChange={handleChange('apellidoMaterno')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono || ''}
              onChange={handleChange('telefono')}
              error={!!errors.telefono}
              helperText={errors.telefono}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion || ''}
              onChange={handleChange('direccion')}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
