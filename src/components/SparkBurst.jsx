import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Interactive sparkle burst that triggers on touch/click
 * Creates an explosion of sparkles from touch point
 */

const BURST_COUNT = 60

export default function SparkBurst({ triggerRef }) {
  const pointsRef = useRef()
  const velocities = useRef([])
  const lifetimes = useRef(new Float32Array(BURST_COUNT))
  const active = useRef(false)

  const { positions, sizes, colors, randoms } = useMemo(() => {
    const positions = new Float32Array(BURST_COUNT * 3)
    const sizes = new Float32Array(BURST_COUNT)
    const colors = new Float32Array(BURST_COUNT * 3)
    const randoms = new Float32Array(BURST_COUNT)

    const palette = [
      new THREE.Color('#ffd700'),
      new THREE.Color('#ff6ba1'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#ffb6e5'),
      new THREE.Color('#ff2d78'),
    ]

    const vels = []

    for (let i = 0; i < BURST_COUNT; i++) {
      const i3 = i * 3
      positions[i3] = 0
      positions[i3 + 1] = -100 // off screen
      positions[i3 + 2] = 0

      sizes[i] = 0.02 + Math.random() * 0.08
      randoms[i] = Math.random()

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b

      // Random velocity directions
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 1 + Math.random() * 3
      vels.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      ))
    }
    velocities.current = vels

    return { positions, sizes, colors, randoms }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), [])

  // Expose trigger function
  const trigger = useCallback((point) => {
    const posAttr = pointsRef.current?.geometry?.attributes?.position
    if (!posAttr) return

    active.current = true
    for (let i = 0; i < BURST_COUNT; i++) {
      const i3 = i * 3
      posAttr.array[i3] = point.x
      posAttr.array[i3 + 1] = point.y
      posAttr.array[i3 + 2] = point.z
      lifetimes.current[i] = 1.0

      // Re-randomize velocities
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 1.5 + Math.random() * 3
      velocities.current[i].set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 1,
        Math.cos(phi) * speed
      )
    }
    posAttr.needsUpdate = true
  }, [])

  // Attach trigger to ref for parent access
  if (triggerRef) triggerRef.current = trigger

  useFrame((state, delta) => {
    if (!active.current || !pointsRef.current) return
    
    const posAttr = pointsRef.current.geometry.attributes.position
    let anyAlive = false

    for (let i = 0; i < BURST_COUNT; i++) {
      if (lifetimes.current[i] <= 0) continue
      anyAlive = true

      const i3 = i * 3
      lifetimes.current[i] -= delta * 0.8

      // Update position
      posAttr.array[i3] += velocities.current[i].x * delta
      posAttr.array[i3 + 1] += velocities.current[i].y * delta
      posAttr.array[i3 + 2] += velocities.current[i].z * delta

      // Gravity
      velocities.current[i].y -= delta * 2

      // Drag
      velocities.current[i].multiplyScalar(0.98)
    }
    posAttr.needsUpdate = true

    if (!anyAlive) active.current = false
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={BURST_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={BURST_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={BURST_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={BURST_COUNT} array={randoms} itemSize={1} />
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
            gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
            gl_PointSize = max(gl_PointSize, 1.0);
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
            float alpha = smoothstep(0.5, 0.0, dist);
            float sparkle = 0.5 + 0.5 * sin(uTime * 10.0 + vRandom * 30.0);
            gl_FragColor = vec4(vColor * (1.0 + sparkle * 0.5), alpha * sparkle);
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
