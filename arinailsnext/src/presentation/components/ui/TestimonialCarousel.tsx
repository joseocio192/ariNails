'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Stack
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star,
  FormatQuote
} from '@mui/icons-material';
import { ACCENT_SOLID, CARD_BG } from '../../theme/colors';

/**
 * Testimonial Interface
 */
export interface Testimonial {
  name: string;
  body: string;
  rating?: number;
}

/**
 * Testimonial Carousel Props
 */
interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
}

/**
 * Testimonial Carousel Component
 * Displays customer testimonials in a rotating carousel
 */
export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  autoPlay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
      {/* Main Testimonial Card */}
      <Card 
        elevation={0}
        sx={{ 
          background: CARD_BG,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(125, 150, 116, 0.15)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Quote Icon */}
        <Box sx={{ 
          position: 'absolute',
          top: -20,
          left: 24,
          background: ACCENT_SOLID,
          color: 'white',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(125, 150, 116, 0.3)',
        }}>
          <FormatQuote />
        </Box>

        <CardContent sx={{ p: { xs: 3, md: 4 }, pt: 5 }}>
          {/* Rating */}
          {currentTestimonial.rating && (
            <Box sx={{ display: 'flex', mb: 2, justifyContent: 'center' }}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  sx={{
                    color: index < currentTestimonial.rating! ? '#ffc107' : '#e0e0e0',
                    fontSize: 20,
                  }}
                />
              ))}
            </Box>
          )}

          {/* Testimonial Text */}
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              color: 'text.primary',
              mb: 3,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
          >
            "{currentTestimonial.body}"
          </Typography>

          {/* Customer Name */}
          <Typography
            variant="subtitle1"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              color: ACCENT_SOLID,
            }}
          >
            {currentTestimonial.name}
          </Typography>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      {testimonials.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <IconButton
            onClick={goToPrevious}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              border: `1px solid ${ACCENT_SOLID}`,
              color: ACCENT_SOLID,
              '&:hover': {
                background: ACCENT_SOLID,
                color: 'white',
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            onClick={goToNext}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              border: `1px solid ${ACCENT_SOLID}`,
              color: ACCENT_SOLID,
              '&:hover': {
                background: ACCENT_SOLID,
                color: 'white',
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dots Indicator */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              justifyContent: 'center', 
              mt: 3 
            }}
          >
            {testimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: index === currentIndex ? ACCENT_SOLID : 'rgba(125, 150, 116, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: ACCENT_SOLID,
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};