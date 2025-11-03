'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Container,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  Home as HomeIcon,
  DesignServices as ServicesIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../../hooks/useUserRole';
import { DIContainer } from '@/core/di/DIContainer';
import { AgendarCitaModule, MisCitasModule } from '../client';
import { ProfilePage } from './ProfilePage';
import { ACCENT_GRADIENT, ACCENT_SOLID, CARD_BG } from '../../theme/colors';

const drawerWidth = 280;
const drawerWidthCollapsed = 64;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component?: React.ReactNode;
  action?: () => void;
  isDivider?: boolean;
  isExternal?: boolean;
}

/**
 * Dashboard para clientes con navegación unificada
 * Incluye menú lateral con todos los enlaces de la aplicación
 */
export const ClientDashboardPage: React.FC = () => {
  const router = useRouter();
  const { isClient, isAuthenticated, isLoading, user } = useUserRole();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('agendar-cita');

  // Obtener repositorio de autenticación
  const diContainer = DIContainer.getInstance();
  const authRepository = diContainer.getAuthRepository();

  // Redirigir si no es cliente
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isClient) {
      router.push('/dashboard');
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isClient, router]);

  // Mostrar loading mientras se verifica el rol
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: ACCENT_GRADIENT,
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  // No renderizar nada si no es cliente (se está redirigiendo)
  if (!isClient) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    authRepository.logout();
    router.push('/login');
  };

  const menuItems: MenuItem[] = [
    // Sección de Navegación Principal
    {
      id: 'inicio',
      label: 'Inicio',
      icon: <HomeIcon />,
      action: () => router.push('/'),
      isExternal: true,
    },
    {
      id: 'divider-1',
      label: '',
      icon: null,
      isDivider: true,
    },
    // Sección de Dashboard
    {
      id: 'agendar-cita',
      label: 'Agendar Cita',
      icon: <CalendarIcon />,
      component: <AgendarCitaModule />,
    },
    {
      id: 'mis-citas',
      label: 'Mis Citas',
      icon: <EventNoteIcon />,
      component: <MisCitasModule />,
    },
    {
      id: 'divider-2',
      label: '',
      icon: null,
      isDivider: true,
    },
    // Sección de Usuario
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: <PersonIcon />,
      component: <ProfilePage />,
    },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      icon: <LogoutIcon />,
      action: handleLogout,
      isExternal: true,
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: CARD_BG }}>
      {/* Header del menú con degradado y logo */}
      <Box
        sx={{
          p: collapsed ? 1.5 : 3,
          background: ACCENT_GRADIENT,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          transition: theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              color: 'white',
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        {/* Botón de colapsar (solo desktop) */}
        {!isMobile && (
          <IconButton
            onClick={handleCollapse}
            sx={{
              color: 'white',
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
        
        {/* Logo de la marca */}
        <Box sx={{ 
          width: collapsed ? 40 : 56, 
          height: collapsed ? 40 : 56, 
          borderRadius: '50%',
          overflow: 'hidden',
          mb: collapsed ? 1 : 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: theme.transitions.create(['width', 'height', 'margin-bottom'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}>
          <img 
            src="/logo.png" 
            alt="Ari Nails Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </Box>
        
        {!collapsed && (
          <>
            <Typography variant="h6" fontWeight="700" textAlign="center" sx={{ mb: 0.5 }}>
              Ari Nails
            </Typography>
          </>
        )}

      </Box>

      {/* Lista de opciones */}
      <List sx={{ flex: 1, pt: 2, px: collapsed ? 0.5 : 1.5 }}>
        {menuItems.map((item, index) => {
          if (item.isDivider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1.5 }} />;
          }

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedModule === item.id && !item.isExternal}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    handleModuleChange(item.id);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: collapsed ? 1 : 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    background: `linear-gradient(135deg, ${ACCENT_SOLID}15 0%, ${ACCENT_SOLID}20 100%)`,
                    borderLeft: collapsed ? 'none' : `3px solid ${ACCENT_SOLID}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${ACCENT_SOLID}20 0%, ${ACCENT_SOLID}25 100%)`,
                    },
                  },
                  '&:hover': {
                    backgroundColor: `${ACCENT_SOLID}08`,
                    transform: collapsed ? 'scale(1.1)' : 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selectedModule === item.id && !item.isExternal ? ACCENT_SOLID : 'text.secondary',
                    minWidth: collapsed ? 'auto' : 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: selectedModule === item.id && !item.isExternal ? 600 : 400,
                      fontSize: '0.95rem',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      {!collapsed && (
        <Box 
          sx={{ 
            p: 2, 
            textAlign: 'center', 
            borderTop: `1px solid ${ACCENT_SOLID}15`,
            background: `linear-gradient(180deg, transparent 0%, ${ACCENT_SOLID}05 100%)`,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Ari Nails © 2025
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: 'text.disabled', fontSize: '0.7rem', mt: 0.5 }}>
            Belleza y Elegancia
          </Typography>
        </Box>
      )}
    </Box>
  );

  const selectedMenuItem = menuItems.find((item) => item.id === selectedModule);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f2e8' }}>
      {/* AppBar para móviles */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            background: ACCENT_GRADIENT,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight="600">
              {selectedMenuItem?.label || 'Mi Panel'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer lateral */}
      <Box
        component="nav"
        sx={{ 
          width: { md: collapsed ? drawerWidthCollapsed : drawerWidth }, 
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: collapsed ? drawerWidthCollapsed : drawerWidth,
                borderRight: `1px solid ${ACCENT_SOLID}20`,
                boxShadow: '2px 0 8px rgba(125, 150, 116, 0.08)',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            md: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidth}px)` 
          },
          mt: { xs: 8, md: 0 },
          minHeight: '100vh',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {selectedMenuItem?.component}
        </Container>
      </Box>
    </Box>
  );
};
