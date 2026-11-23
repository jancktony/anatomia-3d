import type { System } from '../data/anatomy'
import { useAnatomyStore } from '../store/useAnatomyStore'

const u = (n: string) => `${import.meta.env.BASE_URL}models/${n}.glb`

/** url = male layer (Z-Anatomy), urlF = female layer (Human Reference Atlas); a missing one means the layer does not exist for that model. */
export interface LayerFile { readonly url?: string; readonly urlF?: string; readonly system: System; readonly color: string; readonly roughness: number }

export const FILES: readonly LayerFile[] = [
  { url: u('bones'), urlF: u('bones_f'), system: 'esqueleto', color: '#e6dcc3', roughness: 0.65 },
  { url: u('muscles'), urlF: u('muscles_f'), system: 'musculos', color: '#b5483f', roughness: 0.55 },
  { url: u('nerves'), urlF: u('nerves_f'), system: 'nervioso', color: '#f2c94c', roughness: 0.5 },
  { url: u('lymph'), urlF: u('lymph_f'), system: 'linfatico', color: '#6fd3f5', roughness: 0.5 },
  { url: u('viscera'), urlF: u('viscera_f'), system: 'visceras', color: '#c77dff', roughness: 0.55 },
  { url: u('vessels'), urlF: u('vessels_f'), system: 'vascular', color: '#c1121f', roughness: 0.45 },
  { urlF: u('repro_f'), system: 'reproductor', color: '#f472b6', roughness: 0.55 },
  { urlF: u('senses_f'), system: 'sensorial', color: '#86efac', roughness: 0.3 },
]

export const skinUrl = (g: 'male' | 'female'): string => u(g)

export const layerUrl = (f: LayerFile, gender: 'male' | 'female'): string | undefined => (gender === 'female' ? f.urlF : f.url)

const started = new Set<string>()

/** Warm the HTTP/SW cache for a layer (hover on a card) without pulling three.js into the main bundle. */
export function prefetchSystem(system: System): void {
  const f = FILES.find((x) => x.system === system)
  const url = f && layerUrl(f, useAnatomyStore.getState().gender)
  if (!url || started.has(url)) return
  started.add(url)
  void fetch(url).catch(() => started.delete(url))
}
