import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Starfield background with twinkling stars
 * Creates a deep-space romantic atmosphere
 */

const STAR_COUNT = 500

export default function StarField() {
  const pointsRef = useRef()

  const { positions, sizes, colors, randoms } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)
    const colors = new Float32Array(STAR_COUNT * 3)
    const randoms = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3

      // Distribute on a large sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 15 + Math.random() * 25

      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      sizes[i] = 0.01 + Math.random() * 0.04
      randoms[i] = Math.random()

      // Star colors: white, pale blue, pale pink, pale gold
      const colorRoll = Math.random()
      if (colorRoll < 0.4) {
        colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1 // white
      } else if (colorRoll < 0.6) {
        colors[i3] = 0.8; colors[i3 + 1] = 0.85; colors[i3 + 2] = 1 // blue
      } else if (colorRoll < 0.8) {
        colors[i3] = 1; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.9 // pink
      } else {
        colors[i3] = 1; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.7 // gold
      }
    }

    return { positions, sizes, colors, randoms }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), [])

  useFrame((state) => {
    if (pointsRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.003
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={STAR_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={STAR_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={STAR_COUNT} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`
          attribute float aSize;
          attribute vec3 aColor;
          attribute float aRandom;
          varying vec3 vColor;
          varying float vRandom;
          uniform float uTime;
          uniform float uPixelRatio;
          void main() {
            vColor = aColor;
            vRandom = aRandom;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float twinkleSize = 1.0 + 0.3 * sin(uTime * (2.0 + aRandom * 4.0) + aRandom * 100.0);
            gl_PointSize = aSize * twinkleSize * uPixelRatio * (200.0 / -mvPosition.z);
            gl_PointSize = max(gl_PointSize, 0.5);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          varying float vRandom;
          uniform float uTime;
          void main() {
            float dist = length(gl_PointCoord - 0.5);
            if (dist > 0.5) discard;
            
            // Star shape with cross flare
            vec2 p = gl_PointCoord - 0.5;
            float cross = exp(-abs(p.x) * 20.0) + exp(-abs(p.y) * 20.0);
            float circle = smoothstep(0.5, 0.0, dist);
            float shape = circle + cross * 0.15;
            
            float twinkle = 0.5 + 0.5 * sin(uTime * (3.0 + vRandom * 5.0) + vRandom * 50.0);
            float alpha = shape * (0.4 + twinkle * 0.6);
            
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
