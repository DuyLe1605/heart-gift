import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Trái tim mini 3D bay bổng đúng chiều:
 * - Đáy nhọn ở DƯỚI (y < 0)
 * - 2 vòm cong ở TRÊN (y > 0)
 */
const MINI_HEART_COUNT = 24

function createMiniHeartShape() {
  const shape = new THREE.Shape()

  // Mũi nhọn dưới đáy
  shape.moveTo(0, -1.1)

  // Vòm sườn phải
  shape.bezierCurveTo(0.6, -0.6, 1.3, 0.1, 1.3, 0.7)
  shape.bezierCurveTo(1.3, 1.3, 0.7, 1.5, 0.35, 1.3)
  shape.bezierCurveTo(0.12, 1.15, 0.04, 0.9, 0, 0.65) // Rãnh giữa trên

  // Vòm sườn trái đối xứng
  shape.bezierCurveTo(-0.04, 0.9, -0.12, 1.15, -0.35, 1.3)
  shape.bezierCurveTo(-0.7, 1.5, -1.3, 1.3, -1.3, 0.7)
  shape.bezierCurveTo(-1.3, 0.1, -0.6, -0.6, 0, -1.1)

  return shape
}

export default function MiniHearts() {
  const groupRef = useRef()
  const heartsData = useRef([])

  const heartGeom = useMemo(() => {
    const shape = createMiniHeartShape()
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 6,
      curveSegments: 24,
    })
    geom.center()
    geom.scale(0.14, 0.14, 0.14)
    return geom
  }, [])

  // Khởi tạo dữ liệu các trái tim mini
  useMemo(() => {
    for (let i = 0; i < MINI_HEART_COUNT; i++) {
      heartsData.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          -4 + Math.random() * 8,
          (Math.random() - 0.5) * 3
        ),
        speed: 0.25 + Math.random() * 0.45,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        wobbleSpeed: 1.2 + Math.random() * 2,
        wobbleAmount: 0.2 + Math.random() * 0.4,
        scale: 0.55 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        color: new THREE.Color().setHSL(
          0.94 + Math.random() * 0.06, // Dải hồng đào, hồng phấn
          0.75 + Math.random() * 0.25,
          0.6 + Math.random() * 0.25
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

      // Bay từ dưới lên
      data.position.y += data.speed * delta

      // Lượn sóng nhẹ nhàng
      data.position.x += Math.sin(t * data.wobbleSpeed + data.phase) * data.wobbleAmount * delta

      // Khi bay quá cao -> reset xuống dưới
      if (data.position.y > 4.5) {
        data.position.y = -4.5
        data.position.x = (Math.random() - 0.5) * 7
      }

      child.position.copy(data.position)
      // Lắc lư nhẹ nhàng, giữ thẳng đứng đúng chiều trái tim
      child.rotation.z = Math.sin(t * 1.5 + data.phase) * 0.2
      child.rotation.y += data.rotSpeed * delta * 0.4

      // Fade mềm mại ở mép trên và dưới
      const heightFade = 1 - Math.abs(data.position.y) / 4.5
      child.material.opacity = Math.max(0, heightFade * 0.65)
      child.scale.setScalar(data.scale)
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: MINI_HEART_COUNT }).map((_, i) => {
        const data = heartsData.current[i] || {
          position: new THREE.Vector3(0, 0, 0),
          scale: 1,
          color: new THREE.Color('#ff6ba1'),
        }
        return (
          <mesh key={i} geometry={heartGeom} position={data.position} scale={data.scale}>
            <meshPhysicalMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.65}
              metalness={0.2}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
