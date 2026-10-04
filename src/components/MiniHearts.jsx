import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Floating mini hearts that rise up like bubbles
 * Each mini heart is a mesh with heart-shaped geometry
 */

const MINI_HEART_COUNT = 20

function createMiniHeartShape() {
  const shape = new THREE.Shape()
  const x = 0, y = 0
  shape.moveTo(x, y + 0.3)
  shape.bezierCurveTo(x, y + 0.3, x - 0.08, y, x - 0.25, y)
  shape.bezierCurveTo(x - 0.55, y, x - 0.55, y + 0.35, x - 0.55, y + 0.35)
  shape.bezierCurveTo(x - 0.55, y + 0.55, x - 0.35, y + 0.77, x, y + 1.0)
  shape.bezierCurveTo(x + 0.35, y + 0.77, x + 0.55, y + 0.55, x + 0.55, y + 0.35)
  shape.bezierCurveTo(x + 0.55, y + 0.35, x + 0.55, y, x + 0.25, y)
  shape.bezierCurveTo(x + 0.08, y, x, y + 0.3, x, y + 0.3)
  return shape
}

export default function MiniHearts() {
  const groupRef = useRef()
  const heartsData = useRef([])

  const heartGeom = useMemo(() => {
    const shape = createMiniHeartShape()
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    })
    geom.center()
    geom.scale(0.12, 0.12, 0.12)
    return geom
  }, [])

  // Initialize hearts data
  useMemo(() => {
    for (let i = 0; i < MINI_HEART_COUNT; i++) {
      heartsData.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          -3 + Math.random() * 6,
          (Math.random() - 0.5) * 3
        ),
        speed: 0.2 + Math.random() * 0.4,
        rotSpeed: (Math.random() - 0.5) * 2,
        wobbleSpeed: 1 + Math.random() * 2,
        wobbleAmount: 0.3 + Math.random() * 0.5,
        scale: 0.5 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
        color: new THREE.Color().setHSL(
          0.93 + Math.random() * 0.07, // pink-red hue range
          0.7 + Math.random() * 0.3,
          0.5 + Math.random() * 0.3
        ),
      })
    }
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.children.forEach((child, i) => {
      const data = heartsData.current[i]
      if (!data) return

      // Rise up
      data.position.y += data.speed * delta

      // Wobble side to side
      data.position.x += Math.sin(t * data.wobbleSpeed + data.phase) * data.wobbleAmount * delta

      // Reset when out of view
      if (data.position.y > 4) {
        data.position.y = -4
        data.position.x = (Math.random() - 0.5) * 6
      }

      child.position.copy(data.position)
      child.rotation.z = Math.sin(t * data.rotSpeed + data.phase) * 0.5
      child.rotation.y += data.rotSpeed * delta * 0.5

      // Fade based on height
      const heightFade = 1 - Math.abs(data.position.y) / 4
      child.material.opacity = Math.max(0, heightFade * 0.6)
      child.scale.setScalar(data.scale)
    })
  })

  return (
    <group ref={groupRef}>
      {heartsData.current.length === 0 && Array.from({ length: MINI_HEART_COUNT }).map((_, i) => null)}
      {Array.from({ length: MINI_HEART_COUNT }).map((_, i) => {
        const data = heartsData.current[i] || {
          position: new THREE.Vector3(0, 0, 0),
          scale: 1,
          color: new THREE.Color('#ff2d78'),
        }
        return (
          <mesh key={i} geometry={heartGeom} position={data.position} scale={data.scale}>
            <meshPhysicalMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
              metalness={0.5}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
