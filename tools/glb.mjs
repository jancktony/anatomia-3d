import { writeFileSync } from 'node:fs'

/** groups: Map<nodeName, { pos: number[] (xyz), idx: number[] }>; one node/mesh per group, snorm8 normals. Returns per-group stats. */
export function writeGlb(groups, output, generator, materialName = 'layer') {
  const blobs = [], bufferViews = [], accessors = [], meshes = [], nodes = [], report = {}
  const push = (arr, target) => {
    const pad = (-blobs.reduce((s, b) => s + b.length, 0)) & 3
    if (pad) blobs.push(Buffer.alloc(pad))
    const off = blobs.reduce((s, b) => s + b.length, 0)
    blobs.push(Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength))
    bufferViews.push({ buffer: 0, byteOffset: off, byteLength: arr.byteLength, target })
    return bufferViews.length - 1
  }
  for (const [name, a] of groups) {
    if (!a.idx.length) continue
    const pos = new Float32Array(a.pos), idx = new Uint32Array(a.idx), n = new Float32Array(pos.length)
    for (let i = 0; i < idx.length; i += 3) {
      const [i0, i1, i2] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3]
      const ux = pos[i1] - pos[i0], uy = pos[i1 + 1] - pos[i0 + 1], uz = pos[i1 + 2] - pos[i0 + 2]
      const wx = pos[i2] - pos[i0], wy = pos[i2 + 1] - pos[i0 + 1], wz = pos[i2 + 2] - pos[i0 + 2]
      const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx
      for (const j of [i0, i1, i2]) { n[j] += fx; n[j + 1] += fy; n[j + 2] += fz }
    }
    const nv = new Int8Array((pos.length / 3) * 4) // snorm8 VEC3 needs a 4-byte stride
    for (let i = 0, k = 0; i < n.length; i += 3, k += 4) {
      const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1
      nv[k] = Math.round((n[i] / l) * 127); nv[k + 1] = Math.round((n[i + 1] / l) * 127); nv[k + 2] = Math.round((n[i + 2] / l) * 127)
    }
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
  const bin = Buffer.concat(blobs), binPad = Buffer.alloc((-bin.length) & 3)
  const json = {
    asset: { version: '2.0', generator },
    scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }], nodes, meshes, accessors, bufferViews,
    materials: [{ name: materialName, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.6 } }],
    buffers: [{ byteLength: bin.length + binPad.length }],
  }
  let js = Buffer.from(JSON.stringify(json)); js = Buffer.concat([js, Buffer.alloc((-js.length) & 3, 0x20)])
  const total = 12 + 8 + js.length + 8 + bin.length + binPad.length
  const head = Buffer.alloc(20)
  head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(total, 8); head.writeUInt32LE(js.length, 12); head.writeUInt32LE(0x4e4f534a, 16)
  const h2 = Buffer.alloc(8); h2.writeUInt32LE(bin.length + binPad.length, 0); h2.writeUInt32LE(0x004e4942, 4)
  writeFileSync(output, Buffer.concat([head, js, h2, bin, binPad]))
  return { bytes: total, report }
}
