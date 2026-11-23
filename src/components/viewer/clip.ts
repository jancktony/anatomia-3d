import { Plane, Vector3 } from 'three'
import { useAnatomyStore } from '../../store/useAnatomyStore'

const plane = new Plane(new Vector3(0, -1, 0), 0)

/** Axial section: hides everything above sectionY. Undefined when the section is off. */
export function useClip(): Plane[] | undefined {
  const y = useAnatomyStore((s) => s.sectionY)
  if (y === null) return undefined
  plane.constant = y // shortcut: one shared plane, fine while a single section exists
  return [plane]
}
