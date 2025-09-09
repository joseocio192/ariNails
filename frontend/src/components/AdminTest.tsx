import React from 'react';
import AdminDashboard from '../pages/AdminDashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e91e63',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

const AdminTest: React.FC = () => {
  // Mock a token for testing
  React.useEffect(() => {
    localStorage.setItem('token', 'mock-token-for-testing');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminDashboard />
    </ThemeProvider>
  );
};

export default AdminTest;