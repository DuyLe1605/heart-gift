import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Heart-shaped particle trail that orbits around the main heart
 * Creates a magical trail of mini hearts and sparkles
 */

const trailCount = 150

const trailVertexShader = `
  attribute float aSize;
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aOrbitRadius;
  attribute float aPhase;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vColor = aColor;
    
    float t = uTime * aSpeed + aPhase;
    
    // Orbit in heart-shaped path
    float heartT = t * 0.5;
    float heartX = 16.0 * pow(sin(heartT), 3.0);
    float heartY = 13.0 * cos(heartT) - 5.0 * cos(2.0 * heartT) - 2.0 * cos(3.0 * heartT) - cos(4.0 * heartT);
    
    vec3 pos;
    pos.x = heartX * aOrbitRadius * 0.08;
    pos.y = heartY * aOrbitRadius * 0.08;
    pos.z = sin(t * 2.0 + aPhase) * aOrbitRadius * 0.3;
    
    // Additional wave motion
    pos.y += sin(t * 3.0) * 0.1;
    
    vAlpha = 0.4 + 0.6 * (0.5 + 0.5 * sin(t * 4.0 + aPhase));
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (150.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const trailFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
    
    // Heart shape in the particle
    vec2 p = (gl_PointCoord - 0.5) * 2.0;
    float heart = pow(p.x * p.x + p.y * p.y - 0.3, 3.0) - p.x * p.x * p.y * p.y * p.y;
    float heartShape = step(heart, 0.0);
    
    // Mix circle and heart shape
    float shape = mix(alpha, heartShape * alpha * 1.5, 0.3);
    
    gl_FragColor = vec4(vColor, shape * 0.8);
  }
`

export default function HeartTrail() {
  const pointsRef = useRef()

  const { positions, sizes, angles, speeds, orbits, phases, colors } = useMemo(() => {
    const positions = new Float32Array(trailCount * 3)
    const sizes = new Float32Array(trailCount)
    const angles = new Float32Array(trailCount)
    const speeds = new Float32Array(trailCount)
    const orbits = new Float32Array(trailCount)
    const phases = new Float32Array(trailCount)
    const colors = new Float32Array(trailCount * 3)

    const palette = [
      new THREE.Color('#ff2d78'),
      new THREE.Color('#ff6ba1'),
      new THREE.Color('#ffd700'),
      new THREE.Color('#ffb6e5'),
    ]

    for (let i = 0; i < trailCount; i++) {
      const i3 = i * 3
      positions[i3] = 0
      positions[i3 + 1] = 0
      positions[i3 + 2] = 0

      sizes[i] = 0.02 + Math.random() * 0.05
      angles[i] = Math.random() * Math.PI * 2
      speeds[i] = 0.2 + Math.random() * 0.5
      orbits[i] = 0.5 + Math.random() * 1.2
      phases[i] = Math.random() * Math.PI * 2

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }

    return { positions, sizes, angles, speeds, orbits, phases, colors }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), [])

  useFrame((state) => {
    if (pointsRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={trailCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={trailCount} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aAngle" count={trailCount} array={angles} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={trailCount} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aOrbitRadius" count={trailCount} array={orbits} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={trailCount} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={trailCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={trailVertexShader}
        fragmentShader={trailFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
