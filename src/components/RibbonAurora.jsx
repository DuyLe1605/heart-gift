import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Floating ribbon/aurora effect that wraps around the scene
 * Creates ethereal, flowing ribbon of light
 */

const RIBBON_SEGMENTS = 200

const ribbonVertexShader = `
  attribute float aIndex;
  attribute float aSide;
  
  varying float vIndex;
  varying float vSide;
  varying vec3 vPos;
  
  uniform float uTime;
  uniform float uTotal;
  
  void main() {
    vIndex = aIndex;
    vSide = aSide;
    
    float t = aIndex / uTotal;
    float angle = t * 6.28318 * 2.0 + uTime * 0.3;
    
    // Flowing ribbon path
    float r = 2.5 + sin(t * 12.0 + uTime * 0.5) * 0.5;
    float x = cos(angle) * r;
    float z = sin(angle) * r;
    float y = sin(t * 8.0 + uTime * 0.7) * 1.0 + cos(t * 5.0 + uTime * 0.3) * 0.5;
    
    // Width variation
    float width = 0.05 + 0.03 * sin(t * 20.0 + uTime);
    
    // Create ribbon by offsetting perpendicular
    vec3 pos = vec3(x, y, z);
    vec3 tangent = normalize(vec3(-sin(angle), cos(t * 8.0 + uTime * 0.7) * 0.3, cos(angle)));
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 perp = normalize(cross(tangent, up));
    
    pos += perp * aSide * width;
    vPos = pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const ribbonFragmentShader = `
  varying float vIndex;
  varying float vSide;
  varying vec3 vPos;
  
  uniform float uTime;
  uniform float uTotal;
  
  void main() {
    float t = vIndex / uTotal;
    
    // Color gradient along ribbon
    vec3 color1 = vec3(1.0, 0.18, 0.47); // Pink
    vec3 color2 = vec3(0.78, 0.31, 0.75); // Purple
    vec3 color3 = vec3(1.0, 0.84, 0.0);   // Gold
    
    float colorT = sin(t * 6.28 + uTime * 0.5) * 0.5 + 0.5;
    vec3 color = mix(color1, color2, colorT);
    color = mix(color, color3, sin(t * 12.56 + uTime) * 0.3 + 0.2);
    
    // Fade at edges
    float edgeFade = 1.0 - abs(vSide);
    float lengthFade = sin(t * 3.14159);
    
    // Shimmer
    float shimmer = 0.5 + 0.5 * sin(t * 50.0 + uTime * 3.0);
    
    float alpha = edgeFade * lengthFade * 0.15 * (0.7 + shimmer * 0.3);
    
    gl_FragColor = vec4(color, alpha);
  }
`

export default function RibbonAurora() {
  const meshRef = useRef()

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(RIBBON_SEGMENTS * 2 * 3)
    const indices = []
    const indexAttr = new Float32Array(RIBBON_SEGMENTS * 2)
    const sideAttr = new Float32Array(RIBBON_SEGMENTS * 2)

    for (let i = 0; i < RIBBON_SEGMENTS; i++) {
      const vi = i * 2
      // Top vertex
      indexAttr[vi] = i
      sideAttr[vi] = 1
      // Bottom vertex
      indexAttr[vi + 1] = i
      sideAttr[vi + 1] = -1

      // Initialize positions (will be computed in shader)
      const i6 = i * 6
      positions[i6] = 0
      positions[i6 + 1] = 0
      positions[i6 + 2] = 0
      positions[i6 + 3] = 0
      positions[i6 + 4] = 0
      positions[i6 + 5] = 0
    }

    // Create triangles
    for (let i = 0; i < RIBBON_SEGMENTS - 1; i++) {
      const vi = i * 2
      indices.push(vi, vi + 1, vi + 2)
      indices.push(vi + 1, vi + 3, vi + 2)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('aIndex', new THREE.Float32BufferAttribute(indexAttr, 1))
    geometry.setAttribute('aSide', new THREE.Float32BufferAttribute(sideAttr, 1))
    geometry.setIndex(indices)

    return { geometry }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uTotal: { value: RIBBON_SEGMENTS },
  }), [])

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={ribbonVertexShader}
        fragmentShader={ribbonFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
