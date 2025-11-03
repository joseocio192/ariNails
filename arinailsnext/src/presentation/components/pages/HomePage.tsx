'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack,
  Grid
} from '@mui/material';
import { ArrowForward, Check, LocationOn, Phone, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ACCENT_GRADIENT, ACCENT_SOLID, BACKGROUND, CARD_BG } from '../../theme/colors';
import { TestimonialCarousel } from '../ui/TestimonialCarousel';
import { 
  getContent, 
  getPricingPlans, 
  getTestimonials, 
  getBusinessInfo,
  getContactInfo,
  getPolicies
} from '../../../config/siteConfig';
import { useAuth } from '../../hooks/useSimpleAuth';
import dynamic from 'next/dynamic';

// Dynamically import the Map component so it's only rendered on client
const Map = dynamic<{
  address?: string;
  latitude?: number;
  longitude?: number;
}>(
  () => import('../common/Map').then((mod) => mod.default),
  { ssr: false }
);

/**
 * Pricing Card Interface
 */
interface PricingCardProps {
  title: string;
  price?: string | null;
  bullets: readonly string[];
  featured?: boolean;
  originalPrice?: string;
  duration?: string;
  popular?: boolean;
  onSelectClick?: () => void;
}

/**
 * Pricing Card Component
 */
const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  price, 
  bullets, 
  featured = false,
  popular = false,
  originalPrice,
  duration,
  onSelectClick
}) => {
  const isHighlighted = featured || popular;
  
  return (
  <Card 
    elevation={0} 
    sx={{ 
      borderRadius: 3, 
      p: { xs: 2, md: 2.5 }, 
      background: isHighlighted 
        ? 'linear-gradient(135deg, rgba(125, 150, 116, 0.04) 0%, #fefdfb 100%)' 
        : CARD_BG, 
      border: isHighlighted 
        ? `2px solid ${ACCENT_SOLID}` 
        : '1px solid rgba(125, 150, 116, 0.15)', 
      boxShadow: isHighlighted 
        ? '0 8px 24px rgba(125, 150, 116, 0.12)' 
        : '0 4px 16px rgba(0,0,0,0.04)', 
  minHeight: 360,
  height: '100%', 
      position: 'relative', 
      transition: 'all 0.3s ease', 
      '&:hover': { 
        transform: 'translateY(-8px)', 
        boxShadow: isHighlighted 
          ? '0 20px 50px rgba(125, 150, 116, 0.2)' 
          : '0 15px 40px rgba(0,0,0,0.08)' 
      } 
    }}
  >
    {isHighlighted && (
      <Box sx={{ 
        position: 'absolute', 
        top: 5, 
        right: 20,
        background: ACCENT_GRADIENT, 
        color: 'white', 
        px: 1.75, 
        py: 5, 
        borderRadius: 2, 
        fontSize: '0.75rem', 
        fontWeight: 'bold', 
        boxShadow: '0 4px 12px rgba(125, 150, 116, 0.35)' 
      }}>
        MÁS POPULAR
      </Box>
    )}
    <CardContent sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 1, 
          color: isHighlighted ? ACCENT_SOLID : 'text.primary' 
        }}
      >
        {title}
      </Typography>
      {price != null ? (
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 2, 
            color: isHighlighted ? ACCENT_SOLID : 'text.primary' 
          }}
        >
          {price}
        </Typography>
      ) : null}
      <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1, mt: price == null ? '40px' : undefined }}>
        {bullets.map((bullet, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              background: 'rgba(125, 150, 116, 0.12)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0 
            }}>
              <Check sx={{ color: ACCENT_SOLID, fontSize: 16 }} />
            </Box>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary', lineHeight: 1.4 }}
            >
              {bullet}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Button 
        variant="contained" 
        fullWidth 
        endIcon={<ArrowForward />}
        onClick={onSelectClick}
        sx={{ 
          background: ACCENT_GRADIENT, 
          textTransform: 'none', 
          borderRadius: 2, 
          py: 1.3, 
          fontWeight: 600, 
          boxShadow: '0 4px 12px rgba(125, 150, 116, 0.25)', 
          transition: 'all 0.2s ease', 
          '&:hover': { 
            boxShadow: '0 6px 20px rgba(125, 150, 116, 0.35)', 
            transform: 'scale(1.02)' 
          },
          mt: 'auto'
        }}
      >
        Seleccionar horario
      </Button>
    </CardContent>
  </Card>
  );
};

/**
 * Home Page Component
 */
export const HomePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Load configuration data
  const content = getContent();
  const pricingPlans = getPricingPlans();
  const testimonials = getTestimonials();
  const businessInfo = getBusinessInfo();
  const contactInfo = getContactInfo();

  // Policy type used for rendering the accordions
  interface Policy {
    id: string;
    title: string;
    body: string;
  }

  const policies: readonly Policy[] = getPolicies();
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);

  // Handle CTA button click - redirect based on authentication
  const handleCTAClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard/client');
    } else {
      router.push('/login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: BACKGROUND, overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(125, 150, 116, 0.06) 0%, rgba(95, 117, 86, 0.03) 100%)',
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 4 },
        mb: { xs: 4, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                background: ACCENT_GRADIENT,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {content.hero.title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.6
              }}
            >
              {content.hero.subtitle}
            </Typography>
            <Button
              onClick={handleCTAClick}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                background: ACCENT_GRADIENT,
                textTransform: 'none',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(125, 150, 116, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(125, 150, 116, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {content.hero.ctaText}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Services + Policies Section */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 8 } }}>
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <Box id="servicios" sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  color: ACCENT_SOLID,
                }}
              >
                {content.services.title}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
              >
                {content.services.subtitle}
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
              {pricingPlans.map((plan, index) => (
                // Make cards wider and ensure they stretch to same height
                <Grid item xs={12} sm={10} md={6} lg={5} xl={4} key={index} sx={{ display: 'flex' }}>
                  <Box sx={{ width: '100%' }}>
                    <PricingCard {...plan} onSelectClick={handleCTAClick} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Policies column */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: ACCENT_SOLID, mb: 2 }}>
                {content.policiesContent?.title ?? 'POLÍTICAS Y CONDICIONES'}
              </Typography>
              <Box sx={{ height: '26px' }} />
            </Box>
            <Card elevation={0} sx={{ borderRadius: 3, p: 2, flex: '1 1 auto', display: 'flex', flexDirection: 'column', border: '1px solid rgba(125, 150, 116, 0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <Box sx={{ flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: '1 1 auto', overflowY: 'auto', pr: 0.5 }}>
                  {policies.map((policy) => (
                    <Accordion
                      key={policy.id}
                      disableGutters
                      expanded={openPolicy === policy.id}
                      onChange={() => setOpenPolicy(openPolicy === policy.id ? null : policy.id)}
                      sx={{ 
                        '&:before': { display: 'none' },
                        boxShadow: 'none'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: ACCENT_SOLID }} />}
                        sx={{ 
                          minHeight: 48,
                          '&.Mui-expanded': { minHeight: 48 }
                        }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>{policy.title}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{policy.body}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box id="testimonios" sx={{ mb: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: ACCENT_SOLID,
              }}
            >
              {content.testimonials.title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
            >
              {content.testimonials.subtitle}
            </Typography>
          </Box>
          <TestimonialCarousel 
            testimonials={testimonials.map(t => ({
              name: t.name,
              body: t.body,
              rating: t.rating
            }))} 
          />
        </Container>
      </Box>

      {/* Contact Section */}
      <Box 
        id="contacto"
        sx={{ 
          background: 'linear-gradient(135deg, rgba(125, 150, 116, 0.04) 0%, rgba(95, 117, 86, 0.02) 100%)',
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  color: ACCENT_SOLID,
                }}
              >
                {content.contact.title}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ color: 'text.secondary', mb: 4 }}
              >
                {content.contact.subtitle}
              </Typography>
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: ACCENT_SOLID }} />
                  <Typography>{contactInfo.address}</Typography>
                </Box>
              </Stack>
              <Button
                onClick={handleCTAClick}
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  background: ACCENT_GRADIENT,
                  textTransform: 'none',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {content.contact.ctaText}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                textAlign: 'center',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }
              }}>
                {/* Map showing business location (client-only) */}
                <Map address={contactInfo.address} latitude={contactInfo.latitude} longitude={contactInfo.longitude} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};