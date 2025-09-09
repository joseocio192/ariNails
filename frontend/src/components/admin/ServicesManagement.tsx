import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estaActivo: boolean;
}

interface ServicioFormData {
  nombre: string;
  descripcion: string;
  precio: string;
}

const ServicesManagement: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [open, setOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [formData, setFormData] = useState<ServicioFormData>({
    nombre: '',
    descripcion: '',
    precio: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/servicios`);
      if (response.data.exito) {
        setServicios(response.data.data);
      }
    } catch (error) {
      mostrarError('Error al cargar servicios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (servicio?: Servicio) => {
    if (servicio) {
      setEditingServicio(servicio);
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: servicio.precio.toString()
      });
    } else {
      setEditingServicio(null);
      setFormData({ nombre: '', descripcion: '', precio: '' });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingServicio(null);
    setFormData({ nombre: '', descripcion: '', precio: '' });
  };

  const handleInputChange = (field: keyof ServicioFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      const servicioData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio)
      };

      if (editingServicio) {
        // Actualizar servicio existente
        await axios.put(`${apiUrl}/servicios/${editingServicio.id}`, servicioData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarExito('Servicio actualizado exitosamente');
      } else {
        // Crear nuevo servicio
        await axios.post(`${apiUrl}/servicios`, servicioData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarExito('Servicio creado exitosamente');
      }

      handleCloseDialog();
      await cargarServicios();
    } catch (error) {
      mostrarError('Error al guardar servicio');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (servicio: Servicio) => {
    if (!confirm(`¿Está seguro de eliminar el servicio "${servicio.nombre}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarError('No autorizado');
        return;
      }

      await axios.delete(`${apiUrl}/servicios/${servicio.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      mostrarExito('Servicio eliminado exitosamente');
      await cargarServicios();
    } catch (error) {
      mostrarError('Error al eliminar servicio');
      console.error('Error:', error);
    }
  };

  const mostrarExito = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const mostrarError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isFormValid = () => {
    return formData.nombre.trim() !== '' && 
           formData.descripcion.trim() !== '' && 
           formData.precio.trim() !== '' && 
           !isNaN(parseFloat(formData.precio)) &&
           parseFloat(formData.precio) > 0;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Servicios
        </Typography>
        <Box>
          <IconButton 
            onClick={cargarServicios} 
            disabled={loading}
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Servicio
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicios.map((servicio) => (
              <TableRow key={servicio.id}>
                <TableCell>{servicio.id}</TableCell>
                <TableCell>{servicio.nombre}</TableCell>
                <TableCell>{servicio.descripcion}</TableCell>
                <TableCell align="right">${servicio.precio.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={servicio.estaActivo ? 'Activo' : 'Inactivo'}
                    color={servicio.estaActivo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(servicio)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(servicio)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {servicios.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay servicios disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar servicio */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Servicio"
            fullWidth
            variant="outlined"
            value={formData.nombre}
            onChange={handleInputChange('nombre')}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.descripcion}
            onChange={handleInputChange('descripcion')}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Precio"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.precio}
            onChange={handleInputChange('precio')}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!isFormValid()}
          >
            {editingServicio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesManagement;