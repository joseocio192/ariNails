'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Divider,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Payment as PaymentIcon,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { useGetServicios } from '../../hooks/useServicios';
import { useUserRole } from '../../hooks/useUserRole';
import { useToast } from '../../hooks/useToast';
import { CitaFormData } from './AgendarCitaModule';
import { DIContainer } from '@/core/di/DIContainer';
import { IHttpClient } from '@/core/infrastructure/http/AxiosHttpClient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Inicializar Stripe con la clave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const ANTICIPO_AMOUNT = 200; // 200 pesos de anticipo

interface CheckoutStepProps {
    citaData: CitaFormData;
    onBack: () => void;
    onComplete: () => void;
}

/**
 * Formulario de pago interno
 */
const CheckoutForm: React.FC<{
    citaData: CitaFormData;
    servicios: any[];
    onSuccess: () => void;
    onBack: () => void;
}> = ({ citaData, servicios, onSuccess, onBack }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { clienteId } = useUserRole();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const diContainer = DIContainer.getInstance();
    const httpClient = diContainer.get<IHttpClient>('IHttpClient');

    const serviciosSeleccionados = servicios.filter((s) =>
        citaData.serviciosIds.includes(s.id)
    );

    const totalServicios = serviciosSeleccionados.reduce(
        (sum, s) => sum + Number(s.precio),
        0
    );

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!clienteId) {
            showToast('error', 'No se encontró el ID del cliente');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // 1. Crear el Payment Intent en el backend
            const paymentIntentResponse = await httpClient.post<{
                clientSecret: string;
                paymentIntentId: string;
            }>('/stripe/create-payment-intent', {
                amount: ANTICIPO_AMOUNT * 100, // Stripe maneja centavos
                currency: 'mxn',
            });

            const { clientSecret } = paymentIntentResponse;

            // 2. Confirmar el pago con Stripe
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('No se pudo obtener el elemento de tarjeta');
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent?.status === 'succeeded') {
                // 3. Crear la cita en el backend
                await httpClient.post('/citas', {
                    clienteId,
                    horarioId: citaData.horarioId,
                    serviciosIds: citaData.serviciosIds,
                    fecha: citaData.fecha,
                    hora: citaData.hora,
                    anticipoPagado: ANTICIPO_AMOUNT,
                    stripePaymentIntentId: paymentIntent.id,
                });

                // 4. Invalidar las queries para refrescar los datos
                await queryClient.invalidateQueries({ queryKey: ['citas'] });
                await queryClient.invalidateQueries({ queryKey: ['horarios'] });

                showToast('success', '¡Cita agendada exitosamente! Te esperamos.');
                onSuccess();
            }
        } catch (err: any) {
            console.error('Error al procesar el pago:', err);
            setError(err.message || 'Error al procesar el pago');
            showToast('error', 'Error al agendar la cita. Por favor, intenta nuevamente.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                {/* Resumen de la cita */}
                <Grid item xs={12} md={7}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                        Resumen de la Cita
                    </Typography>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            {/* Información del horario */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="subtitle1" fontWeight="600">
                                        {citaData.empleadoNombre}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 4 }}>
                                    <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {citaData.fecha &&
                                            format(parseISO(citaData.fecha), "EEEE, d 'de' MMMM 'de' yyyy", {
                                                locale: es,
                                            })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
                                    <TimeIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {citaData.hora}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Servicios seleccionados */}
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Servicios:
                            </Typography>
                            {serviciosSeleccionados.map((servicio) => (
                                <Box
                                    key={servicio.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1,
                                    }}
                                >
                                    <Typography variant="body2">{servicio.nombre}</Typography>
                                    <Typography variant="body2" fontWeight="600">
                                        ${servicio.precio}
                                    </Typography>
                                </Box>
                            ))}

                            <Divider sx={{ my: 2 }} />

                            {/* Total de Servicios */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="600">
                                    Total de Servicios:
                                </Typography>
                                <Typography variant="h6" color="text.primary" fontWeight="700">
                                    ${totalServicios.toFixed(2)} MXN
                                </Typography>
                            </Box>

                            {/* Anticipo */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Anticipo a pagar ahora:
                                </Typography>
                                <Typography variant="body1" color="success.main" fontWeight="600">
                                    -${ANTICIPO_AMOUNT.toFixed(2)} MXN
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Restante */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="700">
                                    Falta por pagar:
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="700">
                                    ${(totalServicios - ANTICIPO_AMOUNT).toFixed(2)} MXN
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mb: 0 }}>
                                <Typography variant="body2">
                                    <strong>💳 Anticipo requerido: ${ANTICIPO_AMOUNT.toFixed(2)} MXN</strong>
                                    <br />
                                    El resto (${(totalServicios - ANTICIPO_AMOUNT).toFixed(2)} MXN) se pagará al finalizar los servicios.
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Formulario de pago */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="600">
                                Información de Pago
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Ingresa los datos de tu tarjeta para pagar el anticipo
                        </Typography>

                        <Box
                            sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 3,
                            }}
                        >
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#9e2146',
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h5" fontWeight="700" textAlign="center">
                                Total a Pagar: ${ANTICIPO_AMOUNT} MXN
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={!stripe || processing}
                            startIcon={processing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {processing ? 'Procesando...' : 'Confirmar y Pagar'}
                        </Button>

                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            onClick={onBack}
                            disabled={processing}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Atrás
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </form>
    );
};

/**
 * Paso 3: Checkout y pago
 * Muestra resumen de la cita y procesa el pago del anticipo
 */
export const CheckoutStep: React.FC<CheckoutStepProps> = ({
    citaData,
    onBack,
    onComplete,
}) => {
    const { data: servicios, isLoading } = useGetServicios();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight="600">
                Confirmar y Pagar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Revisa los detalles de tu cita y completa el pago del anticipo
            </Typography>

            <Elements stripe={stripePromise}>
                <CheckoutForm
                    citaData={citaData}
                    servicios={servicios || []}
                    onSuccess={onComplete}
                    onBack={onBack}
                />
            </Elements>
        </Box>
    );
};
