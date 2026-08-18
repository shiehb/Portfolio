// components/ShaderBackground.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader with wave animation
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  
  varying vec2 vUv;

  // Simplex noise function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouse = uMouse * 0.5 + 0.5;
    
    // Center UV
    vec2 center = uv - 0.5;
    center.x *= uResolution.x / uResolution.y;
    
    // Wave calculations
    float time = uTime * 0.3;
    
    // Mouse influence
    vec2 mouseOffset = (mouse - 0.5) * 0.8;
    
    // Create multiple wave layers
    float wave1 = sin(center.x * 3.0 + time) * cos(center.y * 2.0 + time * 0.7);
    float wave2 = sin(center.x * 5.0 - time * 0.5) * cos(center.y * 4.0 + time * 0.8);
    float wave3 = sin((center.x + mouseOffset.x) * 4.0 + time * 0.6) * cos((center.y + mouseOffset.y) * 3.0 - time * 0.4);
    
    // FBM noise with mouse influence
    vec2 noiseUv = uv * 2.0 + vec2(time * 0.05, time * 0.03) + mouseOffset * 0.3;
    float noiseValue = fbm(noiseUv);
    
    // Combine waves
    float wave = wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2;
    wave += noiseValue * 0.2;
    wave = wave * 0.5 + 0.5;
    
    // Mouse proximity glow
    float distToMouse = distance(uv, mouse);
    float mouseGlow = 1.0 - smoothstep(0.0, 0.6, distToMouse);
    
    // Create color gradients
    vec3 color1 = uColor1;
    vec3 color2 = uColor2;
    vec3 color3 = uColor3;
    
    // Blend colors based on wave and noise
    float blend1 = wave;
    float blend2 = noiseValue * 0.6 + 0.2;
    float blend3 = mouseGlow * 0.4;
    
    vec3 color = mix(color1, color2, blend1);
    color = mix(color, color3, blend2 * 0.3);
    
    // Add mouse glow effect
    color += mouseGlow * vec3(0.8, 0.3, 0.1) * 0.15;
    
    // Add subtle edge glow
    float edgeGlow = 1.0 - abs(uv.y - 0.5) * 1.5;
    color += vec3(0.2, 0.05, 0.0) * edgeGlow * 0.05;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Shader Mesh Component
function ShaderMesh({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const uniforms = useRef({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(mousePosition.x, mousePosition.y) },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
    uColor1: { value: new THREE.Color(0x1a1a1a) }, // Dark
    uColor2: { value: new THREE.Color(0xfd551d) }, // Orange
    uColor3: { value: new THREE.Color(0x8b2f15) }, // Dark orange
  });

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.current.uTime.value = state.clock.getElapsedTime();
      uniforms.current.uMouse.value.lerp(
        new THREE.Vector2(mousePosition.x, mousePosition.y),
        0.05
      );
    }
  });

  // Update resolution on resize
  useEffect(() => {
    uniforms.current.uResolution.value.set(viewport.width, viewport.height);
  }, [viewport]);

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// Main Component
interface ShaderBackgroundProps {
  className?: string;
  colors?: {
    color1?: string;
    color2?: string;
    color3?: string;
  };
}

export default function ShaderBackground({ 
  className = "",
  colors = {
    color1: "#1a1a1a",
    color2: "#fd551d",
    color3: "#8b2f15"
  }
}: ShaderBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      setMousePosition({ 
        x: Math.min(1, Math.max(0, x)), 
        y: Math.min(1, Math.max(0, y)) 
      });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0.5, y: 0.5 });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none'
        }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <ShaderMesh mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}