import { readFileSync, writeFileSync } from 'node:fs'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { Vector3 } from 'three'
import { MeshoptSimplifier } from 'meshoptimizer'

const [,, input, output, kind, budgetStr] = process.argv
const BUDGET = Number(budgetStr)
const SCALE = 2.19 / 171.35, Y0 = 0.71, FEET_Y = -0.34

const BONE_GROUPS = [
  ['craneo', /^(frontal_bone|parietal_bone|occipital_bone|temporal_bone|sphenoid_bone|ethmoid_bone|nasal_bone|maxilla|mandible|zygomatic_bone|lacrimal_bone|palatine_bone|inferior_nasal_concha_bone|vomer)/i],
  ['columna-vertebral', /^(atlas|axis|vertebra_|sacrum|coccyx)/i],
  ['esternon', /^(body_of_sternum|manubrium_of_sternum|xiphoid_process)/i],
  ['costillas', /_rib[lr]?$/i],
  ['humerus', /^humerus/i], ['radio', /^radius/i], ['cubito', /^ulna/i],
  ['femur', /^femur/i], ['tibia', /^tibia/i], ['perone', /^fibula/i],
  ['esqueleto-resto', /(_bone|^patella|^clavicle|^scapula|phalanx|metacarpal|metatarsal|^calcaneus|^talus|sesamoid)/i],
]
const MUSCLE_BAD = /bursa|sheath|fascia|ligament|retinaculum|aponeurosis|membrane|capsule|synovial|vagina|cartilage|septum|raphe/i
const MUSCLE_GROUPS = [
  ['deltoides', /deltoid/i], ['pectorales-mayor', /pectoralis_major/i],
  ['biceps-braquial', /biceps_brachii/i], ['triceps-braquial', /triceps_brachii/i],
  ['cuadriceps', /(rectus_femoris|vastus_|quadriceps)/i],
  ['isquiotibiales', /(biceps_femoris|semitendinosus|semimembranosus)/i],
  ['gastrocnemio', /gastrocnemius/i],
  ['musculos-resto', /./],
]
const NERVE_GROUPS = [
  ['encefalo', /(telencephalon|cerebell|diencephalon|midbrain|pons|medulla_oblongata|brainstem|corpus_callosum|thalam|hypothalam|gyrus|lobe|cortex|ventricle|falx|tentorium|aqueduct|pyramid)/i],
  ['medula-espinal', /spinal_cord/i],
  ['nervio-ciatico', /^sciatic_nerve/i],
  ['nervioso-resto', /./],
]
const VESSEL_GROUPS = [
  ['corazon', /(ventricle|atrium|atrial|heart|valve|papillary|chordae|auricle|cardiac|coronary)/i],
  ['aorta', /aorta|aortic/i],
  ['arteria-femoral', /^femoral_artery/i],
  ['vascular-resto', /./],
]
const LYMPH_GROUPS = [
  ['bazo', /^spleen/i], ['timo', /thymus/i], ['amigdalas', /tonsil/i],
  ['ganglios-cervicales', /(cervical|jugul|submandibular|submental|occipital|mastoid|parotid|auricular|retropharyngeal|supraclavicular|mandibular|bucinator|nasolabial|thyroid_nodes)/i],
  ['ganglios-axilares', /(axillary|brachial|cubital|infraclavicular|interpectoral|supratrochlear)/i],
  ['ganglios-inguinales', /(inguinal|iliac|obturator|lacunar|gluteal|sacral|popliteal|tibial|fibular|epigastric)/i],
  ['linfatico-resto', /./],
]
const VISCERA_GROUPS = [
  ['higado', /liver/i], ['estomago', /^stomach/i], ['esofago', /oesophagus/i],
  ['pulmones', /(lobe_of_(left|right)_lung|^pleura)/i], ['traquea-bronquios', /(trachea|bronch)/i],
  ['rinones', /(^kidney|renal_pelvis)/i], ['vejiga-urinaria', /(urinary_bladde|ureter|urethra)/i],
  ['pancreas', /pancrea/i], ['vesicula-biliar', /(gallbladde|bile_duct|cystic)/i],
  ['intestino-delgado', /(duodenum|jejunum|ileum)/i],
  ['intestino-grueso', /(colon|appendix|taenia|caecum|rectum|anal_)/i],
  ['tiroides', /(thyroid|parathyroid)/i],
  ['visceras-resto', /./],
]
const groups = { bones: BONE_GROUPS, muscles: MUSCLE_GROUPS, nerves: NERVE_GROUPS, vessels: VESSEL_GROUPS, lymph: LYMPH_GROUPS, viscera: VISCERA_GROUPS }[kind]
const groupOf = (name) => {
  if (kind === 'muscles' && MUSCLE_BAD.test(name)) return null
  return groups.find(([, re]) => re.test(name))?.[0] ?? null
}

const buf = readFileSync(input)
const root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '')
root.updateMatrixWorld(true)
await MeshoptSimplifier.ready

const items = []
root.traverse((o) => {
  if (!o.isMesh || o.geometry.attributes.position.count < 100) return
  const g = groupOf(o.name)
  if (g) items.push({ o, g })
})
const totalTris = items.reduce((a, { o }) => a + o.geometry.attributes.position.count / 3, 0)
const ratio = Math.min(1, BUDGET / totalTris)

function weld(o) {
  const p = o.geometry.attributes.position, m = o.matrixWorld, v = new Vector3()
  const map = new Map(), pos = [], idx = []
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(m)
    const k = `${Math.round(v.x * 200)},${Math.round(v.y * 200)},${Math.round(v.z * 200)}`
    let id = map.get(k)
    if (id === undefined) { id = pos.length / 3; map.set(k, id); pos.push(v.x, v.y, v.z) }
    idx.push(id)
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) }
}

const acc = new Map(groups.map(([g]) => [g, { pos: [], idx: [], base: 0 }]))
for (const { o, g } of items) {
  let { pos, idx } = weld(o)
  const tris = idx.length / 3
  if (tris > 300) {
    const target = Math.max(300, Math.floor(tris * ratio)) * 3
    ;[idx] = MeshoptSimplifier.simplify(idx, pos, 3, target, 0.03)
  }
  const a = acc.get(g), remap = new Map()
  for (const i of idx) {
    let id = remap.get(i)
    if (id === undefined) { id = a.base + remap.size; remap.set(i, id); a.pos.push(pos[i * 3] * SCALE, (pos[i * 3 + 1] - Y0) * SCALE + FEET_Y, pos[i * 3 + 2] * SCALE) }
    a.idx.push(id)
  }
  a.base += remap.size
}

const blobs = [], bufferViews = [], accessors = [], meshes = [], nodes = [], report = {}
const push = (arr, target) => {
  const pad = (-blobs.reduce((s, b) => s + b.length, 0)) & 3
  if (pad) blobs.push(Buffer.alloc(pad))
  const off = blobs.reduce((s, b) => s + b.length, 0)
  blobs.push(Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength))
  bufferViews.push({ buffer: 0, byteOffset: off, byteLength: arr.byteLength, target })
  return bufferViews.length - 1
}
for (const [name, a] of acc) {
  if (!a.idx.length) continue
  const pos = new Float32Array(a.pos), idx = new Uint32Array(a.idx), n = new Float32Array(pos.length)
  for (let i = 0; i < idx.length; i += 3) {
    const [i0, i1, i2] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3]
    const ux = pos[i1] - pos[i0], uy = pos[i1 + 1] - pos[i0 + 1], uz = pos[i1 + 2] - pos[i0 + 2]
    const wx = pos[i2] - pos[i0], wy = pos[i2 + 1] - pos[i0 + 1], wz = pos[i2 + 2] - pos[i0 + 2]
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx
    for (const j of [i0, i1, i2]) { n[j] += fx; n[j + 1] += fy; n[j + 2] += fz }
  }
  const n8 = new Int8Array(pos.length + (pos.length / 3) % 1) // snorm8 VEC3 needs 4-byte stride: pad per vertex
  const nv = new Int8Array((pos.length / 3) * 4)
  for (let i = 0, k = 0; i < n.length; i += 3, k += 4) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1
    nv[k] = Math.round((n[i] / l) * 127); nv[k + 1] = Math.round((n[i + 1] / l) * 127); nv[k + 2] = Math.round((n[i + 2] / l) * 127)
  }
  void n8
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < pos.length; i += 3) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], pos[i + c]); max[c] = Math.max(max[c], pos[i + c]) }
  const big = pos.length / 3 > 65535
  const iv = push(big ? idx : new Uint16Array(idx), 34963)
  accessors.push({ bufferView: iv, componentType: big ? 5125 : 5123, count: idx.length, type: 'SCALAR' })
  const pv = push(pos, 34962)
  accessors.push({ bufferView: pv, componentType: 5126, count: pos.length / 3, type: 'VEC3', min, max })
  const nvv = push(nv, 34962); bufferViews[nvv].byteStride = 4
  accessors.push({ bufferView: nvv, componentType: 5120, normalized: true, count: pos.length / 3, type: 'VEC3' })
  const base = accessors.length - 3
  meshes.push({ primitives: [{ attributes: { POSITION: base + 1, NORMAL: base + 2 }, indices: base, material: 0 }] })
  nodes.push({ name, mesh: meshes.length - 1 })
  report[name] = { verts: pos.length / 3, tris: idx.length / 3 }
}
const bin = Buffer.concat(blobs); const binPad = Buffer.alloc((-bin.length) & 3)
const json = {
  asset: { version: '2.0', generator: 'atlas-anatomia / Z-Anatomy (CC BY-SA 4.0), decimated' },
  scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }], nodes, meshes, accessors, bufferViews,
  materials: [{ name: kind, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.6 } }],
  buffers: [{ byteLength: bin.length + binPad.length }],
}
let js = Buffer.from(JSON.stringify(json)); js = Buffer.concat([js, Buffer.alloc((-js.length) & 3, 0x20)])
const total = 12 + 8 + js.length + 8 + bin.length + binPad.length
const head = Buffer.alloc(20); head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(total, 8); head.writeUInt32LE(js.length, 12); head.writeUInt32LE(0x4e4f534a, 16)
const h2 = Buffer.alloc(8); h2.writeUInt32LE(bin.length + binPad.length, 0); h2.writeUInt32LE(0x004e4942, 4)
writeFileSync(output, Buffer.concat([head, js, h2, bin, binPad]))
console.log(kind, 'inputTris', Math.round(totalTris), 'ratio', ratio.toFixed(3), 'bytes', total)
console.log(JSON.stringify(report))
