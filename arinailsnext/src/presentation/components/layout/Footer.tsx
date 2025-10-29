'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import { 
  LocationOn, 
  Email, 
  Facebook, 
  Instagram, 
  WhatsApp 
} from '@mui/icons-material';
import { FOOTER_BG, ACCENT_SOLID, TEXT_PRIMARY } from '../../theme/colors';
import { SITE_CONFIG } from '@/config/siteConfig';

/**
 * Footer Component
 * Application footer with contact information and links
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 20 }} />,
      text: SITE_CONFIG.contact.address + ', ' + SITE_CONFIG.contact.city,
      href: 'https://maps.google.com',
    },
    {
      icon: <Email sx={{ fontSize: 20 }} />,
      text: SITE_CONFIG.contact.email,
      href: 'mailto:'+SITE_CONFIG.contact.email,
    },
  ];

  const quickLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Testimonios', href: '/#testimonios' },
    { label: 'Política de Privacidad', href: '/privacy' },
    { label: 'Términos de Servicio', href: '/terms' },
  ];

  const socialLinks = [
    {
      icon: <Facebook />,
      href: 'https://facebook.com/arinails',
      label: 'Facebook',
    },
    {
      icon: <Instagram />,
      href: 'https://instagram.com/arinails',
      label: 'Instagram',
    },
    {
      icon: <WhatsApp />,
      href: 'https://wa.me/15551234567',
      label: 'WhatsApp',
    },
  ];

  return (
    <Box 
      component="footer"
      sx={{ 
        background: FOOTER_BG,
        borderTop: '1px solid rgba(125, 150, 116, 0.15)',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(127, 161, 123, 0.3)',
                    background: 'white',
                  }}>
                    <img 
                      src="./logo.jpg" 
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
                      color: ACCENT_SOLID,
                    }}
                  >
                    Ari Nails
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    maxWidth: 280,
                  }}
                >
                  Expertos en belleza y cuidado de uñas. Ofrecemos servicios profesionales 
                  con los más altos estándares de calidad y atención personalizada.
                </Typography>

                {/* Social Links */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialLinks.map((social) => (
                    <IconButton
                      key={social.label}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: ACCENT_SOLID,
                        border: `1px solid ${ACCENT_SOLID}`,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: ACCENT_SOLID,
                          color: 'white',
                        },
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Stack>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: TEXT_PRIMARY,
                }}
              >
                Enlaces Rápidos
              </Typography>
              <Stack spacing={1}>
                {quickLinks.map((link) => (
                  <Typography
                    key={link.label}
                    component={Link}
                    href={link.href}
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      display: 'block',
                      py: 0.5,
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: ACCENT_SOLID,
                      },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: TEXT_PRIMARY,
                }}
              >
                Contacto
              </Typography>
              <Stack spacing={2}>
                {contactInfo.map((info, index) => (
                  <Box
                    key={index}
                    component="a"
                    href={info.href}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      color: 'text.secondary',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: ACCENT_SOLID,
                      },
                    }}
                  >
                    <Box sx={{ color: ACCENT_SOLID }}>
                      {info.icon}
                    </Box>
                    <Typography variant="body2">
                      {info.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Box sx={{ mt: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  Horarios de Atención:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'text.secondary' }}
                >
                  Lun - Sáb: 9:00 AM - 7:00 PM
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'text.secondary' }}
                >
                  Dom: 10:00 AM - 5:00 PM
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(125, 150, 116, 0.15)' }} />

          {/* Bottom Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'center' },
              gap: 2,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              © {currentYear} Ari Nails. Todos los derechos reservados.
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              Hecho con ❤️ para nuestros clientes
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};