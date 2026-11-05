import { readFileSync, writeFileSync } from 'node:fs'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { Box3, Vector3 } from 'three'
const [,, input, out] = process.argv
const buf = readFileSync(input)
const root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '')
root.updateMatrixWorld(true)
const rows = []
root.traverse((o) => {
  if (!o.isMesh) return
  const b = new Box3().setFromObject(o), c = b.getCenter(new Vector3()), s = b.getSize(new Vector3())
  rows.push({ n: o.name, v: o.geometry.attributes.position.count, c: c.toArray().map((x) => +x.toFixed(3)), s: s.toArray().map((x) => +x.toFixed(3)) })
})
writeFileSync(out, JSON.stringify(rows))
const B = new Box3().setFromObject(root)
console.log(input, rows.length, 'meshes', 'verts', rows.reduce((a, r) => a + r.v, 0), 'bbox', B.min.toArray().map(x=>+x.toFixed(2)), B.max.toArray().map(x=>+x.toFixed(2)))
