import { Suspense, useEffect, useMemo, type ComponentRef } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { DoubleSide, FrontSide, Vector3, type Mesh } from 'three'
import { useClip } from './clip'
import { structures, type System } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

const FILES = [
  { url: `${import.meta.env.BASE_URL}models/bones.glb`, system: 'esqueleto' as System, color: '#e6dcc3', roughness: 0.65 },
  { url: `${import.meta.env.BASE_URL}models/muscles.glb`, system: 'musculos' as System, color: '#b5483f', roughness: 0.55 },
  { url: `${import.meta.env.BASE_URL}models/nerves.glb`, system: 'nervioso' as System, color: '#f2c94c', roughness: 0.5 },
  { url: `${import.meta.env.BASE_URL}models/lymph.glb`, system: 'linfatico' as System, color: '#6fd3f5', roughness: 0.5 },
  { url: `${import.meta.env.BASE_URL}models/viscera.glb`, system: 'visceras' as System, color: '#c77dff', roughness: 0.55 },
  { url: `${import.meta.env.BASE_URL}models/vessels.glb`, system: 'vascular' as System, color: '#c1121f', roughness: 0.45 },
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
  const quizTarget = useAnatomyStore((s) => s.quizTarget)
  const studying = useAnatomyStore((s) => s.studyMode !== 'off')
  const clip = useClip()
  const controls = useThree((s) => s.controls) as ComponentRef<typeof OrbitControls> | null
  const camera = useThree((s) => s.camera)
  // frame the isolated structure: tiny ones (tonsils, nodes) are invisible from the default distance
  useEffect(() => {
    const m = meshes.find((x) => x.name === isolatedId)
    if (!m || !controls) return
    m.geometry.computeBoundingBox()
    const box = m.geometry.boundingBox!
    const k = gender === 'female' ? 0.936 : 1
    const c = box.getCenter(new Vector3()).multiplyScalar(k)
    if (k !== 1) c.y += -0.34 * (1 - k)
    const dir = camera.position.clone().sub(controls.target).normalize()
    controls.target.copy(c)
    camera.position.copy(c).addScaledVector(dir, Math.max(box.getSize(new Vector3()).length() * k * 1.8, 0.3))
    controls.update()
  }, [isolatedId, meshes, controls, camera, gender])
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
            onClick={selectable && !studying ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); setSelected(id) } : undefined}
          >
            <meshStandardMaterial color={color} roughness={roughness} clippingPlanes={clip} side={clip ? DoubleSide : FrontSide} emissive={selectedId === id || quizTarget === id ? '#2dd4bf' : '#000000'} emissiveIntensity={selectedId === id || quizTarget === id ? 0.45 : 0} />
          </mesh>
        )
      })}
    </group>
  )
}

// Mount (and fetch) a layer only when needed; the SW precaches the rest in the background.
export function Anatomy() {
  const active = useAnatomyStore((s) => s.activeSystems)
  const isolatedSystem = useAnatomyStore((s) => (s.isolatedId ? structures.find((x) => x.id === s.isolatedId)?.system : undefined))
  const isolated = useAnatomyStore((s) => s.isolatedId !== null)
  return <>{FILES.filter((f) => (isolated ? f.system === isolatedSystem : active.includes(f.system))).map((f) => <Suspense key={f.url} fallback={null}><Layer {...f} /></Suspense>)}</>
}
