"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetEmpleados, useToggleEmpleadoStatus, useUpdateEmpleado, useDemoteToCliente } from '@/presentation/hooks/useEmpleados';
import { EmpleadoListItem, UpdateEmpleadoData } from '@/core/domain/types/empleados';
import { EditEmpleadoModal } from './EditEmpleadoModal';
import AddEmpleadoModal from './AddEmpleadoModal';

export const EmpleadosManagementModule: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoListItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmDemoteOpen, setConfirmDemoteOpen] = useState(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Query para obtener empleados
  const { data: empleadosData, isLoading } = useGetEmpleados({
    page: page + 1,
    limit: rowsPerPage,
    search: searchTerm,
    sortBy: 'fechaCreacion',
    sortOrder: 'DESC',
  });

  const toggleStatusMutation = useToggleEmpleadoStatus();
  const updateEmpleadoMutation = useUpdateEmpleado();
  const demoteToClienteMutation = useDemoteToCliente();

  const empleados = empleadosData?.data || [];
  const totalEmpleados = empleadosData?.total || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, empleado: EmpleadoListItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmpleado(empleado);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedEmpleado) {
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    setConfirmToggleOpen(true);
    handleMenuClose();
  };

  const confirmToggleStatus = async () => {
    if (!selectedEmpleado) return;

    try {
      await toggleStatusMutation.mutateAsync({
        id: selectedEmpleado.id,
        data: { estaActivo: !selectedEmpleado.estaActivo },
      });

      setSnackbar({
        open: true,
        message: `Empleado ${selectedEmpleado.estaActivo ? 'deshabilitado' : 'habilitado'} exitosamente`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al cambiar el estado del empleado',
        severity: 'error',
      });
    } finally {
      setConfirmToggleOpen(false);
      setSelectedEmpleado(null);
    }
  };

  const handleSaveEdit = async (data: UpdateEmpleadoData) => {
    if (!selectedEmpleado) return;

    try {
      await updateEmpleadoMutation.mutateAsync({
        id: selectedEmpleado.id,
        data,
      });

      setSnackbar({
        open: true,
        message: 'Empleado actualizado exitosamente',
        severity: 'success',
      });
      setEditModalOpen(false);
      setSelectedEmpleado(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el empleado',
        severity: 'error',
      });
    }
  };

  const handleDemoteToCliente = () => {
    setConfirmDemoteOpen(true);
    handleMenuClose();
  };

  const confirmDemoteToCliente = async () => {
    if (!selectedEmpleado) return;

    try {
      await demoteToClienteMutation.mutateAsync(selectedEmpleado.id);

      setSnackbar({
        open: true,
        message: 'Empleado convertido a cliente exitosamente',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Error al convertir empleado a cliente',
        severity: 'error',
      });
    } finally {
      setConfirmDemoteOpen(false);
      setSelectedEmpleado(null);
    }
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    setSnackbar({
      open: true,
      message: 'Empleado agregado exitosamente',
      severity: 'success',
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Gestión de Empleados
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddModalOpen(true)}
        >
          Agregar Empleado
        </Button>
      </Box>

      {/* Barra de búsqueda */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, email o teléfono..."
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

      {/* Tabla de empleados */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Última Sesión</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Citas</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : empleados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              empleados.map((empleado: EmpleadoListItem) => (
                <TableRow key={empleado.id} hover>
                  <TableCell>{empleado.nombreCompleto}</TableCell>
                  <TableCell>{empleado.email}</TableCell>
                  <TableCell>{empleado.telefono}</TableCell>
                  <TableCell>{formatDate(empleado.ultimaSesion)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${empleado.citasCompletadas} completadas`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${empleado.citasCanceladas} canceladas`}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={empleado.estaActivo ? <CheckCircleIcon /> : <CancelIcon />}
                      label={empleado.estaActivo ? 'Activo' : 'Inactivo'}
                      color={empleado.estaActivo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, empleado)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalEmpleados}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {/* Menú de acciones */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {selectedEmpleado?.estaActivo ? 'Deshabilitar' : 'Habilitar'}
        </MenuItem>
        <MenuItem onClick={handleDemoteToCliente} sx={{ color: 'warning.main' }}>
          <PersonOffIcon sx={{ mr: 1, fontSize: 20 }} />
          Convertir a Cliente
        </MenuItem>
      </Menu>

      {/* Modal de edición */}
      <EditEmpleadoModal
        open={editModalOpen}
        empleado={selectedEmpleado}
        loading={updateEmpleadoMutation.isPending}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEmpleado(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Modal para agregar empleado */}
      <AddEmpleadoModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal de confirmación para cambiar estado */}
      <Dialog
        open={confirmToggleOpen}
        onClose={() => setConfirmToggleOpen(false)}
      >
        <DialogTitle>Confirmar cambio de estado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de {selectedEmpleado?.estaActivo ? 'deshabilitar' : 'habilitar'} a{' '}
            <strong>{selectedEmpleado?.nombreCompleto}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmToggleOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={confirmToggleStatus} 
            variant="contained" 
            color={selectedEmpleado?.estaActivo ? 'error' : 'success'}
            disabled={toggleStatusMutation.isPending}
          >
            {toggleStatusMutation.isPending ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para degradar a cliente */}
      <Dialog
        open={confirmDemoteOpen}
        onClose={() => setConfirmDemoteOpen(false)}
      >
        <DialogTitle>Confirmar conversión a cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de convertir a <strong>{selectedEmpleado?.nombreCompleto}</strong> de empleado a cliente?
            <br />
            <br />
            Esta acción cambiará el rol del usuario y ya no aparecerá en la lista de empleados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDemoteOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={confirmDemoteToCliente} 
            variant="contained" 
            color="warning"
            disabled={demoteToClienteMutation.isPending}
          >
            {demoteToClienteMutation.isPending ? 'Procesando...' : 'Convertir a Cliente'}
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
};
