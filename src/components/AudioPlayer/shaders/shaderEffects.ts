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
  uniform vec3 colors[2];
  uniform float time;
  uniform vec2 resolution;
  uniform float audioIntensity;
  varying vec2 vUv;
  
  float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    vec2 uv = vUv;
    float noiseValue = noise(uv * 3.0 + time * 0.2) * 2.0 - 1.0;
    
    // Créer un dégradé dynamique entre les deux couleurs
    float gradient = uv.y + sin(uv.x * 4.0 + time + noiseValue) * 0.2;
    gradient = gradient + audioIntensity * noise(uv * 5.0 + time) * 0.3;
    
    // Mélanger les deux couleurs avec le gradient
    vec3 color = mix(colors[0], colors[1], gradient);
    
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
  const rgbColors = colors.map(hexToRgb).flat();

  // Vérifier si les couleurs sont assez différentes
  const colorArrays: number[][] = [];
  for (let i = 0; i < rgbColors.length; i += 3) {
    colorArrays.push(rgbColors.slice(i, i + 3));
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
