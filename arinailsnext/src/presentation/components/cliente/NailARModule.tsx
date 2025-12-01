"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  Stack,
  Chip,
  Container,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Videocam,
  CheckCircle,
} from '@mui/icons-material';
import { useGetDisenosActivos } from '@/presentation/hooks/useDisenos';
import type { DisenoUna } from '@/core/domain/types/disenos';
import { CARD_BG } from '@/presentation/theme/colors';

const FINGERTIPS = [4, 8, 12, 16, 20];
const PIP_JOINTS = [2, 6, 10, 14, 18];

export function NailARModule() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handRef = useRef<HandLandmarker | null>(null);
  const designImgRef = useRef<HTMLImageElement | null>(null);
  const isInitializedRef = useRef(false);
  const [selectedDiseno, setSelectedDiseno] = useState<DisenoUna | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cameraStatus, setCameraStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [mediapipeStatus, setMediapipeStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Obtener diseños disponibles
  const { data: disenos, isLoading: loadingDisenos } = useGetDisenosActivos();

  useEffect(() => {
    // Prevenir inicialización múltiple (React Strict Mode)
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    let running = true;
    let raf = 0;

    const init = async () => {
      try {
        // Verificar si getUserMedia está disponible
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia no está soportado en este navegador');
        }

        // Abrir cámara con configuración más robusta
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!videoRef.current) {
          throw new Error('Video element not found');
        }

        videoRef.current.srcObject = stream;
        
        // Esperar a que el video esté listo antes de play()
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video ref lost'));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => resolve())
                .catch(reject);
            }
          };
          
          // Timeout de seguridad
          setTimeout(() => reject(new Error('Video loading timeout')), 10000);
        });

        console.log('✅ Cámara iniciada correctamente');
        setCameraStatus('ready');

        // Inicializar MediaPipe Hands
        setMediapipeStatus('loading');
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        
        handRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log('✅ MediaPipe Hand Landmarker iniciado');
        setMediapipeStatus('ready');

        setIsLoading(false);
        renderLoop();
      } catch (error: any) {
        console.error('❌ Error initializing AR:', error);
        setCameraStatus('error');
        setMediapipeStatus('error');
        
        let errorMessage = 'Error al acceder a la cámara.';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso en la configuración de tu navegador.';
          setNeedsPermission(true);
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage = 'La cámara está siendo usada por otra aplicación. Por favor, ciérrala e intenta de nuevo.';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
          errorMessage = 'La cámara no cumple con los requisitos necesarios.';
        } else if (error.name === 'TypeError') {
          errorMessage = 'getUserMedia no está soportado en este navegador. Usa Chrome, Firefox o Safari actualizado.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'La cámara tardó demasiado en iniciar. Por favor, recarga la página.';
        }
        
        setCameraError(errorMessage);
        setIsLoading(false);
      }
    };

    const renderLoop = async () => {
      if (!running) return;
      if (!videoRef.current || !canvasRef.current) {
        raf = requestAnimationFrame(renderLoop);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        raf = requestAnimationFrame(renderLoop);
        return;
      }

      // Verificar que el video esté listo
      if (video.readyState < 2) {
        raf = requestAnimationFrame(renderLoop);
        return;
      }
      
      // Ajustar tamaño del canvas si cambió
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Limpiar y dibujar video
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Procesar manos solo si hay un diseño seleccionado y la imagen está cargada
      if (handRef.current && designImgRef.current && selectedDiseno) {
        try {
          const results = handRef.current.detectForVideo(video, performance.now());
          
          if (results?.landmarks && results.landmarks.length > 0) {
            for (const handLandmarks of results.landmarks) {
              for (let i = 0; i < FINGERTIPS.length; i++) {
                const tip_id = FINGERTIPS[i];
                const pip_id = PIP_JOINTS[i];
                const mcp_id = pip_id - 1; // Metacarpofalángico
                
                const tip = handLandmarks[tip_id];
                const pip = handLandmarks[pip_id];
                const mcp = handLandmarks[mcp_id];

                const w = canvas.width;
                const h = canvas.height;

                const tip_xy = [tip.x * w, tip.y * h];
                const pip_xy = [pip.x * w, pip.y * h];
                const mcp_xy = [mcp.x * w, mcp.y * h];

                // Dirección del dedo
                const vec = [tip_xy[0] - pip_xy[0], tip_xy[1] - pip_xy[1]];
                const norm = Math.hypot(vec[0], vec[1]);
                if (norm === 0) continue;

                // Tamaño del sticker basado en las articulaciones
                const nail_width = Math.hypot(pip_xy[0] - mcp_xy[0], pip_xy[1] - mcp_xy[1]) * 0.6;
                const nail_height = Math.hypot(tip_xy[0] - pip_xy[0], tip_xy[1] - pip_xy[1]) * 0.7;

                // Centro de la uña (punta del dedo)
                const center = tip_xy;

                // Ángulo para rotar el sticker en la dirección del dedo
                const angle = Math.atan2(tip_xy[1] - pip_xy[1], tip_xy[0] - pip_xy[0]) - Math.PI / 2;

                ctx.save();
                ctx.translate(center[0], center[1]);
                ctx.rotate(angle);
                ctx.drawImage(
                  designImgRef.current,
                  -nail_width / 2,
                  -nail_height / 2,
                  nail_width,
                  nail_height
                );
                ctx.restore();
              }
            }
          }
        } catch (error) {
          console.error('Error en detección de manos:', error);
        }
      }

      raf = requestAnimationFrame(renderLoop);
    };

    init();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
      handRef.current?.close();
      isInitializedRef.current = false;
    };
  }, []);

  const requestCameraAccess = async () => {
    try {
      setIsLoading(true);
      setCameraError('');
      setNeedsPermission(false);
      
      // Verificar soporte del navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no está soportado en este navegador');
      }

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }
      
      videoRef.current.srcObject = stream;
      
      // Esperar a que el video esté listo
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Video ref lost'));
          return;
        }
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('✅ Cámara reiniciada correctamente');
                resolve();
              })
              .catch(reject);
          }
        };
        
        setTimeout(() => reject(new Error('Video loading timeout')), 10000);
      });
      
      setIsLoading(false);
      window.location.reload(); // Recargar para reinicializar MediaPipe
    } catch (error: any) {
      console.error('❌ Error requesting camera:', error);
      
      let errorMessage = 'Error al acceder a la cámara.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Debes permitir el acceso a la cámara en la configuración de tu navegador. Después recarga la página.';
        setNeedsPermission(true);
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      }
      
      setCameraError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDiseno) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = `${process.env.NEXT_PUBLIC_API_URL}${selectedDiseno.imagenUrl}`;
      img.onload = () => {
        designImgRef.current = img;
      };
    }
  }, [selectedDiseno]);

  // Seleccionar automáticamente el primer diseño si hay diseños disponibles
  useEffect(() => {
    if (disenos && disenos.length > 0 && !selectedDiseno) {
      setSelectedDiseno(disenos[0]);
    }
  }, [disenos, selectedDiseno]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7d9674', mb: 1 }}>
          Probador Virtual de Diseños
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecciona un diseño y muestra tus manos frente a la cámara
        </Typography>
      </Box>

      {/* Carousel de diseños horizontal */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2,
          background: CARD_BG,
          border: '1px solid rgba(125, 150, 116, 0.15)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => handleScroll('left')}
            sx={{
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <ChevronLeft />
          </IconButton>

          <Box
            ref={scrollContainerRef}
            sx={{
              flex: 1,
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'grey.100',
                borderRadius: 1,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'grey.500',
                },
              },
            }}
          >
            {loadingDisenos ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : disenos && disenos.length > 0 ? (
              disenos.map((diseno) => (
                <Card
                  key={diseno.id}
                  sx={{
                    minWidth: 200,
                    maxWidth: 200,
                    cursor: 'pointer',
                    position: 'relative',
                    border: selectedDiseno?.id === diseno.id ? 3 : 0,
                    borderColor: '#7d9674',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => setSelectedDiseno(diseno)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={`${process.env.NEXT_PUBLIC_API_URL}${diseno.imagenUrl}`}
                    alt={diseno.titulo}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                      {diseno.titulo}
                    </Typography>
                    {diseno.descripcion && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {diseno.descripcion}
                      </Typography>
                    )}
                  </Box>
                  {selectedDiseno?.id === diseno.id && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Seleccionado"
                      size="small"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Card>
              ))
            ) : (
              <Alert severity="info" sx={{ width: '100%' }}>
                No hay diseños disponibles en este momento
              </Alert>
            )}
          </Box>

          <IconButton
            onClick={() => handleScroll('right')}
            sx={{
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Paper>

      {/* Video AR centrado */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: CARD_BG,
          border: '1px solid rgba(125, 150, 116, 0.15)',
          borderRadius: 3,
          position: 'relative',
        }}
      >
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 500,
              gap: 3,
            }}
          >
            <CircularProgress sx={{ color: '#7d9674' }} size={60} />
            <Stack spacing={2} alignItems="center">
              <Videocam sx={{ fontSize: 40, color: '#7d9674' }} />
              <Typography variant="h6" color="text.primary" fontWeight="bold">
                Iniciando Sistema AR
              </Typography>
              
              {/* Indicadores de progreso */}
              <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: cameraStatus === 'ready' ? '#4caf50' : cameraStatus === 'error' ? '#f44336' : '#ff9800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {cameraStatus === 'ready' ? '✓' : cameraStatus === 'error' ? '✗' : '...'}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {cameraStatus === 'initializing' && 'Conectando con la cámara...'}
                    {cameraStatus === 'ready' && 'Cámara conectada'}
                    {cameraStatus === 'error' && 'Error en cámara'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: mediapipeStatus === 'ready' ? '#4caf50' : mediapipeStatus === 'error' ? '#f44336' : '#ff9800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {mediapipeStatus === 'ready' ? '✓' : mediapipeStatus === 'error' ? '✗' : '...'}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {mediapipeStatus === 'loading' && 'Cargando detector de manos...'}
                    {mediapipeStatus === 'ready' && 'Detector de manos listo'}
                    {mediapipeStatus === 'error' && 'Error en detector'}
                  </Typography>
                </Box>
              </Stack>

              <Alert severity="info" sx={{ mt: 2, maxWidth: 400 }}>
                <strong>Primera vez:</strong> Tu navegador puede solicitar permiso para usar la cámara. 
                Por favor, acepta para continuar.
              </Alert>
            </Stack>
          </Box>
        )}

        {cameraError && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" sx={{ mb: needsPermission ? 2 : 0 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                {cameraError}
              </Typography>
              
              {/* Información de diagnóstico */}
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                <strong>Navegador:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Desconocido'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                <strong>Soporte getUserMedia:</strong> {navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' ? '✓ Soportado' : '✗ No soportado'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                <strong>HTTPS:</strong> {window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? '✓ Seguro' : '✗ Se requiere HTTPS'}
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {needsPermission && (
                <button
                  onClick={requestCameraAccess}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#7d9674',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Videocam />
                  Permitir acceso a la cámara
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                🔄 Recargar página
              </button>
            </Box>

            {/* Guía de solución de problemas */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                💡 Solución de problemas:
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                1. Verifica que ninguna otra aplicación esté usando la cámara
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                2. En Chrome: Haz clic en el 🔒 candado → Permisos del sitio → Cámara → Permitir
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                3. Asegúrate de estar usando HTTPS o localhost
              </Typography>
              <Typography variant="caption" component="div">
                4. Prueba con otro navegador (Chrome recomendado)
              </Typography>
            </Alert>
          </Box>
        )}

        {!selectedDiseno && !isLoading && !cameraError && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Selecciona un diseño del carousel superior para comenzar
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <video ref={videoRef} style={{ display: "none" }} />
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 8,
              display: isLoading || cameraError ? 'none' : 'block',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          />

          {selectedDiseno && !isLoading && !cameraError && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(125, 150, 116, 0.95)',
                color: 'white',
                p: 2,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight="bold">
                  📌 {selectedDiseno.titulo}
                </Typography>
                <Typography variant="caption">
                  ✋ Muestra tus manos frente a la cámara
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Instrucciones */}
        {!isLoading && !cameraError && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'rgba(125, 150, 116, 0.08)',
              borderRadius: 2,
              border: '1px solid rgba(125, 150, 116, 0.2)',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#7d9674' }}>
              💡 Consejos para una mejor experiencia:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                • Mantén tus manos bien iluminadas y frente a la cámara
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Abre bien los dedos para que el detector identifique las uñas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Mueve lentamente las manos para ver el diseño desde diferentes ángulos
              </Typography>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Imagen oculta para cargar el diseño */}
      {selectedDiseno && (
        <img
          ref={designImgRef as any}
          src={`${process.env.NEXT_PUBLIC_API_URL}${selectedDiseno.imagenUrl}`}
          alt={selectedDiseno.titulo}
          style={{ display: "none" }}
          crossOrigin="anonymous"
        />
      )}
    </Container>
  );
}
