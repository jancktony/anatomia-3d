import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { System } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

const FILES = [
  { url: '/models/bones.glb', system: 'esqueleto' as System, color: '#e6dcc3', roughness: 0.65 },
  { url: '/models/muscles.glb', system: 'musculos' as System, color: '#b5483f', roughness: 0.55 },
  { url: '/models/nerves.glb', system: 'nervioso' as System, color: '#f2c94c', roughness: 0.5 },
  { url: '/models/vessels.glb', system: 'vascular' as System, color: '#c1121f', roughness: 0.45 },
]

function Layer({ url, system, color, roughness }: (typeof FILES)[number]) {
  const { scene } = useGLTF(url)
  const meshes = useMemo(() => {
    const out: Mesh[] = []
    scene.traverse((o) => { if ((o as Mesh).isMesh) out.push(o as Mesh) })
    return out
  }, [scene])
  const active = useAnatomyStore((s) => s.activeSystems.includes(system))
  const isolatedId = useAnatomyStore((s) => s.isolatedId)
  const selectedId = useAnatomyStore((s) => s.selectedId)
  const setSelected = useAnatomyStore((s) => s.setSelected)
  const gender = useAnatomyStore((s) => s.gender)
  return (
    <group scale={gender === 'female' ? 0.936 : 1} position={[0, gender === 'female' ? -0.34 * (1 - 0.936) : 0, 0]}>
      {meshes.map((m) => {
        const id = m.name
        const visible = isolatedId ? isolatedId === id : active
        if (!visible) return null
        const selectable = !id.endsWith('-resto')
        return (
          <mesh
            key={id}
            geometry={m.geometry}
            castShadow
            onClick={selectable ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); setSelected(id) } : undefined}
          >
            <meshStandardMaterial color={color} roughness={roughness} emissive={selectedId === id ? '#2dd4bf' : '#000000'} emissiveIntensity={selectedId === id ? 0.45 : 0} />
          </mesh>
        )
      })}
    </group>
  )
}

// Mount (and fetch) a layer only when needed; the SW precaches the rest in the background.
export function Anatomy() {
  const active = useAnatomyStore((s) => s.activeSystems)
  const isolated = useAnatomyStore((s) => s.isolatedId !== null)
  return <>{FILES.filter((f) => isolated || active.includes(f.system)).map((f) => <Suspense key={f.url} fallback={null}><Layer {...f} /></Suspense>)}</>
}
