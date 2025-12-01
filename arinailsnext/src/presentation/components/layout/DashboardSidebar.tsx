'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarIcon,
  DesignServices as ServicesIcon,
  AdminPanelSettings,
  WorkOutline as WorkIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DIContainer } from '@/core/di/DIContainer';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 64;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  isDivider?: boolean;
}

interface DashboardSidebarProps {
  isAdmin: boolean;
  userName?: string;
  userEmail?: string;
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
  onModuleChange?: (moduleId: string) => void;
  selectedModule?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isAdmin,
  userName = 'Usuario',
  userEmail = '',
  open,
  collapsed,
  onToggle,
  onCollapse,
  onModuleChange,
  selectedModule = 'dashboard',
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const diContainer = DIContainer.getInstance();
  const authRepository = diContainer.getAuthRepository();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const roleColor = isAdmin ? '#dc2626' : '#2563eb';
  const roleLabel = isAdmin ? 'Administrador' : 'Empleado';
  const RoleIcon = isAdmin ? AdminPanelSettings : WorkIcon;

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutModalOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await authRepository.logout();
      setLogoutModalOpen(false);
      // Forzar refresh completo de la página
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Incluso si hay error, forzar el refresh para limpiar el estado
      window.location.href = '/';
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tablero',
      icon: <DashboardIcon />,
    },
    ...(isAdmin ? [
      {
        id: 'usuarios',
        label: 'Usuarios',
        icon: <PeopleIcon />,
      },
      {
        id: 'empleados',
        label: 'Empleados',
        icon: <WorkIcon />,
      },
      {
        id: 'servicios',
        label: 'Servicios',
        icon: <ServicesIcon />,
      },
      {
        id: 'reportes',
        label: 'Reportes',
        icon: <AssessmentIcon />,
      },
    ] : []),
    {
      id: 'disenos',
      label: 'Diseños de Uñas',
      icon: <PaletteIcon />,
    },
    {
      id: 'divider-1',
      label: '',
      icon: null,
      isDivider: true,
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: <PersonIcon />,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <SettingsIcon />,
    },
    {
      id: 'divider-2',
      label: '',
      icon: null,
      isDivider: true,
    },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      icon: <LogoutIcon />,
      action: handleLogoutClick,
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (onModuleChange && !item.isDivider) {
      onModuleChange(item.id);
    }
    if (isMobile) {
      onToggle();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header con toggle collapse */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${roleColor}15 0%, ${roleColor}08 100%)`,
          borderBottom: `1px solid ${roleColor}20`,
        }}
      >
        {!collapsed && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
            <RoleIcon sx={{ color: roleColor, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: roleColor }}>
              {roleLabel}
            </Typography>
          </Stack>
        )}
        {!isMobile && (
          <IconButton onClick={onCollapse} size="small">
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: roleColor,
                width: 48,
                height: 48,
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight="bold" noWrap>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {userEmail}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => {
          if (item.isDivider) {
            return <Divider key={item.id} sx={{ my: 1 }} />;
          }

          const isSelected = selectedModule === item.id;

          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={isSelected}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: `${roleColor}15`,
                    '&:hover': {
                      backgroundColor: `${roleColor}20`,
                    },
                  },
                  '&:hover': {
                    backgroundColor: `${roleColor}08`,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? roleColor : 'text.secondary',
                    minWidth: collapsed ? 'auto' : 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? roleColor : 'text.primary',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 'none',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 'none',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};
