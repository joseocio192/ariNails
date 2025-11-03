'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Stack,
    IconButton,
    AppBar,
    Toolbar,
    useTheme,
    useMediaQuery,
    Button,
    Tooltip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../../hooks/useUserRole';
import { useGetTodasLasCitas, useGetCitasEmpleado, useCancelarCita } from '../../hooks/useCitas';
import { StaffOnly } from '../auth/RoleBasedContent';
import { CARD_BG } from '../../theme/colors';
import { View } from 'react-big-calendar';
import { startOfMonth, endOfMonth, addDays, subDays, startOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../app/calendar.css';

import { CalendarComponent } from '../calendar/CalendarComponent';
import { CitasList } from '../citas/CitasList';
import { CancelDialog } from '../citas/CancelDialog';
import { FiltersComponent } from '../filters/FiltersComponent';
import { DashboardSidebar } from '../layout/DashboardSidebar';
import { DashboardProfileView } from '../profile/DashboardProfileView';
import { HorariosManagement } from '../horarios/HorariosManagement';

import type { Cita, CalendarEvent } from '../../../core/domain/types/citas';

/**
 * Dashboard Page para Admin y Empleados
 * Muestra calendario y citas del rango seleccionado
 */

export const DashboardPage: React.FC = () => {
    const router = useRouter();
    const { isAdmin, isEmployee, isClient, isAuthenticated, empleadoId, user } = useUserRole();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Estados del sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedModule, setSelectedModule] = useState('dashboard');

    // Estados del calendario y dialogs
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [calendarView, setCalendarView] = useState<View>('month');
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
    
    const [filters, setFilters] = useState({
        servicios: [],
        cliente: '',
        tipo: '',
        estado: ''
    });

    const cancelarCitaMutation = useCancelarCita();

    const dateRange = useMemo(() => {
        let start: Date;
        let end: Date;

        if (calendarView === 'month') {
            start = startOfMonth(calendarDate);
            end = endOfMonth(calendarDate);
            start = subDays(start, start.getDay());
            end = addDays(end, 6 - end.getDay());
        } else if (calendarView === 'week') {
            start = startOfWeek(calendarDate, { locale: es });
            end = addDays(start, 6);
        } else {
            start = new Date(calendarDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(calendarDate);
            end.setHours(23, 59, 59, 999);
        }

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }, [calendarDate, calendarView]);

    const selectedDateFormatted = useMemo(() => {
        return selectedDate.toISOString().split('T')[0];
    }, [selectedDate]);

    const { data: citasRangoAdmin, isLoading: loadingRangoAdmin } = useGetTodasLasCitas(
        undefined,
        dateRange.start,
        dateRange.end
    );

    const { data: citasRangoEmpleado, isLoading: loadingRangoEmpleado } = useGetCitasEmpleado(
        empleadoId || undefined,
        undefined,
        dateRange.start,
        dateRange.end
    );

    const { data: citasDiaAdmin, isLoading: loadingDiaAdmin } = useGetTodasLasCitas(
        selectedDateFormatted,
        undefined,
        undefined
    );

    const { data: citasDiaEmpleado, isLoading: loadingDiaEmpleado } = useGetCitasEmpleado(
        empleadoId || undefined,
        selectedDateFormatted, 
        undefined,
        undefined
    );

    const citasCalendario = useMemo(() => {
        if (isAdmin) return citasRangoAdmin || [];
        if (isEmployee) return citasRangoEmpleado || [];
        return [];
    }, [isAdmin, isEmployee, citasRangoAdmin, citasRangoEmpleado]);

    const citasLista = useMemo(() => {
        if (isAdmin) return citasDiaAdmin || [];
        if (isEmployee) return citasDiaEmpleado || [];
        return [];
    }, [isAdmin, isEmployee, citasDiaAdmin, citasDiaEmpleado]);

    const loading = loadingRangoAdmin || loadingRangoEmpleado || loadingDiaAdmin || loadingDiaEmpleado;

    const rangeDescription = useMemo(() => {
        return format(selectedDate, "d 'de' MMMM yyyy", { locale: es });
    }, [selectedDate]);

    const events = useMemo(() => {
        return citasCalendario.map((cita: Cita): CalendarEvent => {
            const [hours, minutes] = cita.hora.split(':');
            const start = new Date(cita.fecha);
            start.setHours(parseInt(hours), parseInt(minutes));

            const end = new Date(start);
            end.setMinutes(start.getMinutes() + (cita.duracion || 60));

            const clienteName = `${cita.cliente.nombres} ${cita.cliente.apellidos}`;
            const servicios = cita.servicios.map(s =>
                typeof s === 'string' ? s : s.nombre
            ).join(', ');

            return {
                id: cita.id,
                title: `${clienteName} - ${servicios}`,
                start,
                end,
                resource: cita,
            };
        });
    }, [citasCalendario]);

    // Redirigir clientes a su dashboard específico
    React.useEffect(() => {
        if (isAuthenticated && !isAdmin && !isEmployee) {
            if (isClient) {
                router.push('/dashboard/client');
            } else {
                router.push('/dashboard/client');
            }
        }
    }, [isAuthenticated, isAdmin, isEmployee, isClient, router]);

    const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
        setSelectedDate(start);
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedDate(event.start);
    }, []);

    const handleNavigate = useCallback((newDate: Date) => {
        console.log('Navegando a:', newDate);
        setCalendarDate(newDate);
    }, []);

    // Handlers de cancelación
    const handleCancelarCita = async (motivo: string, realizarReembolso: boolean, nuevaFecha?: string, nuevaHora?: string) => {
        if (!selectedCita) return;

        try {
            // Si no hay reembolso, debe haber fecha y hora para reagendar
            if (!realizarReembolso && (!nuevaFecha || !nuevaHora)) {
                console.error('Reagendado requiere fecha y hora');
                return;
            }

            await cancelarCitaMutation.mutateAsync({
                citaId: selectedCita.id,
                motivo: motivo || 'Cancelada por el administrador',
                realizarReembolso,
                nuevaFecha,
                nuevaHora
            });
            setCancelDialogOpen(false);
            setSelectedCita(null);
        } catch (error) {
            console.error('Error al cancelar cita:', error);
        }
    };

    const handleOpenCancelDialog = (cita: Cita) => {
        setSelectedCita(cita);
        setCancelDialogOpen(true);
    };

    const handleCloseCancelDialog = () => {
        setCancelDialogOpen(false);
        setSelectedCita(null);
    };

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleCollapseSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleModuleChange = (moduleId: string) => {
        setSelectedModule(moduleId);
        // Aquí puedes agregar lógica para cambiar de vista según el módulo
        console.log('Módulo seleccionado:', moduleId);
    };

    if (!isAuthenticated || (!isAdmin && !isEmployee)) {
        return null;
    }

    const userName = user 
        ? `${user.nombres} ${user.apellidoPaterno} ${user.apellidoMaterno}`.trim()
        : 'Usuario';
    const userEmail = user?.email || '';

    return (
        <StaffOnly>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <DashboardSidebar
                    isAdmin={isAdmin}
                    userName={userName}
                    userEmail={userEmail}
                    open={sidebarOpen}
                    collapsed={sidebarCollapsed}
                    onToggle={handleToggleSidebar}
                    onCollapse={handleCollapseSidebar}
                    onModuleChange={handleModuleChange}
                    selectedModule={selectedModule}
                />

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: {
                            xs: '100%',
                            md: sidebarCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 280px)',
                        },
                        transition: theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }}
                >
                    {/* AppBar para mobile */}
                    {isMobile && (
                        <AppBar
                            position="sticky"
                            elevation={0}
                            sx={{
                                backgroundColor: 'white',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleToggleSidebar}
                                    sx={{ mr: 2, color: 'text.primary' }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
                                    {isAdmin ? 'Panel de Administración' : 'Panel de Empleado'}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    )}

                    <Box sx={{
                        minHeight: '100vh',
                        background: 'linear-gradient(180deg, #f5f2e8 0%, #ede9dc 100%)',
                        py: 4
                    }}>
                        <Container maxWidth="xl">
                            {/* Mostrar perfil si el módulo seleccionado es 'profile' */}
                            {selectedModule === 'profile' ? (
                                <DashboardProfileView />
                            ) : selectedModule === 'settings' ? (
                                <HorariosManagement />
                            ) : selectedModule === 'dashboard' || selectedModule === 'calendar' ? (
                                <>
                                    {/* Header con título y botón de configurar horarios */}
                                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: isAdmin ? '#dc2626' : '#2563eb', mb: 0.5 }}>
                                                {isAdmin ? 'Panel de Administración' : 'Panel de Empleado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Gestiona las citas y revisa tu agenda
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Configurar mis horarios laborales">
                                            <Button
                                                variant="outlined"
                                                startIcon={<SettingsIcon />}
                                                onClick={() => handleModuleChange('settings')}
                                                sx={{
                                                    borderColor: isAdmin ? '#dc2626' : '#2563eb',
                                                    color: isAdmin ? '#dc2626' : '#2563eb',
                                                    '&:hover': {
                                                        borderColor: isAdmin ? '#dc2626' : '#2563eb',
                                                        bgcolor: isAdmin ? '#dc262608' : '#2563eb08',
                                                    },
                                                }}
                                            >
                                                Configurar Horarios
                                            </Button>
                                        </Tooltip>
                                    </Box>

                                    <Grid container spacing={3}>
                                    {/* Columna Izquierda - Calendario Compacto y Filtros */}
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={2}>
                                            {/* Calendario */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    background: CARD_BG,
                                                    border: '1px solid rgba(125, 150, 116, 0.15)',
                                                }}
                                            >
                                                <CalendarComponent
                                                    events={events}
                                                    view={calendarView}
                                                    date={calendarDate}
                                                    selectedDate={selectedDate}
                                                    onNavigate={handleNavigate}
                                                    onView={setCalendarView}
                                                    onSelectSlot={handleSelectSlot}
                                                    onSelectEvent={handleSelectEvent}
                                                />

                                                {/* Filtros */}
                                                <FiltersComponent
                                                    selectedFilters={filters}
                                                    onFiltersChange={setFilters}
                                                />

                                                {/* Botón de configurar horarios (compacto) */}
                                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                                                    <Button
                                                        fullWidth
                                                        variant="text"
                                                        startIcon={<SettingsIcon />}
                                                        onClick={() => handleModuleChange('settings')}
                                                        sx={{
                                                            color: isAdmin ? '#dc2626' : '#2563eb',
                                                            justifyContent: 'flex-start',
                                                            textTransform: 'none',
                                                            py: 1.5,
                                                            '&:hover': {
                                                                bgcolor: isAdmin ? '#dc262608' : '#2563eb08',
                                                            },
                                                        }}
                                                    >
                                                        Mis Horarios Laborales
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        </Stack>
                                    </Grid>

                                    {/* Columna Derecha - Lista de Citas Amplia */}
                                    <Grid item xs={12} md={8}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                background: CARD_BG,
                                                border: '1px solid rgba(125, 150, 116, 0.15)',
                                                minHeight: '400px',
                                            }}
                                        >
                                            {loading ? (
                                                <Typography>Cargando...</Typography>
                                            ) : (
                                                <CitasList
                                                    citas={citasLista}
                                                    isAdmin={isAdmin}
                                                    groupByDate={true}
                                                    title="Citas del Día"
                                                    emptyMessage="No hay citas para este día"
                                                    onCancelar={handleOpenCancelDialog}
                                                />
                                            )}
                                        </Paper>
                                    </Grid>
                                </Grid>
                                </>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h5" color="text.secondary">
                                        Módulo en desarrollo: {selectedModule}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Esta funcionalidad estará disponible próximamente
                                    </Typography>
                                </Box>
                            )}
                        </Container>

                        {/* Dialog de Cancelación */}
                        <CancelDialog
                            open={cancelDialogOpen}
                            cita={selectedCita}
                            loading={cancelarCitaMutation.isPending}
                            onClose={handleCloseCancelDialog}
                            onConfirm={handleCancelarCita}
                        />
                    </Box>
                </Box>
            </Box>
        </StaffOnly>
    );
};
