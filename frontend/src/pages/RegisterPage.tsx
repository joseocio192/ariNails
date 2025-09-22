import React, { useState } from 'react';
import { 
  TextField, 
  
  Box, 
  Typography, 
  Paper, 
  Alert, 
  Container,
  InputAdornment,
  IconButton,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { Visibility, VisibilityOff, Person, Email, Lock, Phone } from '@mui/icons-material';
import TitleForm from '../components/TitleForm';
import MultiStepModal from '../components/MultiStepModal';
import AuthFooter from '../components/AuthFooter';
import { validateRegister } from '../utils/schemas';
import {
  sanitizeName,
  sanitizePhone,
  sanitizeUsername,
} from '../utils/validation';
// types are centralized in src/types; no direct import needed here

const RegisterPage: React.FC = () => {
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telefono, setTelefono] = useState('');
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});


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
          <TitleForm />

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
              fontWeight: 'bold',
              }}
            >
              CREAR CUENTA
            </Typography>

            <MultiStepModal
              variant="card"
              steps={2}
              onFinish={() => {
                const { valid, errors } = validateRegister({nombres, apellidoPaterno, apellidoMaterno, telefono, usuario, email, password});
                if (!valid) {
                  setFieldErrors(errors);
                  return;
                }
                setFieldErrors({});
                registerMutation.mutate(
                  { nombres, apellidoPaterno, apellidoMaterno, telefono, usuario, email, password },
                  { onSuccess: () => setTimeout(() => navigate('/login'), 1500) }
                );
              }}
              renderStep={(step) => {
                const PersonalStep: React.FC = () => (
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nombres"
                      variant="outlined"
                      value={nombres}
                      onChange={(e) => setNombres(sanitizeName(e.target.value))}
                      onBlur={() => setNombres((v) => v.trim())}
                      inputProps={{ maxLength: 50, inputMode: 'text' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.nombres}
                      helperText={fieldErrors.nombres}
                    />

                    <TextField
                      fullWidth
                      label="Apellido Paterno"
                      variant="outlined"
                      value={apellidoPaterno}
                      onChange={(e) => setApellidoPaterno(sanitizeName(e.target.value))}
                      inputProps={{ maxLength: 50, inputMode: 'text' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.apellidoPaterno}
                      helperText={fieldErrors.apellidoPaterno}
                    />

                    <TextField
                      fullWidth
                      label="Apellido Materno"
                      variant="outlined"
                      value={apellidoMaterno}
                      onChange={(e) => setApellidoMaterno(sanitizeName(e.target.value))}
                      inputProps={{ maxLength: 50, inputMode: 'text' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.apellidoMaterno}
                      helperText={fieldErrors.apellidoMaterno}
                    />

                    <TextField
                      fullWidth
                      label="Telefono"
                      variant="outlined"
                      value={telefono}
                      onChange={(e) => setTelefono(sanitizePhone(e.target.value))}
                      onPaste={(e) => {
                        const globalClipboard = (window as unknown as { clipboardData?: DataTransfer }).clipboardData;
                        const paste = (e.clipboardData || globalClipboard)?.getData?.('text') ?? '';
                        const sanitized = sanitizePhone(paste);
                        e.preventDefault();
                        setTelefono((prev) => (prev + sanitized).slice(0, 10));
                      }}
                      inputProps={{ inputMode: 'tel', maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.telefono}
                      helperText={fieldErrors.telefono || 'Ejemplo: 6671234567'}
                    />
                  </Stack>
                );

                const AccountStep: React.FC = () => (
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nombre de Usuario"
                      variant="outlined"
                      value={usuario}
                      onChange={(e) => setUsuario(sanitizeUsername(e.target.value))}
                      inputProps={{ maxLength: 20 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.usuario}
                      helperText={fieldErrors.usuario}
                    />

                    <TextField
                      fullWidth
                      label="Correo electrónico"
                      type="email"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      inputProps={{ maxLength: 50, inputMode: 'email' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                    />

                    <TextField
                      fullWidth
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      error={!!fieldErrors.password}
                      helperText={fieldErrors.password}
                    />

                    {registerMutation.error && (
                      <Alert severity="error">{((registerMutation.error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message) || 'Error al registrar'}</Alert>
                    )}

                    {registerMutation.isSuccess && (
                      <Alert severity="success">¡Cuenta creada exitosamente! Redirigiendo al login...</Alert>
                    )}
                  </Stack>
                );

                if (step === 0) return <PersonalStep />;
                if (step === 1) return <AccountStep />;
                return null;
              }}
            />
           <Box sx={{textAlign: 'center'}}>
            <AuthFooter prompt="Ya tienes una cuenta?" actionText="Iniciar sesión" to="/login" variant="inline" />
           </Box>

          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;
