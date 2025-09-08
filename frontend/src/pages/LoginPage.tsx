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
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';

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
        onSuccess: (response) => {
          // Verificar si tenemos información del rol para redirigir adecuadamente
          if (response?.data) {
            // Decodificar el JWT para obtener información del usuario
            try {
              const payload = JSON.parse(atob(response.data.split('.')[1]));
              
              // Redirigir según el rol
              if (payload.rolNombre === 'empleado') {
                navigate('/empleado-dashboard');
              } else if (payload.rolNombre === 'admin') {
                navigate('/profile'); // O crear un dashboard admin específico
              } else {
                navigate('/profile'); // Clientes van al perfil normal
              }
            } catch (error) {
              console.error('Error al decodificar token:', error);
              navigate('/profile'); // Fallback
            }
          } else {
            navigate('/profile'); // Fallback
          }
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)'
              }}
            >
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                AN
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              AriNails
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Tu salón de belleza de confianza
            </Typography>
          </Box>

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
                    {(loginMutation.error as any)?.response?.data?.message || 'Error al iniciar sesión'}
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
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    ¿No tienes cuenta?
                  </Typography>
                  <Link 
                    to="/register"
                    style={{
                      color: '#ec4899',
                      textDecoration: 'none',
                      fontWeight: 'semibold',
                    }}
                  >
                    Crear una cuenta
                  </Link>
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
