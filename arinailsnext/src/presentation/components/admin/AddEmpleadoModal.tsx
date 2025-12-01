"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import {
  useGetAvailableUsers,
  usePromoteToEmpleado,
} from '@/presentation/hooks/useEmpleados';
import type { AvailableUser } from '@/core/domain/types/empleados';

interface AddEmpleadoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmpleadoModal({
  open,
  onClose,
  onSuccess,
}: AddEmpleadoModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: availableUsers, isLoading } = useGetAvailableUsers({
    search: searchTerm,
  });

  const promoteToEmpleado = usePromoteToEmpleado();

  const handleUserSelect = async (user: AvailableUser) => {
    try {
      await promoteToEmpleado.mutateAsync({
        usuarioId: user.id,
        data: {},
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error promoviendo usuario:', error);
      alert(error?.response?.data?.message || 'Error al promover usuario a empleado');
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon />
        Agregar Empleado
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecciona un cliente para convertirlo en empleado. Solo se actualizará su rol.
        </Typography>

        <TextField
          fullWidth
          placeholder="Buscar por nombre, apellido o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : availableUsers && availableUsers.data.length > 0 ? (
          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {availableUsers.data.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleUserSelect(user)}
                    disabled={promoteToEmpleado.isPending}
                  >
                    <ListItemText
                      primary={user.nombreCompleto}
                      secondary={
                        <>
                          {user.email}
                          {user.telefono && ` • ${user.telefono}`}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            {searchTerm
              ? 'No se encontraron usuarios con ese criterio'
              : 'No hay usuarios disponibles para convertir en empleados'}
          </Alert>
        )}

        {promoteToEmpleado.isPending && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Convirtiendo a empleado...</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={promoteToEmpleado.isPending}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
