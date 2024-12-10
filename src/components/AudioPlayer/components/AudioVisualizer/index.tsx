// src/components/AudioPlayer/AudioVisualizer/index.tsx
import { useEffect, useRef } from 'react';
import { extractColors } from '@/utils/colorExtractor';
import { initializeShader } from '../../shaders/shaderEffects';

interface AudioVisualizerProps {
  coverUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
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

  useEffect(() => {
    if (!canvasRef.current || !isFullscreen) return;

    const initializeAudioAnalyser = async () => {
      if (!audioContextRef.current) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        if (audioRef.current && !sourceRef.current) {
          const source = audioContext.createMediaElementSource(
            audioRef.current,
          );
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          sourceRef.current = source;
        }

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      }
    };

    const setupVisualizer = async () => {
      const colors = await extractColors(coverUrl);
      const { animate } = initializeShader(canvasRef.current!, colors);
      animationRef.current = { animate };
    };

    const animate = () => {
      if (!isFullscreen) return;

      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      animationRef.current.animate();
      requestAnimationFrame(animate);
    };

    initializeAudioAnalyser().then(() => {
      setupVisualizer().then(() => {
        animate();
      });
    });

    return () => {
      if (audioContextRef.current && !isFullscreen) {
        audioContextRef.current.suspend();
      }
    };
  }, [coverUrl, isFullscreen, audioRef]);

  if (!isFullscreen) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10"
      style={{ filter: 'blur(30px)' }}
    />
  );
}
