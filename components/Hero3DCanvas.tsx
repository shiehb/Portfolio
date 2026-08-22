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
     * @default 0.007
     */
    intensity?: number;
    /**
     * Focal depth plane (0.0 to 1.0) that remains stationary.
     * @default 0.65
     */
    focusPlane?: number;
    /**
     * Mouse easing factor (0.01 = slow/smooth, 0.1 = responsive).
     * @default 0.045
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

  varying vec2 vUv;

  void main() {
    // Sample depth from red channel (0.0 = background, 1.0 = closest foreground)
    float depth = texture2D(u_depth, vUv).r;

    // Displace relative to focus plane (face plane anchors, foreground pushes forward, background recedes)
    float depthDelta = (depth - u_focusPlane);
    vec2 displacement = u_mouse * depthDelta * u_intensity;

    // Clamp displacement to max distance to prevent edge tearing
    float dispLen = length(displacement);
    if (dispLen > u_maxDisplacement) {
      displacement = (displacement / dispLen) * u_maxDisplacement;
    }

    // Displaced UV coordinates clamped within texture boundaries
    vec2 displacedUv = clamp(vUv + displacement, vec2(0.001), vec2(0.999));

    vec4 origColor = texture2D(u_texture, vUv);
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
    smoothing = 0.045,
    maxDisplacement = 0.012,
    onLoaded,
}: Hero3DCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let animationFrameId: number;
        let isDisposed = false;
        let isVisible = true;
        let isRendering = false;

        // Scene & Camera setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
        });

        // Set fixed high-quality internal render buffer size (e.g. 1920x1080)
        // CSS handles display scaling smoothly without WebGL buffer reallocation during scroll
        const updateRendererResolution = () => {
            if (isDisposed) return;
            const isMobile = window.innerWidth < 768;
            const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2);
            const targetW = Math.min(Math.round(window.innerWidth * dpr), 2560);
            const targetH = Math.round(targetW * (9 / 16));
            renderer.setPixelRatio(1);
            renderer.setSize(targetW, targetH, false);
        };

        updateRendererResolution();

        // Uniforms
        const uniforms = {
            u_texture: { value: null as THREE.Texture | null },
            u_depth: { value: null as THREE.Texture | null },
            u_mouse: { value: new THREE.Vector2(0, 0) },
            u_intensity: { value: new THREE.Vector2(intensity, intensity) },
            u_focusPlane: { value: focusPlane },
            u_maxDisplacement: { value: maxDisplacement },
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
            if (!isVisible || isDisposed) return;
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

            targetMouse.x = Math.max(-1, Math.min(1, normX));
            targetMouse.y = Math.max(-1, Math.min(1, normY));
            startLoop();
        };

        const handlePointerLeave = () => {
            targetMouse.x = 0;
            targetMouse.y = 0;
            startLoop();
        };

        window.addEventListener('mousemove', handlePointerMove, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('mouseleave', handlePointerLeave);

        // Only update WebGL canvas buffer on window resize with debounce
        let resizeTimer: NodeJS.Timeout | null = null;
        const handleWindowResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateRendererResolution();
                startLoop();
            }, 150);
        };
        window.addEventListener('resize', handleWindowResize);

        // Texture Loader with fallback support
        const textureLoader = new THREE.TextureLoader();
        let loadedCount = 0;

        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount >= 2 && !isDisposed) {
                onLoaded?.();
                startLoop();
            }
        };

        // Create 1x1 fallback textures
        const createFallbackDepthTexture = () => {
            const data = new Uint8Array([165, 165, 165, 255]); // ~0.65 focus plane
            const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
            tex.needsUpdate = true;
            return tex;
        };

        const createFallbackDiffuseTexture = () => {
            const data = new Uint8Array([0, 0, 0, 0]);
            const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
            tex.needsUpdate = true;
            return tex;
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
                checkLoaded();
            },
            undefined,
            (err) => {
                console.warn('Diffuse texture fallback activated:', err);
                if (!isDisposed) {
                    uniforms.u_texture.value = createFallbackDiffuseTexture();
                    checkLoaded();
                }
            }
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
            (err) => {
                console.warn('Depth texture fallback activated:', err);
                if (!isDisposed) {
                    uniforms.u_depth.value = createFallbackDepthTexture();
                    checkLoaded();
                }
            }
        );

        // Animation Loop with visibility and resting state pause
        const render = () => {
            if (isDisposed || !isVisible || document.hidden) {
                isRendering = false;
                return;
            }

            // Linear interpolation (lerp) for smooth mouse movement
            const lerpFactor = smoothing;
            const dx = targetMouse.x - currentMouse.x;
            const dy = targetMouse.y - currentMouse.y;

            currentMouse.x += dx * lerpFactor;
            currentMouse.y += dy * lerpFactor;

            uniforms.u_mouse.value.set(currentMouse.x, currentMouse.y);
            renderer.render(scene, camera);

            // Keep rendering if still moving towards target
            if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
                animationFrameId = requestAnimationFrame(render);
                isRendering = true;
            } else {
                isRendering = false;
            }
        };

        function startLoop() {
            if (!isRendering && !isDisposed && isVisible && !document.hidden) {
                isRendering = true;
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        }

        startLoop();

        // IntersectionObserver to pause rendering when canvas is out of view
        let observer: IntersectionObserver | null = null;
        if (containerRef.current && typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver(
                ([entry]) => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        startLoop();
                    } else {
                        isRendering = false;
                        cancelAnimationFrame(animationFrameId);
                    }
                },
                { threshold: 0 }
            );
            observer.observe(containerRef.current);
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                isRendering = false;
                cancelAnimationFrame(animationFrameId);
            } else if (isVisible) {
                startLoop();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            isDisposed = true;
            isRendering = false;
            cancelAnimationFrame(animationFrameId);

            if (observer) observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (resizeTimer) clearTimeout(resizeTimer);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('mouseleave', handlePointerLeave);
            window.removeEventListener('resize', handleWindowResize);

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
        <div ref={containerRef} className={`relative overflow-hidden w-full h-full ${className}`}>
            <canvas
                ref={canvasRef}
                className="block w-full h-full object-cover object-center pointer-events-none select-none"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                }}
            />
        </div>
    );
}

