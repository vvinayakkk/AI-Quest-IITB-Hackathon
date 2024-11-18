import { useEffect, useRef } from 'react';
import * as THREE from 'three';

class Wave {
  constructor(color = 0x4f46e5) {
    this.geometry = new THREE.PlaneGeometry(
      window.innerWidth * 2,
      window.innerHeight * 2,
      128,
      128
    );
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying float vElevation;
  
          void main() {
            vUv = uv;
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            
            float elevation = sin(modelPosition.x * 0.3 + uTime) * 0.3
              * sin(modelPosition.y * 0.2 + uTime) * 0.3;
            
            modelPosition.z = elevation;
            vElevation = elevation;
  
            gl_Position = projectionMatrix * viewMatrix * modelPosition;
          }
        `,
      fragmentShader: `
          uniform vec3 uColor;
          varying float vElevation;
  
          void main() {
            float alpha = (vElevation + 0.3) * 0.5;
            gl_FragColor = vec4(uColor, alpha * 0.8); // Adjusted for better visibility
          }
        `,
      transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.position.y = -2; // Adjusted closer to camera
    this.time = 0;
  }

  update() {
    this.time += 0.005;
    this.material.uniforms.uTime.value = this.time;
  }
}

const BackgroundAnimation = ({ particleSize = 0.1 }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const waveRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 5, 15); // Adjusted camera position
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Create wave
    const wave = new Wave();
    scene.add(wave.mesh);
    waveRef.current = wave;

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 9000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
     
    // crete a texture
    const particleTexture = new THREE.TextureLoader().load('/circle.png');
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;

      colors[i] = 0.5 + Math.random() * 0.5;
      colors[i + 1] = 0.5 + Math.random() * 0.5;
      colors[i + 2] = 1;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    );



    const particlesMaterial = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (waveRef.current) {
        waveRef.current.update();
      }

      particles.rotation.y += 0.0025;
      particles.rotation.x += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      wave.geometry.dispose();
      wave.material.dispose();
      renderer.dispose();
    };
  }, [particleSize]);

  return (
    <canvas
      ref={containerRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
    />
  );
};

export default BackgroundAnimation;
