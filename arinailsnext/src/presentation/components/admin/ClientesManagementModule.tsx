'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  EventAvailable as EventIcon,
  EventBusy as CancelIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useGetClientes,
  useToggleClienteStatus,
  useUpdateCliente,
} from '../../hooks/useClientes';
import { EditClienteModal } from './EditClienteModal';
import type { ClienteListItem, UpdateClienteData } from '@/core/domain/types/clientes';
import { CARD_BG } from '../../theme/colors';

/**
 * Módulo de gestión de clientes para el panel de administrador
 * Incluye tabla con paginación, búsqueda y acciones
 */
export const ClientesManagementModule: React.FC = () => {
  // Estados de paginación y búsqueda
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Estados de modales y menús
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteListItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCliente, setMenuCliente] = useState<ClienteListItem | null>(null);

  // Estados de notificaciones
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Hooks de React Query
  const { data: clientesData, isLoading } = useGetClientes({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    sortBy: 'fechaCreacion',
    sortOrder: 'DESC',
  });

  const toggleStatusMutation = useToggleClienteStatus();
  const updateClienteMutation = useUpdateCliente();

  // Debounce de búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset a la primera página al buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const clientes = clientesData?.data || [];
  const total = clientesData?.total || 0;

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    cliente: ClienteListItem
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuCliente(cliente);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuCliente(null);
  };

  const handleEdit = (cliente: ClienteListItem) => {
    setSelectedCliente(cliente);
    setEditModalOpen(true);
    handleCloseMenu();
  };

  const handleToggleStatus = async (cliente: ClienteListItem) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: cliente.id,
        estaActivo: !cliente.estaActivo,
      });
      setSnackbar({
        open: true,
        message: `Cliente ${!cliente.estaActivo ? 'habilitado' : 'deshabilitado'} exitosamente`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al cambiar el estado del cliente',
        severity: 'error',
      });
    }
    handleCloseMenu();
  };

  const handleSaveEdit = async (data: UpdateClienteData) => {
    if (!selectedCliente) return;

    try {
      await updateClienteMutation.mutateAsync({
        id: selectedCliente.id,
        data,
      });
      setSnackbar({
        open: true,
        message: 'Cliente actualizado exitosamente',
        severity: 'success',
      });
      setEditModalOpen(false);
      setSelectedCliente(null);
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar el cliente');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin registro';
    try {
      return format(new Date(dateString), "d 'de' MMM yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 0.5 }}>
          Gestión de Clientes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra las cuentas de los clientes registrados en el sistema
        </Typography>
      </Box>

      {/* Búsqueda */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: CARD_BG,
          border: '1px solid rgba(125, 150, 116, 0.15)',
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Paper>

      {/* Tabla */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          background: CARD_BG,
          border: '1px solid rgba(125, 150, 116, 0.15)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(125, 150, 116, 0.08)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Última Sesión
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Citas
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      {searchTerm
                        ? 'No se encontraron clientes con ese criterio'
                        : 'No hay clientes registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente: ClienteListItem) => (
                  <TableRow
                    key={cliente.id}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                      opacity: cliente.estaActivo ? 1 : 0.6,
                    }}
                  >
                    {/* Nombre */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cliente.nombreCompleto}
                      </Typography>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cliente.email}
                      </Typography>
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell>
                      <Typography variant="body2">{cliente.telefono}</Typography>
                    </TableCell>

                    {/* Última Sesión */}
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(cliente.ultimaSesion)}
                      </Typography>
                    </TableCell>

                    {/* Citas */}
                    <TableCell align="center">
                      <Box
                        sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}
                      >
                        <Tooltip title="Citas completadas">
                          <Chip
                            icon={<EventIcon />}
                            label={cliente.citasCompletadas}
                            size="small"
                            color="success"
                            sx={{ minWidth: 60 }}
                          />
                        </Tooltip>
                        <Tooltip title="Citas canceladas">
                          <Chip
                            icon={<CancelIcon />}
                            label={cliente.citasCanceladas}
                            size="small"
                            color="error"
                            sx={{ minWidth: 60 }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>

                    {/* Estado */}
                    <TableCell align="center">
                      <Chip
                        label={cliente.estaActivo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={cliente.estaActivo ? 'success' : 'default'}
                        sx={{ minWidth: 80 }}
                      />
                    </TableCell>

                    {/* Acciones */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, cliente)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
          sx={{
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        />
      </Paper>

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200 },
        }}
      >
        <MenuItem onClick={() => menuCliente && handleEdit(menuCliente)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar cliente</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => menuCliente && handleToggleStatus(menuCliente)}
        >
          <ListItemIcon>
            {menuCliente?.estaActivo ? (
              <BlockIcon fontSize="small" color="error" />
            ) : (
              <CheckCircleIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {menuCliente?.estaActivo ? 'Deshabilitar' : 'Habilitar'}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Modal de edición */}
      <EditClienteModal
        open={editModalOpen}
        cliente={selectedCliente}
        loading={updateClienteMutation.isPending}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCliente(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
