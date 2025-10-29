/**
 * Site Configuration
 * Centralized configuration for static content, contact info, and business data
 */

export const SITE_CONFIG = {
  // Business Information
  business: {
    name: 'Ari Nails',
    tagline: 'Belleza y Elegancia en tus Manos',
    description: 'Expertos en manicura, diseño de uñas y cuidado profesional. Tu satisfacción es nuestra prioridad.',
    logo: '/logo.png',
  },

  // Contact Information
  contact: {
    address: 'Industrial el Palmito, calle Mayas #2750',
    city: 'Culiacan, Sinaloa',
    email: 'email@email.com',
    latitude: 24.7780323028564,
    longitude: -107.431053161621,
  },

  // Business Hours
  hours: {
    weekdays: 'Lun - Vie: 9:00 AM - 8:00 PM',
    saturday: 'Sáb: 9:00 AM - 7:00 PM',
    sunday: 'Dom: 10:00 AM - 5:00 PM',
    holidays: 'Días festivos: Cerrado',
  },

  // Social Media
  social: {
    facebook: 'https://facebook.com/arinails',
    instagram: 'https://instagram.com/arinails',
    tiktok: 'https://tiktok.com/@arinails',
    whatsapp: 'https://wa.me/525512345678',
  },

  // Pricing Plans
  pricingPlans: [
    {
      id: 'basico',
      title: 'Set completo - Cortas',
      price: '$450',
      originalPrice: '$500',
      duration: '60 min',
      popular: false,
      bullets: [
        'Manicura clásica completa',
        'Gel de contruccion',
        'Esmaltado',
      ]
    },
    {
      id: 'luxury',
      title: 'Personalizado',
      price: null,
      originalPrice: '$1400',
      duration: '120 min',
      popular: false,
      bullets: [
        'Elige tus servicios favoritos',
        'Diseño artístico avanzado',

      ]
    }
  ],

  // Testimonials
  testimonials: [
    {
      id: 1,
      name: 'María González',
      rating: 5,
      body: 'Excelente servicio, mis uñas quedaron perfectas. El diseño superó mis expectativas. Totalmente recomendado!',
      date: '2024-03-15',
      service: 'Premium'
    },
    {
      id: 2,
      name: 'Ana Martínez',
      rating: 5,
      body: 'El mejor salón de uñas que he visitado. Muy profesionales, atentos y el ambiente es súper relajante.',
      date: '2024-03-10',
      service: 'Luxury Spa'
    },
    {
      id: 3,
      name: 'Laura Sánchez',
      rating: 5,
      body: 'Me encantó el diseño que me hicieron. La calidad del trabajo es impresionante. Volveré sin duda.',
      date: '2024-03-08',
      service: 'Premium'
    },
    {
      id: 4,
      name: 'Carmen López',
      rating: 5,
      body: 'Ambiente muy agradable y resultados increíbles. El tratamiento spa fue una experiencia maravillosa.',
      date: '2024-03-05',
      service: 'Luxury Spa'
    },
    {
      id: 5,
      name: 'Isabel Rodríguez',
      rating: 5,
      body: 'Mis uñas nunca habían lucido tan bien. El arte que hacen es verdaderamente profesional. ¡Gracias!',
      date: '2024-03-01',
      service: 'Premium'
    }
  ],

  // Content Sections
  content: {
    hero: {
      title: 'Belleza y Elegancia en tus Manos',
      subtitle: 'Expertos en manicura, diseño de uñas y cuidado profesional. Tu satisfacción es nuestra prioridad.',
      ctaText: 'Reservar cita',
      ctaSecondary: 'Ver Servicios'
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Elige el paquete perfecto para ti',
      ctaText: 'Seleccionar horario'
    },
    testimonials: {
      title: 'Lo que Dicen Nuestros Clientes',
      subtitle: 'La satisfacción de nuestros clientes es nuestra mayor recompensa'
    },
    contact: {
      title: '¿Listo para Transformar tus Uñas?',
      subtitle: 'Agenda tu cita hoy y déjanos cuidar de ti',
      ctaText: 'Agendar Cita',
      placeholderImage: 'Imagen del Salón'
    }
    ,
    // Policies heading for UI
    policiesContent: {
      title: 'Politicas y Condiciones'
    }
  },

  // Features/Services Details
  features: [
    {
      title: 'Productos Premium',
      description: 'Utilizamos solo las mejores marcas del mercado',
      icon: '💎'
    },
    {
      title: 'Diseños Únicos',
      description: 'Creamos arte personalizado para cada cliente',
      icon: '🎨'
    },
    {
      title: 'Ambiente Relajante',
      description: 'Disfruta de una experiencia spa completa',
      icon: '🌿'
    },
    {
      title: 'Profesionales Certificados',
      description: 'Nuestro equipo está altamente capacitado',
      icon: '🏆'
    }
  ],

  // Policies / Terms (for Policies and Conditions card)
  policies: [
    {
      id: 'anticipo',
      title: 'Anticipo',
      body: 'Se requiere un anticipo del 30% para reservar citas en paquetes especiales o servicios de larga duración. El anticipo asegura tu horario y permite una mejor planificación del personal.'
    },
    {
      id: 'costos_retiro',
      title: 'Costos de retiro',
      body: 'En caso de retiro de una aplicación de uñas antes del tiempo recomendado, puede aplicarse un cargo adicional según el servicio y los materiales utilizados.'
    },
    {
      id: 'cotizaciones',
      title: 'Cotizaciones especiales',
      body: 'Ofrecemos cotizaciones personalizadas para diseños complejos o servicios a domicilio. Las cotizaciones son válidas por 7 días y pueden requerir una visita previa.'
    },
    {
      id: 'tiempos_servicio',
      title: 'Tiempos de servicio',
      body: 'Los tiempos estimados son orientativos. Recomendamos llegar 10 minutos antes de tu cita. Retrasos superiores a 15 minutos podrían requerir reprogramación.'
    }
  ],

  // SEO and Meta
  seo: {
    title: 'Ari Nails - El Mejor Salón de Uñas | Manicura Premium',
    description: 'Salón de uñas premium especializado en manicura, diseño artístico y tratamientos spa. Agenda tu cita hoy mismo.',
    keywords: 'salón de uñas, manicura, pedicura, diseño de uñas, nail art, spa de uñas, gel, acrílico',
    author: 'Ari Nails'
  }
} as const;

// Helper functions for accessing config data
export const getBusinessInfo = () => SITE_CONFIG.business;
export const getContactInfo = () => SITE_CONFIG.contact;
export const getPricingPlans = () => SITE_CONFIG.pricingPlans;
export const getTestimonials = () => SITE_CONFIG.testimonials;
export const getContent = () => SITE_CONFIG.content;
export const getFeatures = () => SITE_CONFIG.features;
export const getSocialLinks = () => SITE_CONFIG.social;
export const getBusinessHours = () => SITE_CONFIG.hours;
export const getPolicies = () => SITE_CONFIG.policies;