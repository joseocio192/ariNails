"use client";

import React, { useState, useEffect } from 'react';
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
import type { DisenoUna, UpdateDisenoData } from '@/core/domain/types/disenos';

interface EditDisenoModalProps {
  open: boolean;
  diseno: DisenoUna | null;
  onClose: () => void;
  onSave: (data: UpdateDisenoData) => Promise<void>;
  loading: boolean;
}

export function EditDisenoModal({
  open,
  diseno,
  onClose,
  onSave,
  loading,
}: EditDisenoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (diseno) {
      setTitulo(diseno.titulo);
      setDescripcion(diseno.descripcion || '');
      setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}${diseno.imagenUrl}`);
    }
  }, [diseno]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, imagen: 'Solo se permiten imágenes' });
        return;
      }

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
    const newErrors: { [key: string]: string } = {};
    if (!titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const updateData: UpdateDisenoData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
      };

      if (imagen) {
        updateData.imagen = imagen;
      }

      await onSave(updateData);
      handleClose();
    } catch (error) {
      console.error('Error al actualizar diseño:', error);
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
      <DialogTitle>Editar Diseño</DialogTitle>
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
              Cambiar Imagen
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
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
