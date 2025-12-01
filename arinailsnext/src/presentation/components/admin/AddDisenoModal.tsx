"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import type { CreateDisenoData } from '@/core/domain/types/disenos';

interface AddDisenoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateDisenoData) => Promise<void>;
  loading: boolean;
}

export function AddDisenoModal({
  open,
  onClose,
  onSave,
  loading,
}: AddDisenoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, imagen: 'Solo se permiten imágenes' });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, imagen: 'La imagen no debe superar 5MB' });
        return;
      }

      setImagen(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors({ ...errors, imagen: '' });
    }
  };

  const handleSubmit = async () => {
    // Validar campos
    const newErrors: { [key: string]: string } = {};
    if (!titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    if (!imagen) {
      newErrors.imagen = 'La imagen es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        imagen: imagen!,
      });

      handleClose();
    } catch (error) {
      console.error('Error al crear diseño:', error);
    }
  };

  const handleClose = () => {
    setTitulo('');
    setDescripcion('');
    setImagen(null);
    setPreviewUrl('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Nuevo Diseño</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            error={!!errors.titulo}
            helperText={errors.titulo}
            fullWidth
            required
          />

          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Seleccionar Imagen
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {errors.imagen && (
              <Typography color="error" variant="caption">
                {errors.imagen}
              </Typography>
            )}
          </Box>

          {previewUrl && (
            <Box
              sx={{
                width: '100%',
                height: 200,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
