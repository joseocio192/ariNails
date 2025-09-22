import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  prompt?: string;
  actionText: string;
  to: string;
  variant?: 'inline' | 'stacked';
  className?: string;
};

const AuthFooter: React.FC<Props> = ({
  prompt = '¿No tienes cuenta? ',
  actionText,
  to,
  variant = 'stacked',
  className,
}) => {
  if (variant === 'inline') {
    return (
      <Typography variant="body2" color="text.secondary" component="span" className={className}>
        {prompt}{' '}
        <MuiLink
          component={RouterLink}
          to={to}
          sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {actionText}
        </MuiLink>
      </Typography>
    );
  }

  return (
    <Box textAlign="center" className={className}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {prompt}
      </Typography>
      <MuiLink
        component={RouterLink}
        to={to}
        sx={{ color: '#ec4899', textDecoration: 'none', fontWeight: 'semibold' }}
      >
        {actionText}
      </MuiLink>
    </Box>
  );
};

export default AuthFooter;
