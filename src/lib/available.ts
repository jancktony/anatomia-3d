import { structures, type Structure } from '../data/anatomy'
import type { Gender } from '../store/useAnatomyStore'

/** The woman reuses every male layer and adds the female-only ones; the man never sees `only: 'female'` structures. */
export const availableFor = (g: Gender): readonly Structure[] => (g === 'female' ? structures : structures.filter((s) => !s.only))
