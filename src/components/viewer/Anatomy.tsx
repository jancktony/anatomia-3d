import { Suspense, useEffect, useMemo, type ComponentRef } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { DoubleSide, FrontSide, Vector3, type Mesh } from 'three'
import { useClip } from './clip'
import { structures } from '../../data/anatomy'
import { FILES, layerUrl, type LayerFile } from '../../lib/models'
import { availableFor } from '../../lib/available'
import { useAnatomyStore } from '../../store/useAnatomyStore'


/** Ids shown right now, in data order: they define the cells of the exploded grid. */
function useGridIds(): readonly string[] {
  const active = useAnatomyStore((s) => s.activeSystems)
  const focus = useAnatomyStore((s) => s.focusIds)
  const iso = useAnatomyStore((s) => s.isolatedId)
  const gender = useAnatomyStore((s) => s.gender)
  return useMemo(() => availableFor(gender).filter((s) => (iso ? s.id === iso : !ON_DEMAND.has(s.id) && (focus ? focus.includes(s.id) : active.includes(s.system)))).map((s) => s.id), [active, focus, iso, gender])
}

const CELL = 0.55
// the woman is the same BodyParts3D body drawn at her height (2.05 vs 2.19 world units), feet kept on the floor
const F_SCALE = 2.05 / 2.19
const F_DY = -0.34 * (1 - F_SCALE)
// the pregnancy set is a separate gravid uterus that overlaps the normal one: only show it when picked on its own
const ON_DEMAND = new Set(['embarazo'])

function Layer({ url, system, color, roughness }: Pick<LayerFile, 'system' | 'color' | 'roughness'> & { url: string }) {
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
  const quizTarget = useAnatomyStore((s) => s.quizTarget)
  const female = useAnatomyStore((s) => s.gender === 'female')
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
    const c = box.getCenter(new Vector3())
    if (female) { c.multiplyScalar(F_SCALE); c.y += F_DY }
    const dir = camera.position.clone().sub(controls.target).normalize()
    controls.target.copy(c)
    camera.position.copy(c).addScaledVector(dir, Math.max(box.getSize(new Vector3()).length() * (female ? F_SCALE : 1) * 1.8, 0.3))
    controls.update()
  }, [isolatedId, meshes, controls, camera, female])
  return (
    <group scale={female ? F_SCALE : 1} position={[0, female ? F_DY : 0, 0]}>
      {meshes.map((m) => {
        const id = m.name
        const visible = isolatedId ? isolatedId === id : ON_DEMAND.has(id) ? false : focusIds ? focusIds.includes(id) : active
        if (!visible || (female && id === 'genitales-resto')) return null
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
  const gender = useAnatomyStore((s) => s.gender)
  const isolatedSystem = useAnatomyStore((s) => (s.isolatedId ? structures.find((x) => x.id === s.isolatedId)?.system : undefined))
  const isolated = useAnatomyStore((s) => s.isolatedId !== null)
  return <>{FILES.flatMap((f) => {
    const url = layerUrl(f, gender)
    return url && (isolated ? f.system === isolatedSystem : active.includes(f.system)) ? [{ ...f, url }] : []
  }).map((f) => <Suspense key={f.url} fallback={null}><Layer {...f} /></Suspense>)}</>
}
