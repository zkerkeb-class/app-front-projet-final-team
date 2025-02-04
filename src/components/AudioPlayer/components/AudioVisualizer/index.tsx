// src/components/AudioPlayer/AudioVisualizer/index.tsx
import { useEffect, useRef } from 'react';
import { extractColors } from '@/utils/colorExtractor';
import { initializeShader } from '../../shaders/shaderEffects';

interface AudioVisualizerProps {
  coverUrl: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isFullscreen: boolean;
}

export default function AudioVisualizer({
  coverUrl,
  audioRef,
  isFullscreen,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<{ animate: () => void }>({ animate: () => {} });
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!canvasRef.current || !isFullscreen || !audioRef.current) return;

    const initializeAudioAnalyser = async () => {
      try {
        // Réutiliser le contexte audio existant s'il existe
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }

        // Créer un nouvel analyseur si nécessaire
        if (!analyserRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
        }

        // Créer une nouvelle source seulement si nécessaire
        if (!sourceRef.current && audioRef.current) {
          try {
            sourceRef.current =
              audioContextRef.current.createMediaElementSource(
                audioRef.current,
              );
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
          } catch (error) {
            if (
              error instanceof DOMException &&
              error.name === 'InvalidStateError'
            ) {
              console.warn('Audio source already connected');
            } else {
              console.error('Error creating audio source:', error);
            }
          }
        }

        // Reprendre le contexte audio s'il est suspendu
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.error('Error initializing audio analyser:', error);
      }
    };

    const setupVisualizer = async () => {
      try {
        const colors = ['#8a61c8', '#9d7fa7', '#2a232b'];
        const { animate } = initializeShader(canvasRef.current!, colors);
        animationRef.current = { animate };
      } catch (error) {
        console.error('Error setting up visualizer:', error);
      }
    };

    const animate = () => {
      if (!isFullscreen) return;

      try {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount,
          );
          analyserRef.current.getByteFrequencyData(dataArray);
        }

        animationRef.current.animate();
        animationFrameRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Error in animation frame:', error);
      }
    };

    // Initialisation séquentielle
    const initialize = async () => {
      await initializeAudioAnalyser();
      await setupVisualizer();
      animate();
    };

    initialize();

    // Nettoyage
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (!isFullscreen) {
        // Déconnecter la source et l'analyseur
        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch (error) {
            console.warn('Error disconnecting source:', error);
          }
        }
        if (analyserRef.current) {
          try {
            analyserRef.current.disconnect();
          } catch (error) {
            console.warn('Error disconnecting analyser:', error);
          }
        }
        // Réinitialiser les refs
        sourceRef.current = null;
        analyserRef.current = null;
      }
    };
  }, [coverUrl, isFullscreen, audioRef]);

  if (!isFullscreen) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden"
      style={{
        filter: 'blur(30px)',
        transform: 'scale(1.2)',
        clipPath: 'inset(0)',
      }}
    />
  );
}
