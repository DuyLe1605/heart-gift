import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Magical particle system that forms heart shapes and sparkles
 * Particles float, orbit, and trail around the scene
 */

const particleVertexShader = `
  attribute float aSize;
  attribute float aLife;
  attribute vec3 aColor;
  attribute float aRandom;
  
  varying float vLife;
  varying vec3 vColor;
  varying float vRandom;
  
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vLife = aLife;
    vColor = aColor;
    vRandom = aRandom;
    
    vec3 pos = position;
    
    // Gentle swirl motion
    float angle = uTime * 0.3 + aRandom * 6.28;
    float radius = 0.1 * sin(uTime * 0.5 + aRandom * 3.14);
    pos.x += cos(angle) * radius;
    pos.z += sin(angle) * radius;
    pos.y += sin(uTime * 0.7 + aRandom * 5.0) * 0.05;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragmentShader = `
  varying float vLife;
  varying vec3 vColor;
  varying float vRandom;
  
  uniform float uTime;
  
  void main() {
    // Soft circular point
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft glow
    float alpha = smoothstep(0.5, 0.0, dist);
    alpha *= 0.6 + 0.4 * sin(uTime * 2.0 + vRandom * 10.0);
    alpha *= vLife;
    
    // Twinkle
    float twinkle = 0.7 + 0.3 * sin(uTime * 5.0 + vRandom * 20.0);
    
    gl_FragColor = vec4(vColor * twinkle, alpha);
  }
`

export default function ParticleField({ count = 300 }) {
  const pointsRef = useRef()

  const { positions, sizes, lifes, colors, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const lifes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const randoms = new Float32Array(count)

    const colorPalette = [
      new THREE.Color('#ff2d78'),
      new THREE.Color('#ff6ba1'),
      new THREE.Color('#ffb6e5'),
      new THREE.Color('#c850c0'),
      new THREE.Color('#ffd700'),
      new THREE.Color('#ff85c0'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const random = Math.random()
      randoms[i] = random

      // Distribute in sphere-like volume with heart concentration
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 4

      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8 - 0.5
      positions[i3 + 2] = r * Math.cos(phi) * 0.6

      sizes[i] = 0.02 + Math.random() * 0.06
      lifes[i] = 0.3 + Math.random() * 0.7

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    return { positions, sizes, lifes, colors, randoms }
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), [])

  useFrame((state) => {
    if (pointsRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          count={count}
          array={lifes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
