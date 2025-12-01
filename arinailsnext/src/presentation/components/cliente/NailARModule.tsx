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
        // Abrir cámara
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Inicializar MediaPipe Hands
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        handRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        setIsLoading(false);
        renderLoop();
      } catch (error: any) {
        console.error('Error initializing AR:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraError('Permiso de cámara denegado.');
          setNeedsPermission(true);
        } else {
          setCameraError('Error al acceder a la cámara. Verifica que tu dispositivo tenga cámara.');
        }
        setIsLoading(false);
      }
    };

    const renderLoop = async () => {
      if (!running) return;
      if (!videoRef.current || !canvasRef.current || !designImgRef.current) {
        raf = requestAnimationFrame(renderLoop);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Procesar manos
      const results = handRef.current?.detectForVideo(video, performance.now());
      if (results?.landmarks) {
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
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error requesting camera:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Debes permitir el acceso a la cámara en la configuración de tu navegador.');
        setNeedsPermission(true);
      } else {
        setCameraError('Error al acceder a la cámara.');
      }
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
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: '#7d9674' }} />
            <Stack spacing={1} alignItems="center">
              <Videocam sx={{ fontSize: 40, color: '#7d9674' }} />
              <Typography color="text.secondary">
                Iniciando cámara y detector de manos...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Asegúrate de permitir el acceso a la cámara
              </Typography>
            </Stack>
          </Box>
        )}

        {cameraError && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" sx={{ mb: needsPermission ? 2 : 0 }}>
              {cameraError}
            </Alert>
            {needsPermission && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
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
              </Box>
            )}
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
