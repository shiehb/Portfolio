'use client';

import React, { useEffect, useRef } from 'react';

export interface FluidCursorProps {
    className?: string;
    id?: string;
    color?: [number, number, number];
    splatRadius?: number;
    densityDissipation?: number;
    velocityDissipation?: number;
    curl?: number;
    maxOpacity?: number;
    pressure?: number;
    splatForce?: number;
}

interface FBO {
    texture: WebGLTexture | null;
    fbo: WebGLFramebuffer | null;
    width: number;
    height: number;
    attach: (id: number) => number;
}

interface DoubleFBO {
    width: number;
    height: number;
    texelSizeX: number;
    texelSizeY: number;
    read: FBO;
    write: FBO;
    swap: () => void;
}

interface ProgramInfo {
    program: WebGLProgram;
    uniforms: Record<string, WebGLUniformLocation>;
    bind: () => void;
}

export default function FluidCursor({
    className = '',
    id = 'fluid-cursor-canvas',
    color = [0.04, 0.04, 0.05],
    splatRadius = 0.28,
    densityDissipation = 0.6,
    velocityDissipation = 0.8,
    curl = 28,
    maxOpacity = 0.90,
    pressure = 0.2,
    splatForce = 6000,
}: FluidCursorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const configRef = useRef({
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 512,
        DENSITY_DISSIPATION: densityDissipation,
        VELOCITY_DISSIPATION: velocityDissipation,
        PRESSURE: pressure,
        PRESSURE_ITERATIONS: 20,
        CURL: curl,
        SPLAT_RADIUS: splatRadius,
        SPLAT_FORCE: splatForce,
        DARK_INK_COLOR: color,
        MAX_OPACITY: maxOpacity,
    });

    useEffect(() => {
        configRef.current = {
            SIM_RESOLUTION: 128,
            DYE_RESOLUTION: 512,
            DENSITY_DISSIPATION: densityDissipation,
            VELOCITY_DISSIPATION: velocityDissipation,
            PRESSURE: pressure,
            PRESSURE_ITERATIONS: 20,
            CURL: curl,
            SPLAT_RADIUS: splatRadius,
            SPLAT_FORCE: splatForce,
            DARK_INK_COLOR: color,
            MAX_OPACITY: maxOpacity,
        };
    }, [color, curl, densityDissipation, maxOpacity, pressure, splatForce, splatRadius, velocityDissipation]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const config = configRef.current;

        const pointer = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            moved: false,
            down: false,
        };

        const pointers = [pointer];

        let gl = canvas.getContext('webgl2', {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false,
            premultipliedAlpha: true,
        }) as WebGLRenderingContext | WebGL2RenderingContext | null;

        const isWebGL2 = !!gl;
        if (!gl) {
            gl = (canvas.getContext('webgl', {
                alpha: true,
                depth: false,
                stencil: false,
                antialias: false,
                preserveDrawingBuffer: false,
                premultipliedAlpha: true,
            }) ||
                canvas.getContext('experimental-webgl', {
                    alpha: true,
                    depth: false,
                    stencil: false,
                    antialias: false,
                    preserveDrawingBuffer: false,
                    premultipliedAlpha: true,
                })) as WebGLRenderingContext | null;
        }

        if (!gl) {
            return;
        }

        // Enable extensions
        let halfFloatExt: { HALF_FLOAT_OES: number } | null = null;
        let supportLinearFiltering: unknown = null;

        if (isWebGL2) {
            gl.getExtension('EXT_color_buffer_float');
            supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
        } else {
            halfFloatExt = gl.getExtension('OES_texture_half_float') as { HALF_FLOAT_OES: number } | null;
            supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
        }

        // Setup WebGL blend mode & clear color
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const halfFloatType = isWebGL2
            ? (gl as WebGL2RenderingContext).HALF_FLOAT
            : halfFloatExt?.HALF_FLOAT_OES || gl.UNSIGNED_BYTE;

        const formatRGBA = {
            internalFormat: isWebGL2 ? (gl as WebGL2RenderingContext).RGBA16F : gl.RGBA,
            format: gl.RGBA,
        };
        const formatRG = {
            internalFormat: isWebGL2 ? (gl as WebGL2RenderingContext).RG16F : gl.RGBA,
            format: isWebGL2 ? (gl as WebGL2RenderingContext).RG : gl.RGBA,
        };
        const formatR = {
            internalFormat: isWebGL2 ? (gl as WebGL2RenderingContext).R16F : gl.RGBA,
            format: isWebGL2 ? (gl as WebGL2RenderingContext).RED : gl.RGBA,
        };

        function createShader(type: number, source: string): WebGLShader | null {
            const shader = gl!.createShader(type);
            if (!shader) return null;
            gl!.shaderSource(shader, source);
            gl!.compileShader(shader);
            if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
                console.error(gl!.getShaderInfoLog(shader));
                gl!.deleteShader(shader);
                return null;
            }
            return shader;
        }

        function createProgram(vertexShaderSource: string, fragmentShaderSource: string): ProgramInfo | null {
            const vertexShader = createShader(gl!.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl!.FRAGMENT_SHADER, fragmentShaderSource);
            if (!vertexShader || !fragmentShader) return null;

            const program = gl!.createProgram();
            if (!program) return null;
            gl!.attachShader(program, vertexShader);
            gl!.attachShader(program, fragmentShader);
            gl!.linkProgram(program);

            if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
                console.error(gl!.getProgramInfoLog(program));
                return null;
            }

            const uniforms: Record<string, WebGLUniformLocation> = {};
            const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
            for (let i = 0; i < count; i++) {
                const info = gl!.getActiveUniform(program, i);
                if (info) {
                    const loc = gl!.getUniformLocation(program, info.name);
                    if (loc) uniforms[info.name] = loc;
                }
            }

            return {
                program,
                uniforms,
                bind: () => gl!.useProgram(program),
            };
        }

        const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

        const clearShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

        const splatShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

        const advectionShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;

      void main () {
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          gl_FragColor = dissipation * texture2D(uSource, coord);
      }
    `;

        const divergenceShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;
          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

        const curlShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

        const vorticityShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;

          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;

          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

        const pressureShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).y;
          float B = texture2D(uPressure, vB).y;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

        const gradientSubtractShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).y;
          float B = texture2D(uPressure, vB).y;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

        // High-contrast dark fluid output shader specifically tuned for light/paper background
        const displayFragmentShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec3 uColor;
      uniform float uMaxOpacity;

      void main () {
          vec4 fluidColor = texture2D(uTexture, vUv);
          
          // Compute alpha dynamic blend with power curve to keep rich ink trails visible
          float len = max(fluidColor.r, max(fluidColor.g, fluidColor.b));
          float alpha = clamp(pow(len, 0.65) * 1.5, 0.0, uMaxOpacity);

          gl_FragColor = vec4(uColor, alpha);
      }
    `;

        const clearProgram = createProgram(baseVertexShader, clearShader);
        const splatProgram = createProgram(baseVertexShader, splatShader);
        const advectionProgram = createProgram(baseVertexShader, advectionShader);
        const divergenceProgram = createProgram(baseVertexShader, divergenceShader);
        const curlProgram = createProgram(baseVertexShader, curlShader);
        const vorticityProgram = createProgram(baseVertexShader, vorticityShader);
        const pressureProgram = createProgram(baseVertexShader, pressureShader);
        const gradSubtractProgram = createProgram(baseVertexShader, gradientSubtractShader);
        const displayProgram = createProgram(baseVertexShader, displayFragmentShader);

        // Quad geometry
        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        function blit(target: FBO | null, clear = false) {
            if (target == null) {
                gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
                gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
            } else {
                gl!.viewport(0, 0, target.width, target.height);
                gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
            }
            if (clear) {
                gl!.clearColor(0.0, 0.0, 0.0, 0.0);
                gl!.clear(gl!.COLOR_BUFFER_BIT);
            }
            gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuffer);
            gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
            gl!.enableVertexAttribArray(0);
            gl!.drawArrays(gl!.TRIANGLE_FAN, 0, 4);
        }

        function createFBO(
            w: number,
            h: number,
            internalFormat: number,
            format: number,
            type: number,
            filter: number
        ): FBO {
            gl!.activeTexture(gl!.TEXTURE0);
            const texture = gl!.createTexture();
            gl!.bindTexture(gl!.TEXTURE_2D, texture);
            gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter);
            gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter);
            gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
            gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
            gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

            const fbo = gl!.createFramebuffer();
            gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
            gl!.framebufferTexture2D(
                gl!.FRAMEBUFFER,
                gl!.COLOR_ATTACHMENT0,
                gl!.TEXTURE_2D,
                texture,
                0
            );
            gl!.viewport(0, 0, w, h);
            gl!.clear(gl!.COLOR_BUFFER_BIT);

            const attach = (id: number) => {
                gl!.activeTexture(gl!.TEXTURE0 + id);
                gl!.bindTexture(gl!.TEXTURE_2D, texture);
                return id;
            };

            return {
                texture,
                fbo,
                width: w,
                height: h,
                attach,
            };
        }

        function createDoubleFBO(
            w: number,
            h: number,
            internalFormat: number,
            format: number,
            type: number,
            filter: number
        ): DoubleFBO {
            let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
            let fbo2 = createFBO(w, h, internalFormat, format, type, filter);

            return {
                width: w,
                height: h,
                texelSizeX: 1.0 / (w || 1),
                texelSizeY: 1.0 / (h || 1),
                get read() {
                    return fbo1;
                },
                set read(value: FBO) {
                    if (value && typeof value.attach === 'function') {
                        fbo1 = value;
                    }
                },
                get write() {
                    return fbo2;
                },
                set write(value: FBO) {
                    if (value && typeof value.attach === 'function') {
                        fbo2 = value;
                    }
                },
                swap() {
                    const temp = fbo1;
                    fbo1 = fbo2;
                    fbo2 = temp;
                },
            };
        }

        const buffers: {
            density: DoubleFBO | null;
            velocity: DoubleFBO | null;
            divergence: FBO | null;
            curl: FBO | null;
            pressure: DoubleFBO | null;
        } = {
            density: null,
            velocity: null,
            divergence: null,
            curl: null,
            pressure: null,
        };

        function initFramebuffers() {
            const simRes = getResolution(config.SIM_RESOLUTION);
            const dyeRes = getResolution(config.DYE_RESOLUTION);

            const texType = halfFloatType;
            const rgba = formatRGBA;
            const rg = formatRG;
            const r = formatR;
            const filtering = supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST;

            buffers.density = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
            buffers.velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
            buffers.divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
            buffers.curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
            buffers.pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
        }

        function getResolution(resolution: number) {
            const width = gl!.drawingBufferWidth || canvas!.width || 1;
            const height = gl!.drawingBufferHeight || canvas!.height || 1;
            let aspectRatio = width / height;
            if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

            const min = Math.max(1, Math.round(resolution));
            const max = Math.max(1, Math.round(resolution * aspectRatio));

            if (width > height) {
                return { width: max, height: min };
            } else {
                return { width: min, height: max };
            }
        }

        function resizeCanvas() {
            if (!canvas) return;
            const width = canvas.clientWidth || window.innerWidth || 1;
            const height = canvas.clientHeight || window.innerHeight || 1;
            if (canvas.width !== width || canvas.height !== height || !buffers.density || !buffers.velocity) {
                canvas.width = width;
                canvas.height = height;
                initFramebuffers();
            }
        }

        function splat(x: number, y: number, dx: number, dy: number, dyeColor: [number, number, number] = [1.0, 1.0, 1.0]) {
            if (!splatProgram) return;
            const velocity = buffers.velocity;
            const dye = buffers.density;
            // Guard against accessing uninitialized DoubleFBO buffers
            if (!velocity?.read || !dye?.read || !velocity?.write || !dye?.write) return;

            // Splat velocity
            splatProgram.bind();
            gl!.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
            gl!.uniform1f(splatProgram.uniforms.aspectRatio, (canvas?.width || 1) / (canvas?.height || 1));
            gl!.uniform2f(splatProgram.uniforms.point, x, y);
            gl!.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
            gl!.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS / 100.0);
            blit(velocity.write);
            velocity.swap();

            // Splat dye with normalized intensity
            gl!.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
            gl!.uniform3f(splatProgram.uniforms.color, dyeColor[0], dyeColor[1], dyeColor[2]);
            blit(dye.write);
            dye.swap();
        }

        function multipleSplats(amount: number) {
            const velocity = buffers.velocity;
            const dye = buffers.density;
            if (!velocity?.read || !dye?.read) return;
            for (let i = 0; i < amount; i++) {
                const x = Math.random();
                const y = Math.random();
                const dx = 1000 * (Math.random() - 0.5);
                const dy = 1000 * (Math.random() - 0.5);
                splat(x, y, dx, dy, [1.0, 1.0, 1.0]);
            }
        }

        let lastUpdateTime = Date.now();
        let animationFrameId: number;

        function step(dt: number) {
            const { velocity, density, pressure, divergence, curl } = buffers;
            if (!velocity?.read || !velocity?.write || !density?.read || !density?.write || !pressure?.read || !pressure?.write || !divergence || !curl) {
                return;
            }

            gl!.disable(gl!.BLEND);

            // Curl
            if (curlProgram) {
                curlProgram.bind();
                gl!.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
                blit(curl);
            }

            // Vorticity
            if (vorticityProgram) {
                vorticityProgram.bind();
                gl!.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl!.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
                gl!.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
                gl!.uniform1f(vorticityProgram.uniforms.dt, dt);
                blit(velocity.write);
                velocity.swap();
            }

            // Divergence
            if (divergenceProgram) {
                divergenceProgram.bind();
                gl!.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
                blit(divergence);
            }

            // Clear pressure
            if (clearProgram) {
                clearProgram.bind();
                gl!.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
                gl!.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
                blit(pressure.write);
                pressure.swap();
            }

            // Pressure Jacobi
            if (pressureProgram) {
                pressureProgram.bind();
                gl!.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
                for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                    gl!.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
                    blit(pressure.write);
                    pressure.swap();
                }
            }

            // Gradient subtract
            if (gradSubtractProgram) {
                gradSubtractProgram.bind();
                gl!.uniform2f(gradSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(gradSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
                gl!.uniform1i(gradSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
                blit(velocity.write);
                velocity.swap();
            }

            // Advection for velocity
            if (advectionProgram) {
                const velDissipation = Math.exp(-config.VELOCITY_DISSIPATION * dt);
                const dyeDissipation = Math.exp(-config.DENSITY_DISSIPATION * dt);

                advectionProgram.bind();
                gl!.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl!.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
                gl!.uniform1f(advectionProgram.uniforms.dt, dt);
                gl!.uniform1f(advectionProgram.uniforms.dissipation, velDissipation);
                blit(velocity.write);
                velocity.swap();

                // Advection for density
                gl!.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl!.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1));
                gl!.uniform1f(advectionProgram.uniforms.dissipation, dyeDissipation);
                blit(density.write);
                density.swap();
            }
        }

        function render() {
            const density = buffers.density;
            if (!density?.read || !displayProgram) return;

            // Enable alpha blending on the WebGL context
            gl!.enable(gl!.BLEND);
            gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);

            displayProgram.bind();
            gl!.uniform1i(displayProgram.uniforms.uTexture, density.read.attach(0));
            if (displayProgram.uniforms.uColor) {
                gl!.uniform3f(
                    displayProgram.uniforms.uColor,
                    config.DARK_INK_COLOR[0],
                    config.DARK_INK_COLOR[1],
                    config.DARK_INK_COLOR[2]
                );
            }
            if (displayProgram.uniforms.uMaxOpacity) {
                gl!.uniform1f(displayProgram.uniforms.uMaxOpacity, config.MAX_OPACITY);
            }
            blit(null, true);
        }

        let isVisible = true;
        let isLoopRunning = false;
        let cachedRect = { left: 0, top: 0, width: window.innerWidth || 1, height: window.innerHeight || 1 };

        function updateCachedRect() {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width && rect.height) {
                cachedRect = {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                };
            }
        }

        function update() {
            if (!isVisible || document.hidden) {
                isLoopRunning = false;
                return;
            }

            const now = Date.now();
            const dt = Math.min((now - lastUpdateTime) / 1000, 0.016);
            lastUpdateTime = now;

            // Handle pointer interactions
            for (const p of pointers) {
                if (p.moved) {
                    p.moved = false;
                    // Set the splat color generator to emit dark ink/black tones
                    splat(p.x, p.y, p.dx, p.dy, config.DARK_INK_COLOR);
                }
            }

            step(dt);
            render();

            animationFrameId = requestAnimationFrame(update);
            isLoopRunning = true;
        }

        function startFluidLoop() {
            if (!isLoopRunning && isVisible && !document.hidden) {
                isLoopRunning = true;
                cancelAnimationFrame(animationFrameId);
                lastUpdateTime = Date.now();
                animationFrameId = requestAnimationFrame(update);
            }
        }

        // IntersectionObserver to pause when canvas is scrolled off-screen
        let observer: IntersectionObserver | null = null;
        if (typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver(([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    startFluidLoop();
                } else {
                    isLoopRunning = false;
                    cancelAnimationFrame(animationFrameId);
                }
            }, { threshold: 0 });
            observer.observe(canvas);
        }

        // Event handlers using cached rect
        function updatePointerMoveData(p: typeof pointer, posX: number, posY: number) {
            if (!cachedRect.width || !cachedRect.height) return;
            const clientX = (posX - cachedRect.left) / cachedRect.width;
            const clientY = 1.0 - (posY - cachedRect.top) / cachedRect.height;

            p.dx = (clientX - p.x) * config.SPLAT_FORCE;
            p.dy = (clientY - p.y) * config.SPLAT_FORCE;
            p.x = clientX;
            p.y = clientY;
            p.moved = Math.abs(p.dx) > 0.1 || Math.abs(p.dy) > 0.1;
            if (p.moved) {
                startFluidLoop();
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            updatePointerMoveData(pointer, e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                updatePointerMoveData(pointer, touch.clientX, touch.clientY);
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            pointer.down = true;
            updatePointerMoveData(pointer, e.clientX, e.clientY);
            splat(pointer.x, pointer.y, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, config.DARK_INK_COLOR);
            startFluidLoop();
        };

        const handleMouseUp = () => {
            pointer.down = false;
        };

        const handleResize = () => {
            resizeCanvas();
            updateCachedRect();
            startFluidLoop();
        };

        // Sequential setup sequence with complete safety checks
        resizeCanvas();
        updateCachedRect();
        initFramebuffers();
        if (buffers.velocity?.read && buffers.density?.read) {
            multipleSplats(Math.floor(Math.random() * 20) + 5);
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', updateCachedRect, { passive: true });

        const handleVisibility = () => {
            if (document.hidden) {
                isLoopRunning = false;
                cancelAnimationFrame(animationFrameId);
            } else if (isVisible) {
                startFluidLoop();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        startFluidLoop();

        return () => {
            isLoopRunning = false;
            cancelAnimationFrame(animationFrameId);
            if (observer) observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', updateCachedRect);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id={id}
            className={`pointer-events-none absolute inset-0 z-0 w-full h-full ${className}`}
            style={{
                display: 'block',
                width: '100%',
                height: '100%',
                background: 'transparent',
            }}
            aria-hidden="true"
        />
    );
}
