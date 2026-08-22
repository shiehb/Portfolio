'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Hero3DCanvasProps {
    diffuseMapUrl: string;
    depthMapUrl: string;
    className?: string;
    /**
     * Parallax intensity multiplier.
     * Lower values (0.004 - 0.008) give minimal, subtle luxury movement.
     * Medium values (0.010 - 0.016) give standard 3D depth.
     * Higher values (> 0.020) produce pronounced displacement.
     * @default 0.007
     */
    intensity?: number;
    /**
     * Focal depth plane (0.0 to 1.0) that remains stationary.
     * Defaults to 0.65 (anchors the face/eyes as pivot point).
     * @default 0.65
     */
    focusPlane?: number;
    /**
     * Mouse easing / interpolation factor (0.01 = very slow/smooth, 0.1 = instant).
     * @default 0.05
     */
    smoothing?: number;
    /**
     * Maximum displacement clamp to avoid silhouette tearing.
     * @default 0.012
     */
    maxDisplacement?: number;
    onLoaded?: () => void;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D u_texture;
  uniform sampler2D u_depth;
  uniform vec2 u_mouse;
  uniform vec2 u_intensity;
  uniform float u_focusPlane;
  uniform float u_maxDisplacement;
  uniform vec2 u_resolution;
  uniform vec2 u_imageResolution;

  varying vec2 vUv;

  void main() {
    // Calculate aspect ratio cover UV coordinates matching object-cover
    vec2 s = u_resolution; // Canvas size
    vec2 i = u_imageResolution; // Image natural size

    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 newUv = vUv;

    if (rs > ri) {
      newUv.y = (vUv.y - 0.5) * (ri / rs) + 0.5;
    } else {
      newUv.x = (vUv.x - 0.5) * (rs / ri) + 0.5;
    }

    // Sample depth from red channel (0.0 = background, 1.0 = closest foreground)
    float depth = texture2D(u_depth, newUv).r;

    // Displace relative to focus plane (face plane anchors, foreground pushes forward, background recedes)
    float depthDelta = (depth - u_focusPlane);
    vec2 displacement = u_mouse * depthDelta * u_intensity;

    // Clamp displacement to max distance to prevent edge tearing
    float dispLen = length(displacement);
    if (dispLen > u_maxDisplacement) {
      displacement = (displacement / dispLen) * u_maxDisplacement;
    }

    // Displaced UV coordinates clamped within texture boundaries
    vec2 displacedUv = clamp(newUv + displacement, vec2(0.001), vec2(0.999));

    vec4 origColor = texture2D(u_texture, newUv);
    vec4 dispColor = texture2D(u_texture, displacedUv);

    // Alpha protection: if displaced UV steps into transparent background, smoothly blend back to original
    float alphaWeight = smoothstep(0.02, 0.7, dispColor.a);
    vec4 finalColor = mix(origColor, dispColor, alphaWeight);

    // Zero-displacement preservation for background / non-subject areas
    if (depth < 0.005) {
      finalColor = origColor;
    }

    gl_FragColor = finalColor;
  }
`;

export default function Hero3DCanvas({
    diffuseMapUrl,
    depthMapUrl,
    className = 'w-full h-full',
    intensity = 0.007,
    focusPlane = 0.65,
    smoothing = 0.05,
    maxDisplacement = 0.012,
    onLoaded,
}: Hero3DCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        let animationFrameId: number;
        let isDisposed = false;

        // Scene & Camera setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        // Uniforms
        const uniforms = {
            u_texture: { value: null as THREE.Texture | null },
            u_depth: { value: null as THREE.Texture | null },
            u_mouse: { value: new THREE.Vector2(0, 0) },
            u_intensity: { value: new THREE.Vector2(intensity, intensity) },
            u_focusPlane: { value: focusPlane },
            u_maxDisplacement: { value: maxDisplacement },
            u_resolution: { value: new THREE.Vector2(1, 1) },
            u_imageResolution: { value: new THREE.Vector2(2880, 1620) },
        };

        // Fullscreen Quad Geometry
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Mouse Tracking with smooth lerping
        const targetMouse = { x: 0, y: 0 };
        const currentMouse = { x: 0, y: 0 };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            let clientX = 0;
            let clientY = 0;

            if ('touches' in e && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if ('clientX' in e) {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // Calculate normalized coordinates relative to screen/viewport center (-1 to 1)
            const normX = (clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const normY = -(clientY - window.innerHeight / 2) / (window.innerHeight / 2);

            targetMouse.x = normX;
            targetMouse.y = normY;
        };

        const handlePointerLeave = () => {
            targetMouse.x = 0;
            targetMouse.y = 0;
        };

        window.addEventListener('mousemove', handlePointerMove, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('mouseleave', handlePointerLeave);

        // Resize Handler
        const updateSize = () => {
            if (!container || isDisposed) return;
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;

            renderer.setSize(width, height, false);
            uniforms.u_resolution.value.set(width, height);
        };

        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });
        resizeObserver.observe(container);
        updateSize();

        // Texture Loader
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;

        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount >= 2 && !isDisposed) {
                onLoaded?.();
            }
        };

        textureLoader.load(
            diffuseMapUrl,
            (tex) => {
                if (isDisposed) {
                    tex.dispose();
                    return;
                }
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.wrapS = THREE.ClampToEdgeWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                tex.generateMipmaps = false;
                uniforms.u_texture.value = tex;
                if (tex.image && tex.image.width && tex.image.height) {
                    uniforms.u_imageResolution.value.set(tex.image.width, tex.image.height);
                }
                checkLoaded();
            },
            undefined,
            (err) => console.error('Error loading diffuse texture:', err)
        );

        textureLoader.load(
            depthMapUrl,
            (tex) => {
                if (isDisposed) {
                    tex.dispose();
                    return;
                }
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.wrapS = THREE.ClampToEdgeWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                tex.generateMipmaps = false;
                uniforms.u_depth.value = tex;
                checkLoaded();
            },
            undefined,
            (err) => console.error('Error loading depth texture:', err)
        );

        // Animation Loop
        const render = () => {
            if (isDisposed) return;

            // Linear interpolation (lerp) for smooth mouse movement
            const lerpFactor = smoothing;
            currentMouse.x += (targetMouse.x - currentMouse.x) * lerpFactor;
            currentMouse.y += (targetMouse.y - currentMouse.y) * lerpFactor;

            uniforms.u_mouse.value.set(currentMouse.x, currentMouse.y);

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        // Cleanup
        return () => {
            isDisposed = true;
            cancelAnimationFrame(animationFrameId);

            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('mouseleave', handlePointerLeave);
            resizeObserver.disconnect();

            if (uniforms.u_texture.value) {
                uniforms.u_texture.value.dispose();
            }
            if (uniforms.u_depth.value) {
                uniforms.u_depth.value.dispose();
            }

            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [diffuseMapUrl, depthMapUrl, intensity, focusPlane, smoothing, maxDisplacement, onLoaded]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            <canvas ref={canvasRef} className="block w-full h-full pointer-events-none select-none" />
        </div>
    );
}
