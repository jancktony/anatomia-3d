import json, struct, sys
import numpy as np

SRC = 'mh/'
HEIGHTS = {'male': 2.19, 'female': 2.05}  # world units; matches anatomy layer scale
FEET_Y = -0.34

def load_obj(path):
    v, vt, faces, group = [], [], [], None
    for ln in open(path, encoding='utf-8'):
        if ln.startswith('v '): v.append(ln.split()[1:4])
        elif ln.startswith('vt '): vt.append(ln.split()[1:3])
        elif ln.startswith('g '): group = ln.split()[1]
        elif ln.startswith('f ') and group == 'body':
            faces.append([tuple(int(i) - 1 for i in p.split('/')[:2]) for p in ln.split()[1:]])
    return np.array(v, np.float64), np.array(vt, np.float64), faces

def load_target(path, n):
    d = np.zeros((n, 3))
    for ln in open(path, encoding='utf-8'):
        if ln[0] == '#' or not ln.strip(): continue
        i, x, y, z = ln.split()
        d[int(i)] = (float(x), float(y), float(z))
    return d

# extra MakeHuman shape targets (CC0) as (file, weight): a more feminine silhouette
EXTRA = {'female': [('female-young-averagemuscle-averageweight-maxcup-averagefirmness', 0.55), ('hip-scale-horiz-incr', 0.5), ('buttocks-volume-incr', 0.45)], 'male': []}

def build(gender):
    v, vt, faces = load_obj(SRC + 'base.obj')
    for r in ('african', 'asian', 'caucasian'):
        v = v + load_target(f'{SRC}{r}-{gender}-young.target', len(v)) / 3
    for name, w in EXTRA[gender]:
        v = v + w * load_target(f'{SRC}{name}.target', len(v))
    remap, pos, uv, idx = {}, [], [], []
    for f in faces:
        ids = []
        for key in f:
            if key not in remap:
                remap[key] = len(pos); pos.append(v[key[0]]); uv.append(vt[key[1]])
            ids.append(remap[key])
        for k in range(1, len(ids) - 1): idx += [ids[0], ids[k], ids[k + 1]]
    pos, uv, idx = np.array(pos), np.array(uv), np.array(idx, np.uint32)
    pos[:, 1] -= pos[:, 1].min(); pos[:, 0] -= (pos[:, 0].min() + pos[:, 0].max()) / 2
    pos[:, 2] -= (pos[:, 2].min() + pos[:, 2].max()) / 2
    pos *= HEIGHTS[gender] / pos[:, 1].max(); pos[:, 1] += FEET_Y
    # area-weighted vertex normals, welded by position so seams (UV splits) stay smooth
    t = idx.reshape(-1, 3); fn = np.cross(pos[t[:, 1]] - pos[t[:, 0]], pos[t[:, 2]] - pos[t[:, 0]])
    n = np.zeros_like(pos)
    for k in range(3): np.add.at(n, t[:, k], fn)
    key = np.round(pos, 5); _, inv = np.unique(key, axis=0, return_inverse=True)
    inv = inv.ravel(); acc = np.zeros((inv.max() + 1, 3)); np.add.at(acc, inv, n); n = acc[inv]
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    uv[:, 1] = 1 - uv[:, 1]
    return pos.astype('<f4'), n.astype('<f4'), uv.astype('<f4'), idx.astype('<u4')

def glb(pos, n, uv, idx, out):
    blobs = [idx.tobytes(), pos.tobytes(), n.tobytes(), uv.tobytes()]
    bin_ = b''.join(blobs); offs = np.cumsum([0] + [len(b) for b in blobs])
    j = {'asset': {'version': '2.0', 'generator': 'atlas-anatomia/MakeHuman CC0'},
         'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': 'body'}],
         'meshes': [{'primitives': [{'attributes': {'POSITION': 1, 'NORMAL': 2, 'TEXCOORD_0': 3}, 'indices': 0, 'material': 0}]}],
         'materials': [{'name': 'skin', 'pbrMetallicRoughness': {'baseColorFactor': [0.85, 0.65, 0.55, 1], 'metallicFactor': 0, 'roughnessFactor': 0.6}}],
         'buffers': [{'byteLength': len(bin_)}],
         'bufferViews': [{'buffer': 0, 'byteOffset': int(offs[i]), 'byteLength': len(blobs[i]), 'target': 34963 if i == 0 else 34962} for i in range(4)],
         'accessors': [
             {'bufferView': 0, 'componentType': 5125, 'count': len(idx), 'type': 'SCALAR'},
             {'bufferView': 1, 'componentType': 5126, 'count': len(pos), 'type': 'VEC3', 'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()},
             {'bufferView': 2, 'componentType': 5126, 'count': len(n), 'type': 'VEC3'},
             {'bufferView': 3, 'componentType': 5126, 'count': len(uv), 'type': 'VEC2'}]}
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4); bin_ += b'\0' * (-len(bin_) % 4)
    with open(out, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bin_)

for g in ('male', 'female'):
    glb(*build(g), f'raw_{g}.glb'); print(g, 'ok')
