import React, { useEffect, useRef } from 'react';

const NoiseOverlay = ({ trigger, duration = 800 }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl');
        if (!gl) return;

        // Vertex Shader
        const vsSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // Fragment Shader
        const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform float u_progress; // 0.0 (full noise) -> 1.0 (clear)
            uniform vec2 u_resolution;

            // Pseudo-random function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                
                // Animated noise
                float noise = random(st * 3.0 + u_time * 2.0); 
                
                // Digital blocky effect (Big cubes)
                vec2 blockSt = floor(st * 10.0) / 10.0;
                float blockNoise = random(blockSt + u_time);
                
                // Mix fine noise and block noise
                float finalNoise = mix(noise, blockNoise, 0.6); // More blocky preference

                // Smooth dissolve transition
                // smoothstep(edge0, edge1, x) returns 0.0 if x <= edge0, 1.0 if x >= edge1
                // We want to fade out as u_progress goes 0 -> 1
                float edge = u_progress;
                float visibility = smoothstep(edge, edge + 0.1, finalNoise); 
                
                // Monochrome Glitch (Mostly White with Black artifacts)
                // step(threshold, value) returns 0.0 if value < threshold, else 1.0
                // We want mostly white, so a low threshold for black.
                // noise < 0.15 becomes black (0.0), rest is white (1.0)
                float bw = step(0.15, noise); 
                vec3 color = vec3(bw);

                gl_FragColor = vec4(color, visibility);
            }
        `;

        // Validation helper
        const compileShader = (source, type) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vs = compileShader(vsSource, gl.VERTEX_SHADER);
        const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Quad geometry
        const vertices = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Uniforms
        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const progressLocation = gl.getUniformLocation(program, 'u_progress');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

        // Animation Loop
        const animate = (time) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const elapsed = time - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1.0);

            // Resize canvas if needed
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }

            gl.uniform1f(timeLocation, time * 0.001);
            gl.uniform1f(progressLocation, progress);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            if (progress < 1.0) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                // Clear when done (optional, but good for transparency)
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
        };

        // Reset and start
        startTimeRef.current = null;
        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buffer);
        };
    }, [trigger, duration]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks through
                zIndex: 10
            }}
        />
    );
};

export default NoiseOverlay;
