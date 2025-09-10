import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import { 
  Build as ServicesIcon,
  CalendarToday as CalendarIcon,
  Event as AppointmentsIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import ServicesManagement from '../components/admin/ServicesManagement';
import AppointmentsManagement from '../components/admin/AppointmentsManagement';
import CalendarManagement from '../components/admin/CalendarManagement';
import AdminStatistics from '../components/admin/AdminStatistics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [value, setValue] = useState(0);
  const { logout } = useAuth();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AriNails - Panel de Administración
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="admin dashboard tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label="Dashboard" 
                icon={<DashboardIcon />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label="Servicios" 
                icon={<ServicesIcon />} 
                iconPosition="start"
                {...a11yProps(1)} 
              />
              <Tab 
                label="Citas" 
                icon={<AppointmentsIcon />} 
                iconPosition="start"
                {...a11yProps(2)} 
              />
              <Tab 
                label="Calendario" 
                icon={<CalendarIcon />} 
                iconPosition="start"
                {...a11yProps(3)} 
              />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <AdminStatistics onTabChange={setValue} />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <ServicesManagement />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <AppointmentsManagement />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <CalendarManagement />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;