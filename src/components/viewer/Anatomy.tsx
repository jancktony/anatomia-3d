import { Suspense, useEffect, useMemo, type ComponentRef } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { DoubleSide, FrontSide, Vector3, type Mesh } from 'three'
import { useClip } from './clip'
import { structures } from '../../data/anatomy'
import { FILES, type LayerFile } from '../../lib/models'
import { useAnatomyStore } from '../../store/useAnatomyStore'


/** Ids shown right now, in data order: they define the cells of the exploded grid. */
function useGridIds(): readonly string[] {
  const active = useAnatomyStore((s) => s.activeSystems)
  const focus = useAnatomyStore((s) => s.focusIds)
  const iso = useAnatomyStore((s) => s.isolatedId)
  return useMemo(() => structures.filter((s) => (iso ? s.id === iso : focus ? focus.includes(s.id) : active.includes(s.system))).map((s) => s.id), [active, focus, iso])
}

const CELL = 0.55

function Layer({ url, system, color, roughness }: LayerFile) {
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
  const focusIds = useAnatomyStore((s) => s.focusIds)
  const studying = useAnatomyStore((s) => s.studyMode !== 'off')
  const setHover = useAnatomyStore((s) => s.setHover)
  const clip = useClip()
  const explode = useAnatomyStore((s) => s.explode)
  const gridIds = useGridIds()
  const info = useMemo(() => new Map(meshes.map((m) => {
    m.geometry.computeBoundingBox()
    const b = m.geometry.boundingBox!
    const sz = b.getSize(new Vector3())
    return [m.name, { c: b.getCenter(new Vector3()), fit: Math.min(0.42 / Math.max(sz.x, sz.y, sz.z, 1e-3), 4) }] as const
  })), [meshes])
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
        const visible = isolatedId ? isolatedId === id : focusIds ? focusIds.includes(id) : active
        if (!visible) return null
        const cell = gridIds.indexOf(id)
        if (explode > 0 && cell < 0) return null // "-resto" pieces have no cell in the exploded grid
        const selectable = !id.endsWith('-resto')
        const d = info.get(id)!
        const n = Math.max(gridIds.length, 1)
        const cols = Math.ceil(Math.sqrt(n * 1.6))
        const rows = Math.ceil(n / cols)
        const gx = ((cell % cols) - (cols - 1) / 2) * CELL
        const gy = 0.9 + ((rows - 1) / 2 - Math.floor(cell / cols)) * CELL
        const s = 1 + (d.fit - 1) * explode
        // p' = s*p + pos  moves the piece's bbox centre c to c + t*(grid - c) while scaling about c
        const pos: [number, number, number] = explode > 0
          ? [d.c.x * (1 - s) + explode * (gx - d.c.x), d.c.y * (1 - s) + explode * (gy - d.c.y), d.c.z * (1 - s) - explode * d.c.z]
          : [0, 0, 0]
        return (
          <mesh
            key={id}
            geometry={m.geometry}
            position={pos}
            scale={s}
            onPointerOver={selectable && !studying ? (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(id) } : undefined}
            onPointerOut={selectable && !studying ? () => setHover(null) : undefined}
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
