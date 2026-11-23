// node tools/build_female.mjs <dir with atlas.json + female-N.bin.gz> <out dir>
// Converts the female-specific parts of the Human Reference Atlas (CC BY 4.0) into repro_f.glb / senses_f.glb, nodes named after structure ids.
// Output frame = the male Z-Anatomy frame (tools/build_anatomy.mjs), so the woman reuses the same group transform (x0.936) as every male layer.
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { join } from 'node:path'
import { MeshoptSimplifier } from 'meshoptimizer'
import { LAYERS, ALIGN_VH, groupFor, layerFor } from './female_groups.mjs'
import { writeGlb } from './glb.mjs'

const [,, src, out] = process.argv
const BUDGET = { repro_f: 80000, senses_f: 40000 }
// Z-Anatomy frame: world = (cm - 0.71) * 2.19 / 171.35 - 0.34 (y); the dataset's BodyParts3D body is 1.666 m tall
const K = ((171.35 - 0.71) * (2.19 / 171.35)) / 1.666
const FEET_Y = -0.34
// BodyParts3D bones present in both sources (ribs, sternum, femur, tibia, skull) differ by ~+0.075 world in depth (z): measured, see CHANGELOG
const Z_OFF = 0.075

const atlas = JSON.parse(readFileSync(join(src, 'atlas.json'), 'utf8'))
await MeshoptSimplifier.ready

const cache = new Map()
const chunk = (i) => {
  if (!cache.has(i)) {
    const b = gunzipSync(readFileSync(join(src, `female-${i}.bin.gz`)))
    cache.set(i, b.buffer.slice(b.byteOffset, b.byteOffset + b.length))
    if (cache.size > 3) cache.delete(cache.keys().next().value)
  }
  return cache.get(i)
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

// The dataset's breasts are 24 cm tall in the Z-Anatomy frame and reach the collarbone: shrink each one about its own centre, put it at mid-pectoral
// height and leave ~4 cm of it in front of the pectoral surface (z 0.161), its base sunk in the muscle (pectoral spans z -0.02..0.161).
const MAMA_SCALE = 0.75, MAMA_Y = 1.265, MAMA_APEX_Z = 0.2
function fitBreasts(pos) {
  for (const side of [-1, 1]) {
    const v = []
    for (let i = 0; i < pos.length; i += 3) if (Math.sign(pos[i]) === side) v.push(i)
    if (!v.length) continue
    const lo = [9, 9, 9], hi = [-9, -9, -9]
    for (const i of v) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]) }
    const c = lo.map((l, k) => (l + hi[k]) / 2), depth = (hi[2] - lo[2]) * MAMA_SCALE
    const target = [c[0], MAMA_Y, MAMA_APEX_Z - depth / 2]
    for (const i of v) for (let k = 0; k < 3; k++) pos[i + k] = target[k] + MAMA_SCALE * (pos[i + k] - c[k])
  }
}

const byLayer = {}
for (const p of atlas.parts) { const l = layerFor(p); if (l) (byLayer[l] ??= []).push(p) }

for (const [layer, parts] of Object.entries(byLayer)) {
  parts.sort((a, b) => a.chunk - b.chunk)
  const total = parts.reduce((s, p) => s + p.indexCount / 3, 0)
  const ratio = Math.min(1, BUDGET[layer] / total)
  const groups = new Map(LAYERS[layer].rules.map(([g]) => [g, { pos: [], idx: [], base: 0 }]))
  for (const p of parts) {
    const gName = groupFor(layer, p), g = groups.get(gName), remap = new Map()
    const [dy, dz] = p.id.startsWith('VH_F') ? (ALIGN_VH[gName] ?? [0, 0]) : [0, 0]
    const buf = chunk(p.chunk)
    const { pos, idx: idx0 } = weld(new Float32Array(buf, p.positions, p.vertexCount * 3), new Uint32Array(buf, p.indices, p.indexCount))
    let idx = idx0
    const tris = idx.length / 3
    if (tris > 100) [idx] = MeshoptSimplifier.simplify(idx, pos, 3, Math.max(100, Math.floor(tris * ratio)) * 3, 0.06)
    for (const i of idx) {
      let id = remap.get(i)
      if (id === undefined) { id = g.base + remap.size; remap.set(i, id); g.pos.push(pos[i * 3] * K, (pos[i * 3 + 1] + dy) * K + FEET_Y, (pos[i * 3 + 2] + dz) * K + Z_OFF) }
      g.idx.push(id)
    }
    g.base += remap.size
  }
  if (groups.has('mama')) fitBreasts(groups.get('mama').pos)
  const { bytes, report } = writeGlb(groups, join(out, `${layer}.glb`), 'atlas-anatomia / Human Reference Atlas female (CC BY 4.0) + BodyParts3D, decimated', layer)
  console.log(layer.padEnd(10), 'inputTris', Math.round(total), 'bytes', bytes, Object.entries(report).map(([k, v]) => `${k}:${Math.round(v.tris)}`).join(' '))
}
