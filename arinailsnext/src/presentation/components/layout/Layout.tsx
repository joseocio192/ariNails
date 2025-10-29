import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Main Layout Component
 * Provides consistent layout structure across the application
 */
interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: '#f5f2e8',
    }}>
      {showHeader && <Header />}
      
      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showHeader && <Toolbar />}
        {children}
      </Box>
      
      {showFooter && <Footer />}
    </Box>
  );
};