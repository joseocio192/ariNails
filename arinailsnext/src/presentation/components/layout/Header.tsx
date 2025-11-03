'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Divider,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { HEADER_BG, ACCENT_GRADIENT, ACCENT_SOLID } from '../../theme/colors';
import { useAuth, useLogout } from '../../hooks/useSimpleAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { ClientOnly } from '../common/ClientOnly';

/**
 * Navigation Menu Item Interface
 */
interface MenuItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

/**
 * Header Component
 * Main navigation component with responsive design
 */
export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { isAdmin, isEmployee, isClient } = useUserRole();
  const logoutMutation = useLogout();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Menu items are now handled separately for base and auth-dependent items

  const renderLogo = () => (
    <Link 
      href="/" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
      }}
    >
      <Box sx={{ 
        width: 42, 
        height: 42, 
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(127, 161, 123, 0.3)',
        background: 'white',
      }}>
        <img 
          src="./logo.png" 
          alt="Ari Nails Logo" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          fontSize: { xs: '1.1rem', md: '1.3rem' },
          background: ACCENT_GRADIENT,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Ari Nails
      </Typography>
    </Link>
  );

  // Base menu items that don't require auth
  const baseMenuItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/#servicios' },
  ];

  const renderDesktopNav = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
      {/* Base navigation items */}
      {baseMenuItems.map((item) => (
        <Button 
          key={item.label}
          component={Link}
          href={item.href}
          sx={{ 
            textTransform: 'none', 
            color: pathname === item.href ? ACCENT_SOLID : 'text.primary',
            fontWeight: pathname === item.href ? 600 : 500,
            px: 2,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(125, 150, 116, 0.08)',
              color: ACCENT_SOLID,
            },
          }}
        >
          {item.label}
        </Button>
      ))}
      
      {/* Auth-dependent navigation */}
      <ClientOnly>
        {isAuthenticated && (
          <>
            {(isAdmin || isEmployee) && (
              <Button 
                key="dashboard"
                component={Link}
                href="/dashboard"
                sx={{ 
                  textTransform: 'none', 
                  color: pathname === '/dashboard' ? ACCENT_SOLID : 'text.primary',
                  fontWeight: pathname === '/dashboard' ? 600 : 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(125, 150, 116, 0.08)',
                    color: ACCENT_SOLID,
                  },
                }}
              >
                Dashboard
              </Button>
            )}
            {isClient && (
              <Button 
                key="dashboard-client"
                component={Link}
                href="/dashboard/client"
                sx={{ 
                  textTransform: 'none', 
                  color: pathname === '/dashboard/client' ? ACCENT_SOLID : 'text.primary',
                  fontWeight: pathname === '/dashboard/client' ? 600 : 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(125, 150, 116, 0.08)',
                    color: ACCENT_SOLID,
                  },
                }}
              >
                Mi Dashboard
              </Button>
            )}
          </>
        )}
        
        {isAuthenticated ? (
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              ml: 2,
              borderColor: ACCENT_SOLID,
              color: ACCENT_SOLID,
              '&:hover': {
                backgroundColor: ACCENT_SOLID,
                color: 'white',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              sx={{
                borderColor: ACCENT_SOLID,
                color: ACCENT_SOLID,
                '&:hover': {
                  backgroundColor: ACCENT_SOLID,
                  color: 'white',
                },
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              sx={{
                background: ACCENT_GRADIENT,
                '&:hover': {
                  background: ACCENT_GRADIENT,
                  opacity: 0.9,
                },
              }}
            >
              Registrarse
            </Button>
          </Box>
        )}
      </ClientOnly>
    </Box>
  );

  const renderMobileDrawer = () => (
    <Drawer
      variant="temporary"
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: 280,
          background: HEADER_BG,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {renderLogo()}
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {/* Base navigation items */}
        {baseMenuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={handleDrawerToggle}
              sx={{
                color: pathname === item.href ? ACCENT_SOLID : 'text.primary',
                fontWeight: pathname === item.href ? 600 : 400,
                '&:hover': {
                  backgroundColor: 'rgba(125, 150, 116, 0.08)',
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Auth-dependent menu items */}
        <ClientOnly>
          {isAuthenticated && (
            <>
              {(isAdmin || isEmployee) && (
                <ListItem key="dashboard" disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/dashboard"
                    onClick={handleDrawerToggle}
                    sx={{
                      color: pathname === '/dashboard' ? ACCENT_SOLID : 'text.primary',
                      fontWeight: pathname === '/dashboard' ? 600 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(125, 150, 116, 0.08)',
                      },
                    }}
                  >
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
              )}
              {isClient && (
                <ListItem key="dashboard-client" disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/dashboard/client"
                    onClick={handleDrawerToggle}
                    sx={{
                      color: pathname === '/dashboard/client' ? ACCENT_SOLID : 'text.primary',
                      fontWeight: pathname === '/dashboard/client' ? 600 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(125, 150, 116, 0.08)',
                      },
                    }}
                  >
                    <ListItemText primary="Mi Dashboard" />
                  </ListItemButton>
                </ListItem>
              )}
            </>
          )}
        </ClientOnly>
        
        <Divider sx={{ my: 2 }} />
        
        <ClientOnly>
          {isAuthenticated ? (
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Cerrar Sesión" />
              </ListItemButton>
            </ListItem>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/login" onClick={handleDrawerToggle}>
                  <ListItemText primary="Iniciar Sesión" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/register" onClick={handleDrawerToggle}>
                  <ListItemText primary="Registrarse" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </ClientOnly>
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: HEADER_BG,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {renderLogo()}
            
            {/* Desktop Navigation */}
            {renderDesktopNav()}

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon sx={{ color: ACCENT_SOLID }} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      {renderMobileDrawer()}
    </>
  );
};