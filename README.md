# Atlas Anatómico 3D

Last updated: 2026-11-04 07:50 PM CST

Visor anatómico interactivo (React 19, TypeScript, Vite, react-three-fiber, Zustand). Producción: https://atlas-anatomia-five.vercel.app

## Uso
```bash
npm ci
npm run dev      # http://localhost:5179
npm run build    # tsc -b + vite build
```
Selector Hombre/Mujer; activa capas (Esquelético, Muscular, Nervioso, Vascular) o la piel. La piel solo se muestra sin capas internas.

## Modelos (`public/models/`)
| Archivo | Origen | Licencia |
|---|---|---|
| `male.glb`, `female.glb` | MakeHuman (malla base + targets) | CC0 |
| `bones.glb`, `muscles.glb`, `nerves.glb`, `vessels.glb`, `lymph.glb`, `viscera.glb` | [Z-Anatomy](https://www.z-anatomy.com) (fusionados, decimados, reescalados) | CC BY-SA 4.0 |

Regenerar: `python tools/build_bodies.py` (requiere los archivos en `tools/mh/`) y `node tools/build_anatomy.mjs <fbx> <out.glb> <bones|muscles|nerves|vessels> <presupuesto-tris>`. Los FBX de origen: `LluisV/Z-Anatomy`, rama `PC-Version`, `Resources/Models/FBX/`.

## Caché
El Service Worker (vite-plugin-pwa) precachea las pieles y sirve `.glb` con `CacheFirst`. Cada capa se descarga solo al activarla.

## Límites conocidos
- Esqueleto, músculos, nervios y vasos son masculinos; en mujer solo se escalan (×0.936).
- La piel (brazos extendidos) no está alineada con las capas internas (brazos caídos).
- Piel no tiene estructuras seleccionables (es la cubierta del cuerpo).
- Modo Quiz sin lógica.
- `npm audit`: 6 avisos moderate/low en `workbox-build` (cadena `vite-plugin-pwa`, solo build, sin arreglo disponible).
- Sin pruebas automáticas ni CSP; modo offline sin verificar.
