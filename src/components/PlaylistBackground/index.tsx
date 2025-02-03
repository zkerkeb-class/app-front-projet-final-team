import { useEffect, useRef } from 'react';
import { initializeShader } from '@/components/AudioPlayer/shaders/shaderEffects';

interface PlaylistBackgroundProps {
  colors?: string[];
}

export default function PlaylistBackground({
  colors = ['#9333ea', '#ec4899'],
}: PlaylistBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Définir la taille du canvas
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    // Initialiser la taille
    updateCanvasSize();

    // Créer l'effet shader
    const shaderEffect = initializeShader(canvas, colors);

    // Fonction d'animation
    const animate = () => {
      shaderEffect.animate(0.5);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Démarrer l'animation
    animate();

    // Gérer le redimensionnement
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
      shaderEffect.cleanup();
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        filter: 'blur(20px) brightness(0.8)',
        transform: 'scale(1.1)',
        zIndex: 0,
        opacity: 1,
        willChange: 'transform',
      }}
    />
  );
}
