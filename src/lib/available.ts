import femaleIds from '../data/female-ids.json'
import { structures, type Structure } from '../data/anatomy'
import type { Gender } from '../store/useAnatomyStore'

const FEMALE = new Set<string>(femaleIds)

/** Structures that have a mesh in the given model (female ids come from tools/build_female.mjs). */
export const availableFor = (g: Gender): readonly Structure[] =>
  g === 'female' ? structures.filter((s) => FEMALE.has(s.id)) : structures.filter((s) => !s.only)
