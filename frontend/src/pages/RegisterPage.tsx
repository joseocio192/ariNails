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
import { useRegister } from '../hooks/useAuth';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';

const RegisterPage: React.FC = () => {
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { nombres, apellidoPaterno, apellidoMaterno, usuario, email, password },
      {
        onSuccess: () => {
          setTimeout(() => navigate('/login'), 1500);
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
          {/* Logo */}
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
              Únete a nuestra comunidad
            </Typography>
          </Box>

          {/* Register Card */}
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
              Crear Cuenta
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nombres"
                  variant="outlined"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  disabled={registerMutation.isPending}
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
                  label="Apellido Paterno"
                  variant="outlined"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  disabled={registerMutation.isPending}
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
                  label="Apellido Materno"
                  variant="outlined"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  disabled={registerMutation.isPending}
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
                  label="Nombre de Usuario"
                  variant="outlined"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={registerMutation.isPending}
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
                  label="Correo electrónico"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={registerMutation.isPending}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary' }} />
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
                  disabled={registerMutation.isPending}
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

                {registerMutation.error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {(registerMutation.error as any)?.response?.data?.message || 'Error al registrar'}
                  </Alert>
                )}

                {registerMutation.isSuccess && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    ¡Cuenta creada exitosamente! Redirigiendo al login...
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={registerMutation.isPending}
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
                  {registerMutation.isPending ? (
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
                      Creando cuenta...
                    </Box>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    ¿Ya tienes cuenta?
                  </Typography>
                  <Link 
                    to="/login"
                    style={{
                      color: '#ec4899',
                      textDecoration: 'none',
                      fontWeight: 'semibold',
                    }}
                  >
                    Iniciar sesión
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

export default RegisterPage;
