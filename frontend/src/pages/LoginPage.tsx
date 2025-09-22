import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton,
  Container,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import TitleForm from '../components/TitleForm';
import AuthFooter from '../components/AuthFooter';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate('/profile');
        },
      }
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo Section */}
          <TitleForm />
          {/* Login Card */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 400,
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                textAlign: 'center', 
                mb: 3, 
                fontWeight: 'semibold',
                color: 'text.primary'
              }}
            >
              Iniciar Sesión
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginMutation.isPending}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#ec4899',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ec4899',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#ec4899',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#ec4899',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ec4899',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#ec4899',
                    },
                  }}
                />

                {loginMutation.error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {((() => {
                        try {
                          return (loginMutation.error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message;
                        } catch { return undefined; }
                      })()) || 'Error al iniciar sesión'}
                    </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 'semibold',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
                      boxShadow: '0 6px 25px rgba(236, 72, 153, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                    },
                  }}
                >
                  {loginMutation.isPending ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }}
                      />
                      Iniciando...
                    </Box>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', pt: 2 }}>
                  <AuthFooter prompt="¿No tienes cuenta?" actionText="Crear una cuenta" to="/register" variant="inline" />
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
