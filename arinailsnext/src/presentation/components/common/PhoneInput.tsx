'use client';

import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { Phone } from '@mui/icons-material';

// Lista de códigos de país más comunes
const COUNTRY_CODES = [
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'México' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canadá' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'España' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'Francia' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Alemania' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italia' },
  { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia' },
  { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Perú' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brasil' },
  { code: '+58', country: 'VE', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', country: 'EC', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+502', country: 'GT', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+503', country: 'SV', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+504', country: 'HN', flag: '🇭🇳', name: 'Honduras' },
  { code: '+505', country: 'NI', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+506', country: 'CR', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+507', country: 'PA', flag: '🇵🇦', name: 'Panamá' },
  { code: '+591', country: 'BO', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+595', country: 'PY', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+598', country: 'UY', flag: '🇺🇾', name: 'Uruguay' },
];

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  sx?: any;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  error,
  helperText,
  disabled = false,
  required = false,
  label = 'Teléfono',
  placeholder = '5512345678',
  sx,
}) => {
  return (
    <FormControl fullWidth error={!!error} sx={sx}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Country Code Selector */}
        <Select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          sx={{
            width: 120,
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: 2,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : undefined,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : undefined,
            },
          }}
          renderValue={(value) => {
            const country = COUNTRY_CODES.find(c => c.code === value);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ fontSize: '1.2rem' }}>{country?.flag}</span>
                <span>{value}</span>
              </Box>
            );
          }}
        >
          {COUNTRY_CODES.map((country) => (
            <MenuItem key={`${country.code}-${country.country}`} value={country.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <span style={{ fontSize: '1.2rem' }}>{country.flag}</span>
                <span style={{ flex: 1 }}>{country.name}</span>
                <span style={{ color: 'text.secondary' }}>{country.code}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>

        {/* Phone Number Input */}
        <TextField
          fullWidth
          label={label}
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            // Solo permitir números
            const value = e.target.value.replace(/\D/g, '');
            onPhoneNumberChange(value);
          }}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          error={!!error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone sx={{ color: error ? 'error.main' : 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
