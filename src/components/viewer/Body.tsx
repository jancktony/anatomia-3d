import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { DoubleSide, FrontSide, type Mesh } from 'three'
import { useClip } from './clip'
import { useAnatomyStore, type Gender } from '../../store/useAnatomyStore'

const url = (g: Gender) => `/models/${g}.glb`
export const preloadBodies = () => (['male', 'female'] as const).forEach((g) => useGLTF.preload(url(g)))

export function Body() {
  const gender = useAnatomyStore((s) => s.gender)
  const skinOn = useAnatomyStore((s) => s.activeSystems.includes('piel'))
  const inner = useAnatomyStore((s) => s.activeSystems.some((x) => x !== 'piel') || s.isolatedId !== null)
  const { nodes } = useGLTF(url(gender)) as unknown as { nodes: { body: Mesh } }
  const clip = useClip()
  const geometry = useMemo(() => nodes.body.geometry, [nodes])
  // pose mismatch: skin (arms out) vs Z-Anatomy (arms down) -> never overlay them
  if (!skinOn || inner) return null
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={gender === 'male' ? '#d8a68c' : '#e0ae97'}
        roughness={0.55}
        clippingPlanes={clip}
        side={clip ? DoubleSide : FrontSide}
        sheen={0.7}
        sheenRoughness={0.4}
        sheenColor="#ff9f8a"
      />
    </mesh>
  )
}
