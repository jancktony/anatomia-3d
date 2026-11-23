import { useGLTF } from '@react-three/drei'
import { DoubleSide, FrontSide, type Mesh } from 'three'
import { useClip } from './clip'
import { skinUrl } from '../../lib/models'
import { useAnatomyStore } from '../../store/useAnatomyStore'

export const preloadBodies = () => (['male', 'female'] as const).forEach((g) => useGLTF.preload(skinUrl(g)))

export function Body() {
  const gender = useAnatomyStore((s) => s.gender)
  const skinOn = useAnatomyStore((s) => s.activeSystems.includes('piel'))
  const inner = useAnatomyStore((s) => s.activeSystems.some((x) => x !== 'piel') || s.isolatedId !== null || s.focusIds !== null)
  const clip = useClip()
  const { nodes } = useGLTF(skinUrl(gender)) as unknown as { nodes: { body: Mesh } }
  // pose mismatch: the skin (arms out) never overlays the layers
  if (!skinOn || inner) return null
  return (
    <mesh geometry={nodes.body.geometry} receiveShadow>
      <meshPhysicalMaterial color={gender === 'male' ? '#d8a68c' : '#e0ae97'} roughness={0.55} clippingPlanes={clip} side={clip ? DoubleSide : FrontSide} sheen={0.7} sheenRoughness={0.4} sheenColor="#ff9f8a" />
    </mesh>
  )
}
