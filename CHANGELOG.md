# Changelog

Formato [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added
- Capas Linfático y Vísceras (Z-Anatomy) con 6 + 12 estructuras seleccionables.
- Cuerpos 3D hombre/mujer (MakeHuman, CC0) con selector.
- Capas de Z-Anatomy (CC BY-SA 4.0): huesos, músculos, nervios y vasos, cargadas bajo demanda.
- PWA: precaché de los `.glb` y `CacheFirst` en runtime.
- CI (typecheck + build + `npm audit`), cabeceras de seguridad en `vercel.json`.

### Changed
- Sidebar: tarjetas de sistemas en cuadrícula y estructuras agrupadas por sección.
- `Scene` cargada con `React.lazy`; entorno de luz local (sin HDR remoto).

### Removed
- Primitivas geométricas de `HumanModel` y carpeta duplicada `atlas_anatomy/`.

### Fixed
- Encabezado GLB de los cuerpos (versión y longitud invertidas).
- IDs con tilde (`cubito`, `encefalo`).
