"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useGetDisenos,
  useCreateDiseno,
  useUpdateDiseno,
  useDeleteDiseno,
} from '@/presentation/hooks/useDisenos';
import type { DisenoUna, CreateDisenoData, UpdateDisenoData } from '@/core/domain/types/disenos';
import { AddDisenoModal } from './AddDisenoModal';
import { EditDisenoModal } from './EditDisenoModal';

export function DisenosManagementModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedDiseno, setSelectedDiseno] = useState<DisenoUna | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Query para obtener diseños
  const { data: disenosData, isLoading } = useGetDisenos({
    page: 1,
    limit: 100,
    search: searchTerm,
    sortBy: 'fechaCreacion',
    sortOrder: 'DESC',
  });

  const createMutation = useCreateDiseno();
  const updateMutation = useUpdateDiseno();
  const deleteMutation = useDeleteDiseno();

  const disenos = disenosData?.data || [];

  const handleCreateDiseno = async (data: CreateDisenoData) => {
    try {
      await createMutation.mutateAsync(data);
      setSnackbar({
        open: true,
        message: 'Diseño creado exitosamente',
        severity: 'success',
      });
      setAddModalOpen(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Error al crear diseño',
        severity: 'error',
      });
      throw error;
    }
  };

  const handleUpdateDiseno = async (data: UpdateDisenoData) => {
    if (!selectedDiseno) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedDiseno.id,
        data,
      });
      setSnackbar({
        open: true,
        message: 'Diseño actualizado exitosamente',
        severity: 'success',
      });
      setEditModalOpen(false);
      setSelectedDiseno(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Error al actualizar diseño',
        severity: 'error',
      });
      throw error;
    }
  };

  const handleDeleteClick = (diseno: DisenoUna) => {
    setSelectedDiseno(diseno);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDiseno) return;

    try {
      await deleteMutation.mutateAsync(selectedDiseno.id);
      setSnackbar({
        open: true,
        message: 'Diseño eliminado exitosamente',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Error al eliminar diseño',
        severity: 'error',
      });
    } finally {
      setConfirmDeleteOpen(false);
      setSelectedDiseno(null);
    }
  };

  const handleEditClick = (diseno: DisenoUna) => {
    setSelectedDiseno(diseno);
    setEditModalOpen(true);
  };

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Gestión de Diseños
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          Agregar Diseño
        </Button>
      </Box>

      {/* Barra de búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por título o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Grid de diseños */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : disenos.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No se encontraron diseños' : 'No hay diseños registrados'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando un nuevo diseño'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {disenos.map((diseno) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={diseno.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`${process.env.NEXT_PUBLIC_API_URL}${diseno.imagenUrl}`}
                  alt={diseno.titulo}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {diseno.titulo}
                  </Typography>
                  {diseno.descripcion && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                      }}
                    >
                      {diseno.descripcion}
                    </Typography>
                  )}
                  <Chip
                    label={diseno.nombreEmpleado}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    {formatDate(diseno.fechaCreacion)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditClick(diseno)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(diseno)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal para agregar diseño */}
      <AddDisenoModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleCreateDiseno}
        loading={createMutation.isPending}
      />

      {/* Modal para editar diseño */}
      <EditDisenoModal
        open={editModalOpen}
        diseno={selectedDiseno}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedDiseno(null);
        }}
        onSave={handleUpdateDiseno}
        loading={updateMutation.isPending}
      />

      {/* Modal de confirmación para eliminar */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar el diseño <strong>{selectedDiseno?.titulo}</strong>?
            <br />
            <br />
            Esta acción desactivará el diseño y ya no estará disponible para los clientes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
