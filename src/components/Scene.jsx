import { useRef, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import Heart3D from './Heart3D'
import ParticleField from './ParticleField'
import HeartTrail from './HeartTrail'
import SparkBurst from './SparkBurst'
import RibbonAurora from './RibbonAurora'
import StarField from './StarField'
import MiniHearts from './MiniHearts'

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.7} color="#ffeef8" />
      <pointLight position={[3, 3, 4]} intensity={2.2} color="#ffffff" distance={15} />
      <pointLight position={[-4, 2, -2]} intensity={2.5} color="#ff3399" distance={15} />
      <pointLight position={[0, -3, 3]} intensity={1.8} color="#ffd166" distance={10} />
      <directionalLight position={[0, 5, 2]} intensity={1.2} color="#e0aaff" />
    </>
  )
}

function PostEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.8}
        mipmapBlur
      />
      <Vignette
        offset={0.25}
        darkness={0.65}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}

export default function Scene({ onHeartTap }) {
  const sparkRef = useRef()

  const handleHeartTap = useCallback((e) => {
    if (sparkRef.current && e?.point) {
      sparkRef.current(e.point)
    }
    if (onHeartTap) onHeartTap()
  }, [onHeartTap])

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: '#090014', touchAction: 'none' }}
    >
      <color attach="background" args={['#090014']} />
      <fog attach="fog" args={['#090014', 7, 25]} />

      <Suspense fallback={null}>
        {/* Điều khiển xoay 360 độ */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.0}
          maxDistance={8.0}
          rotateSpeed={0.7}
          enableDamping
          dampingFactor={0.06}
          autoRotate
          autoRotateSpeed={0.8}
        />

        <SceneLighting />

        {/* Trái tim 3D vừa vặn, bồng bềnh ở trung tâm */}
        <Float speed={1.5} rotationIntensity={0.12} floatIntensity={0.2}>
          <Heart3D onPointerDown={handleHeartTap} />
        </Float>

        {/* Hạt sao & vệt sáng */}
        <ParticleField count={180} />
        <HeartTrail />
        <SparkBurst triggerRef={sparkRef} />
        <RibbonAurora />
        <StarField />
        <MiniHearts />

        <PostEffects />
      </Suspense>
    </Canvas>
  )
}
