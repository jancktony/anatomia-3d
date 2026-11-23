import type { System } from '../data/anatomy'

const u = (n: string) => `${import.meta.env.BASE_URL}models/${n}.glb`

export interface LayerFile { readonly url: string; readonly system: System; readonly color: string; readonly roughness: number }

export const FILES: readonly LayerFile[] = [
  { url: u('bones'), system: 'esqueleto', color: '#e6dcc3', roughness: 0.65 },
  { url: u('muscles'), system: 'musculos', color: '#b5483f', roughness: 0.55 },
  { url: u('nerves'), system: 'nervioso', color: '#f2c94c', roughness: 0.5 },
  { url: u('lymph'), system: 'linfatico', color: '#6fd3f5', roughness: 0.5 },
  { url: u('viscera'), system: 'visceras', color: '#c77dff', roughness: 0.55 },
  { url: u('vessels'), system: 'vascular', color: '#c1121f', roughness: 0.45 },
]

const started = new Set<string>()

/** Warm the HTTP/SW cache for a layer (hover on a card) without pulling three.js into the main bundle. */
export function prefetchSystem(system: System): void {
  const f = FILES.find((x) => x.system === system)
  if (!f || started.has(f.url)) return
  started.add(f.url)
  void fetch(f.url).catch(() => started.delete(f.url))
}
