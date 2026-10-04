import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Floating 3D text "Mphuong xinkk" with glow and animation
 * Uses drei's Text3D with custom shader for glow effect
 */

export default function FloatingText({ font }) {
  const groupRef = useRef()
  const text1Ref = useRef()
  const text2Ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = -1.8 + Math.sin(t * 0.4) * 0.1
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={[0, -1.8, 0]}>
      <Center>
        <Text3D
          ref={text1Ref}
          font={font}
          size={0.35}
          height={0.08}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.015}
          bevelSize={0.008}
          bevelOffset={0}
          bevelSegments={5}
        >
          Mphuong xinkk
          <meshPhysicalMaterial
            color="#ff2d78"
            emissive="#ff1050"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={1}
            envMapIntensity={1}
          />
        </Text3D>
      </Center>
    </group>
  )
}

/**
 * Fallback text using HTML overlay for when 3D font is not available
 */
export function FloatingText2D() {
  const groupRef = useRef()
  const materialRef = useRef()

  const textShape = useMemo(() => {
    // Create text using canvas texture
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 256

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Glow effect
    ctx.shadowColor = '#ff2d78'
    ctx.shadowBlur = 30
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px "Dancing Script", cursive, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Draw multiple times for stronger glow
    for (let i = 0; i < 3; i++) {
      ctx.fillText('Mphuong xinkk', canvas.width / 2, canvas.height / 2)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = -1.6 + Math.sin(t * 0.4) * 0.1
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05
    }
    if (materialRef.current) {
      materialRef.current.opacity = 0.8 + Math.sin(t * 1.5) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[0, -1.6, 0]}>
      <mesh>
        <planeGeometry args={[3.5, 0.9]} />
        <meshBasicMaterial
          ref={materialRef}
          map={textShape}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
