import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Các vật thể 3D bay bổng: Xen kẽ Trái tim pha lê 💖 và Vì Tinh Tú lấp lánh ⭐
 */
const TOTAL_GEMS_COUNT = 32

// 1. Tạo hình Trái tim 3D mini đúng chiều
function createMiniHeartShape() {
  const shape = new THREE.Shape()
  shape.moveTo(0, -1.1)
  shape.bezierCurveTo(0.6, -0.6, 1.3, 0.1, 1.3, 0.7)
  shape.bezierCurveTo(1.3, 1.3, 0.7, 1.5, 0.35, 1.3)
  shape.bezierCurveTo(0.12, 1.15, 0.04, 0.9, 0, 0.65)
  shape.bezierCurveTo(-0.04, 0.9, -0.12, 1.15, -0.35, 1.3)
  shape.bezierCurveTo(-0.7, 1.5, -1.3, 1.3, -1.3, 0.7)
  shape.bezierCurveTo(-1.3, 0.1, -0.6, -0.6, 0, -1.1)
  return shape
}

// 2. Tạo hình Vì Tinh Tú 3D (Ngôi sao 4 cánh / 5 cánh kim cương lấp lánh)
function createStarShape(points = 5, outerRadius = 1.0, innerRadius = 0.42) {
  const shape = new THREE.Shape()
  const step = Math.PI / points
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const angle = i * step - Math.PI / 2
    const px = Math.cos(angle) * r
    const py = Math.sin(angle) * r
    if (i === 0) shape.moveTo(px, py)
    else shape.lineTo(px, py)
  }
  shape.closePath()
  return shape
}

export default function MiniHearts() {
  const groupRef = useRef()
  const gemsData = useRef([])

  // Hình học Trái tim
  const heartGeom = useMemo(() => {
    const shape = createMiniHeartShape()
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 5,
      curveSegments: 24,
    })
    geom.center()
    geom.scale(0.13, 0.13, 0.13)
    return geom
  }, [])

  // Hình học Vì Tinh Tú (Ngôi sao 5 cánh)
  const starGeom = useMemo(() => {
    const shape = createStarShape(5, 1.0, 0.42)
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 4,
      curveSegments: 20,
    })
    geom.center()
    geom.scale(0.12, 0.12, 0.12)
    return geom
  }, [])

  // Khởi tạo danh sách xen kẽ: 50% Trái tim, 50% Tinh tú
  useMemo(() => {
    const starColors = [
      new THREE.Color('#ffd700'), // Vàng kim
      new THREE.Color('#fff275'), // Vàng nắng
      new THREE.Color('#ffffff'), // Bạch kim
      new THREE.Color('#a0e7e5'), // Xanh ngọc sao
      new THREE.Color('#ffd166'), // Vàng champagne
    ]

    const heartColors = [
      new THREE.Color('#ff4d88'), // Hồng dâu
      new THREE.Color('#ff70a6'), // Hồng phấn
      new THREE.Color('#ff2d78'), // Hồng ngọc
      new THREE.Color('#c850c0'), // Tím lavender
    ]

    for (let i = 0; i < TOTAL_GEMS_COUNT; i++) {
      const isStar = i % 2 === 1
      const color = isStar
        ? starColors[Math.floor(Math.random() * starColors.length)]
        : heartColors[Math.floor(Math.random() * heartColors.length)]

      gemsData.current.push({
        isStar,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 7.5,
          -4.5 + Math.random() * 9,
          (Math.random() - 0.5) * 3.5
        ),
        speed: 0.22 + Math.random() * 0.4,
        rotSpeed: (Math.random() - 0.5) * 2.5,
        wobbleSpeed: 1.0 + Math.random() * 1.8,
        wobbleAmount: 0.2 + Math.random() * 0.35,
        scale: 0.55 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 2 + Math.random() * 4,
        color,
      })
    }
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.children.forEach((child, i) => {
      const data = gemsData.current[i]
      if (!data) return

      // Bay từ dưới lên
      data.position.y += data.speed * delta

      // Lượn sóng nhẹ nhàng
      data.position.x += Math.sin(t * data.wobbleSpeed + data.phase) * data.wobbleAmount * delta

      // Reset khi bay quá cao
      if (data.position.y > 4.5) {
        data.position.y = -4.5
        data.position.x = (Math.random() - 0.5) * 7.5
      }

      child.position.copy(data.position)

      if (data.isStar) {
        // Tinh tú: Tự xoay tròn lấp lánh như kim cương
        child.rotation.z += data.rotSpeed * delta
        child.rotation.y += data.rotSpeed * 0.6 * delta
        // Hiệu ứng nhấp nháy phát sáng (twinkle)
        const twinkle = 0.5 + 0.5 * Math.sin(t * data.twinkleSpeed + data.phase)
        child.material.emissiveIntensity = 0.4 + twinkle * 0.6
      } else {
        // Trái tim: Lắc lư nhẹ nhàng, giữ thẳng đứng đúng chiều
        child.rotation.z = Math.sin(t * 1.4 + data.phase) * 0.18
        child.rotation.y += data.rotSpeed * delta * 0.35
      }

      // Độ mờ mượt mà theo độ cao
      const heightFade = 1 - Math.abs(data.position.y) / 4.5
      child.material.opacity = Math.max(0, heightFade * 0.7)
      child.scale.setScalar(data.scale)
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: TOTAL_GEMS_COUNT }).map((_, i) => {
        const data = gemsData.current[i] || {
          isStar: false,
          position: new THREE.Vector3(0, 0, 0),
          scale: 1,
          color: new THREE.Color('#ff6ba1'),
        }

        return (
          <mesh
            key={i}
            geometry={data.isStar ? starGeom : heartGeom}
            position={data.position}
            scale={data.scale}
          >
            <meshPhysicalMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={data.isStar ? 0.7 : 0.4}
              transparent
              opacity={0.7}
              metalness={data.isStar ? 0.8 : 0.2}
              roughness={data.isStar ? 0.1 : 0.2}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
