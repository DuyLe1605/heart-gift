import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Tạo hình trái tim 3D chuẩn xác:
 * - Mũi nhọn ở ĐÁY (y < 0)
 * - 2 vòm tròn mềm mại ở ĐỈNH (y > 0)
 */
function createHeartGeometry() {
  const shape = new THREE.Shape()

  // Mũi nhọn dưới đáy
  shape.moveTo(0, -2.2)

  // Vòm sườn phải
  shape.bezierCurveTo(1.5, -1.4, 2.8, 0.2, 2.8, 1.6)
  shape.bezierCurveTo(2.8, 2.8, 1.6, 3.2, 0.8, 2.8)
  shape.bezierCurveTo(0.3, 2.5, 0.1, 1.9, 0, 1.4) // Rãnh giữa

  // Vòm sườn trái đối xứng
  shape.bezierCurveTo(-0.1, 1.9, -0.3, 2.5, -0.8, 2.8)
  shape.bezierCurveTo(-1.6, 3.2, -2.8, 2.8, -2.8, 1.6)
  shape.bezierCurveTo(-2.8, 0.2, -1.5, -1.4, 0, -2.2)

  const extrudeSettings = {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.45,
    bevelSize: 0.35,
    bevelOffset: -0.05,
    bevelSegments: 20,
    curveSegments: 40,
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geometry.center()
  geometry.computeVertexNormals()

  return geometry
}

/**
 * Vòng thiên thể lấp lánh quay quanh trái tim
 */
function SaturnRings() {
  const ringRef = useRef()
  const ring2Ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.25
      ringRef.current.rotation.x = 1.25 + Math.sin(t * 0.4) * 0.08
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.18
      ring2Ref.current.rotation.y = 0.5 + Math.cos(t * 0.3) * 0.08
    }
  })

  return (
    <group>
      {/* Vòng chính ánh hồng */}
      <mesh ref={ringRef} rotation={[1.25, 0.2, 0]}>
        <torusGeometry args={[2.5, 0.04, 16, 80]} />
        <meshStandardMaterial
          color="#ff7eb3"
          emissive="#ff2d78"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Vòng phụ ánh vàng kim */}
      <mesh ref={ring2Ref} rotation={[0.4, 0.8, 0]}>
        <torusGeometry args={[3.0, 0.025, 16, 80]} />
        <meshStandardMaterial
          color="#ffd166"
          emissive="#ffaa00"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  )
}

// Kích thước chuẩn: nhỏ nhắn, tinh tế, vừa vặn trên cả iPhone màn hình hẹp lẫn máy tính
const BASE_SCALE = 0.14

export default function Heart3D({ onPointerDown }) {
  const meshRef = useRef()
  const innerRef = useRef()
  const groupRef = useRef()
  const hoverRef = useRef(false)
  const scaleAnim = useRef(1)

  const geometry = useMemo(() => createHeartGeometry(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Nhịp tim nhẹ nhàng êm dịu
    const baseBeat = Math.sin(t * 3.2) * 0.04 + (Math.sin(t * 6.4) > 0.65 ? 0.025 : 0)
    const targetScale = hoverRef.current ? 1.08 : 1.0
    scaleAnim.current = THREE.MathUtils.lerp(scaleAnim.current, targetScale, delta * 7)

    if (groupRef.current) {
      // Nhân trực tiếp với BASE_SCALE để luôn giữ kích thước nhỏ nhắn, chuẩn xác
      const currentScale = (scaleAnim.current + baseBeat) * BASE_SCALE
      groupRef.current.scale.set(currentScale, currentScale, currentScale)

      // Lắc lư nhẹ nhàng duyên dáng
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.15
      groupRef.current.rotation.z = Math.sin(t * 0.35) * 0.04
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.06
    }

    if (innerRef.current) {
      const innerScale = 0.88 + Math.sin(t * 3.2) * 0.05
      innerRef.current.scale.set(innerScale, innerScale, innerScale)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Trái tim chính: Pha lê hồng ngọc */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={() => { hoverRef.current = true }}
        onPointerOut={() => { hoverRef.current = false }}
        onPointerDown={(e) => {
          e.stopPropagation()
          scaleAnim.current = 1.25 // Nảy nhẹ khi chạm
          if (onPointerDown) onPointerDown(e)
        }}
      >
        <meshPhysicalMaterial
          color="#ff3377"
          emissive="#ff1a53"
          emissiveIntensity={0.35}
          roughness={0.1}
          metalness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          transmission={0.4}
          thickness={1.5}
          ior={1.45}
          reflectivity={0.9}
        />
      </mesh>

      {/* Lõi phát sáng dịu ngọt bên trong */}
      <mesh ref={innerRef} geometry={geometry}>
        <meshBasicMaterial
          color="#ff99bb"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Vòng thiên thể Saturn rings */}
      <SaturnRings />
    </group>
  )
}
