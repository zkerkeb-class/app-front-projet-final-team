import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform vec3 colors[3];
  uniform float time;
  uniform vec2 resolution;
  uniform float audioIntensity;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Mouvement de base modulé par l'intensité audio
    float movement = sin(uv.x * 2.0 + time) * 0.5 + 0.5;
    movement *= sin(uv.y * 2.0 + time * 0.5) * 0.5 + 0.5;
    
    // Ajouter une modulation basée sur l'intensité audio
    movement += audioIntensity * 0.2 * sin(uv.x * 10.0 + time * 2.0);
    
    // Mélange des couleurs avec influence de l'audio
    vec3 color = mix(
      mix(colors[0], colors[1], movement),
      colors[2],
      sin(time * 0.2 + audioIntensity) * 0.5 + 0.5
    );
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex: string): number[] => {
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    console.error('Invalid hex color format:', hex);
    return [0, 0, 0];
  }
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

/**
 * Calculate color difference using Delta E (CIE76)
 */
const getColorDifference = (color1: number[], color2: number[]): number => {
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

/**
 * Get fallback colors if extracted colors are too similar
 */
const getFallbackColors = (): number[][] => [
  [0.8, 0.2, 0.2], // Rouge vif
  [0.2, 0.6, 0.8], // Bleu clair
  [0.8, 0.7, 0.2], // Jaune doré
];

/**
 * Initialize and compile a WebGL shader
 */
// const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
//   const shader = gl.createShader(type);
//   if (!shader) {
//     console.error('Failed to create shader');
//     return null;
//   }

//   gl.shaderSource(shader, source);
//   gl.compileShader(shader);

//   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//     console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
//     gl.deleteShader(shader);
//     return null;
//   }
//   return shader;
// };

// Add Three.js scene setup
const setupScene = () => {
  const scene = new THREE.Scene();

  // Utiliser une caméra orthographique pour le shader
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  // Création du plan pour le shader
  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      colors: { value: [] },
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2() },
      audioIntensity: { value: 0.0 },
    },
  });
  const plane = new THREE.Mesh(planeGeometry, material);
  scene.add(plane);

  /* Code du cube commenté
  // Ajout du cube rouge de debug
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);
  */

  return { scene, camera, material };
};

/**
 * Initialize WebGL shader effects
 */
export const initializeShader = (
  canvas: HTMLCanvasElement,
  colors: string[],
) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  const { scene, camera, material } = setupScene();
  let rgbColors = colors.map(hexToRgb).flat();

  // Vérifier si les couleurs sont assez différentes
  const colorArrays: number[][] = [];
  for (let i = 0; i < rgbColors.length; i += 3) {
    colorArrays.push(rgbColors.slice(i, i + 3));
  }

  // Vérifier la différence entre les couleurs
  const minDifference = 0.1; // Seuil minimum de différence
  const needsFallback = colorArrays.some((color1, i) =>
    colorArrays.some(
      (color2, j) =>
        i !== j && getColorDifference(color1, color2) < minDifference,
    ),
  );

  // Utiliser les couleurs de fallback si nécessaire
  if (needsFallback) {
    console.info('Using fallback colors due to low contrast');
    rgbColors = getFallbackColors().flat();
  }

  const startTime = Date.now();

  const resizeCanvas = () => {
    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;

    renderer.setSize(width, height, false);
    material.uniforms.resolution.value.set(width, height);
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const animate = (audioIntensity = 0) => {
    const time = (Date.now() - startTime) / 1000;

    /* Animation du cube commentée
    const cube = scene.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry);
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    */

    material.uniforms.time.value = time;
    material.uniforms.colors.value = rgbColors;
    material.uniforms.audioIntensity.value = audioIntensity;

    renderer.render(scene, camera);
  };

  return {
    animate,
    cleanup: () => {
      window.removeEventListener('resize', resizeCanvas);
      renderer.dispose();
      material.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    },
  };
};
