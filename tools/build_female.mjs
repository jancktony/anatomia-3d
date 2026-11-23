// node tools/build_female.mjs <dir with atlas.json + female-N.bin.gz> <out dir>
// Converts the Human Reference Atlas female set (CC BY 4.0) into one decimated GLB per layer, nodes named after structure ids.
import { readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { join } from 'node:path'
import { MeshoptSimplifier } from 'meshoptimizer'
import { LAYERS, groupOf, layerOf } from './female_groups.mjs'
import { writeGlb } from './glb.mjs'

const [,, src, out] = process.argv
const BUDGET = { bones_f: 160000, muscles_f: 200000, nerves_f: 120000, vessels_f: 130000, lymph_f: 40000, viscera_f: 140000, repro_f: 80000 }
const WORLD_H = 2.05, FEET_Y = -0.34 // matches the female skin in tools/build_bodies.py

const atlas = JSON.parse(readFileSync(join(src, 'atlas.json'), 'utf8'))
const ymin = Math.min(...atlas.parts.map((p) => p.bounds[0][1])), ymax = Math.max(...atlas.parts.map((p) => p.bounds[1][1]))
const S = WORLD_H / (ymax - ymin)
await MeshoptSimplifier.ready

const chunks = new Map()
const chunk = (i) => {
  if (!chunks.has(i)) {
    const b = gunzipSync(readFileSync(join(src, `female-${i}.bin.gz`)))
    chunks.set(i, b.buffer.slice(b.byteOffset, b.byteOffset + b.length)) // exact, 4-byte aligned ArrayBuffer
    if (chunks.size > 3) chunks.delete(chunks.keys().next().value) // parts are grouped by chunk: keep memory low
  }
  return chunks.get(i)
}

// duplicated vertices (hard edges) block edge collapses: merge by position (1e-5 m) before simplifying
function weld(pos, idx) {
  const map = new Map(), outPos = [], remap = new Uint32Array(pos.length / 3)
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(pos[i * 3] * 1e5)},${Math.round(pos[i * 3 + 1] * 1e5)},${Math.round(pos[i * 3 + 2] * 1e5)}`
    let id = map.get(k)
    if (id === undefined) { id = outPos.length / 3; map.set(k, id); outPos.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]) }
    remap[i] = id
  }
  return { pos: new Float32Array(outPos), idx: idx.map((i) => remap[i]) }
}

const byLayer = {}
for (const p of atlas.parts) {
  const l = layerOf(p.system)
  if (l) (byLayer[l] ??= []).push(p)
}

const ids = new Set()
for (const [layer, parts] of Object.entries(byLayer)) {
  parts.sort((a, b) => a.chunk - b.chunk)
  const total = parts.reduce((s, p) => s + p.indexCount / 3, 0)
  const ratio = Math.min(1, BUDGET[layer] / total)
  const groups = new Map(LAYERS[layer].rules.map(([g]) => [g, { pos: [], idx: [], base: 0 }]))
  for (const p of parts) {
    const buf = chunk(p.chunk)
    const { pos, idx: idx0 } = weld(new Float32Array(buf, p.positions, p.vertexCount * 3), new Uint32Array(buf, p.indices, p.indexCount))
    let idx = idx0
    const tris = idx.length / 3
    if (tris > 100) [idx] = MeshoptSimplifier.simplify(idx, pos, 3, Math.max(100, Math.floor(tris * ratio)) * 3, 0.06)
    const g = groups.get(groupOf(layer, p.name)), remap = new Map()
    for (const i of idx) {
      let id = remap.get(i)
      if (id === undefined) { id = g.base + remap.size; remap.set(i, id); g.pos.push(pos[i * 3] * S, pos[i * 3 + 1] * S + FEET_Y, pos[i * 3 + 2] * S) }
      g.idx.push(id)
    }
    g.base += remap.size
  }
  const { bytes, report } = writeGlb(groups, join(out, `${layer}.glb`), 'atlas-anatomia / Human Reference Atlas female (CC BY 4.0) + BodyParts3D, decimated', layer)
  for (const k of Object.keys(report)) ids.add(k)
  console.log(layer.padEnd(10), 'inputTris', Math.round(total), 'bytes', bytes, Object.entries(report).map(([k, v]) => `${k}:${Math.round(v.tris)}`).join(' '))
}
// selectable ids available in female mode (the "-resto" pieces are not selectable)
writeFileSync(join(out, 'female-ids.json'), JSON.stringify([...ids].filter((k) => !k.endsWith('-resto')).sort()))
