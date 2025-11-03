'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import {
  Email,
  Phone,
  Home,
  Edit,
  Save,
  Cancel,
  Badge,
  AdminPanelSettings,
  WorkOutline,
  Person,
} from '@mui/icons-material';
import { useAuth, useUpdateProfile } from '../../hooks/useSimpleAuth';
import { ACCENT_SOLID, CARD_BG } from '../../theme/colors';

/**
 * Componente de perfil inline para mostrar en el dashboard
 */
export const DashboardProfileView: React.FC = () => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
    direccion: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    telefono: '',
    direccion: '',
  });

  // Sincronizar formData con user cuando cambie
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  const isAdmin = user.rol?.nombre?.toLowerCase() === 'admin';
  const isEmployee = user.rol?.nombre?.toLowerCase() === 'empleado';
  const roleColor = isAdmin ? '#dc2626' : isEmployee ? '#2563eb' : ACCENT_SOLID;
  const RoleIcon = isAdmin ? AdminPanelSettings : isEmployee ? WorkOutline : Person;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email inválido';
        }
        return '';
      case 'telefono':
        if (!value) return 'El teléfono es requerido';
        if (!/^\d{10}$/.test(value)) {
          return 'El teléfono debe tener 10 dígitos';
        }
        return '';
      case 'direccion':
        if (!value) return 'La dirección es requerida';
        if (value.length < 10) {
          return 'La dirección debe tener al menos 10 caracteres';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Limpiar mensajes
    if (errorMessage) setErrorMessage('');
  };

  const handleSave = async () => {
    // Validar todos los campos
    const newErrors = {
      email: validateField('email', formData.email),
      telefono: validateField('telefono', formData.telefono),
      direccion: validateField('direccion', formData.direccion),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setErrorMessage('Por favor corrige los errores antes de guardar');
      return;
    }

    // Preparar datos a enviar (solo los que cambiaron)
    const changes: Record<string, string> = {};
    if (formData.email !== user.email) changes.email = formData.email;
    if (formData.telefono !== user.telefono) changes.telefono = formData.telefono;
    if (formData.direccion !== user.direccion) changes.direccion = formData.direccion;

    if (Object.keys(changes).length === 0) {
      setErrorMessage('No hay cambios para guardar');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(changes);
      setSuccessMessage('Perfil actualizado correctamente');
      setEditMode(false);
      setErrorMessage('');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      
      // Manejar errores específicos
      if (error.message?.includes('Email ya está en uso')) {
        setErrors(prev => ({ ...prev, email: 'Este email ya está en uso' }));
        setErrorMessage('El email ya está en uso por otro usuario');
      } else if (error.message?.includes('Teléfono ya está en uso')) {
        setErrors(prev => ({ ...prev, telefono: 'Este teléfono ya está en uso' }));
        setErrorMessage('El teléfono ya está en uso por otro usuario');
      } else {
        setErrorMessage(error.message || 'Error al actualizar el perfil');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user.email || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
    });
    setErrors({ email: '', telefono: '', direccion: '' });
    setErrorMessage('');
    setEditMode(false);
  };

  const userName = `${user.nombres} ${user.apellidoPaterno} ${user.apellidoMaterno}`.trim();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: roleColor, mb: 1 }}>
          Mi Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona tu información personal
        </Typography>
      </Box>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tarjeta de información del usuario */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: CARD_BG,
              border: `1px solid ${roleColor}20`,
              textAlign: 'center',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: roleColor,
                  fontSize: '2.5rem',
                }}
              >
                {user.nombres.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {userName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user.usuario}
                </Typography>
              </Box>
              <Chip
                icon={<RoleIcon />}
                label={user.rol?.nombre || 'Usuario'}
                sx={{
                  bgcolor: `${roleColor}15`,
                  color: roleColor,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Tarjeta de información de contacto */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: CARD_BG,
              border: '1px solid rgba(125, 150, 116, 0.15)',
            }}
          >
            <Stack spacing={3}>
              {/* Header con botón de editar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Información de Contacto
                </Typography>
                {!editMode && (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    sx={{
                      color: roleColor,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Editar
                  </Button>
                )}
              </Box>

              <Divider />

              {/* Campos de información */}
              <Grid container spacing={3}>
                {/* Nombre completo (no editable) */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Badge sx={{ color: 'text.secondary' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                        Nombre Completo
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {userName}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  ) : (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Email sx={{ color: 'text.secondary' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Grid>

                {/* Teléfono */}
                <Grid item xs={12}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      error={!!errors.telefono}
                      helperText={errors.telefono}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  ) : (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Phone sx={{ color: 'text.secondary' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          Teléfono
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.telefono || 'No especificado'}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Grid>

                {/* Dirección */}
                <Grid item xs={12}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      label="Dirección"
                      name="direccion"
                      multiline
                      rows={2}
                      value={formData.direccion}
                      onChange={handleChange}
                      error={!!errors.direccion}
                      helperText={errors.direccion}
                      InputProps={{
                        startAdornment: <Home sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                    />
                  ) : (
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Home sx={{ color: 'text.secondary', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          Dirección
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.direccion || 'No especificada'}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Grid>
              </Grid>

              {/* Botones de acción en modo edición */}
              {editMode && (
                <>
                  <Divider />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      sx={{
                        textTransform: 'none',
                        borderColor: 'text.secondary',
                        color: 'text.secondary',
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      sx={{
                        textTransform: 'none',
                        bgcolor: roleColor,
                        '&:hover': {
                          bgcolor: roleColor,
                          opacity: 0.9,
                        },
                      }}
                    >
                      {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
