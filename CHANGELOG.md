# Changelog

Formato [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added
- Estudio: quiz con 3 niveles de dificultad y tarjetas; la estructura se aísla y la cámara la encuadra.
- Agrupar por sistema o por región; corte axial con deslizador; panel de referencias y reseñas con fuentes.
- Tests (vitest) para la lógica del quiz y la integridad de los datos; paso `npm test` en CI.
- Capas Linfático y Vísceras (Z-Anatomy) con 6 + 12 estructuras seleccionables.
- Cuerpos 3D hombre/mujer (MakeHuman, CC0) con selector.
- Capas de Z-Anatomy (CC BY-SA 4.0): huesos, músculos, nervios y vasos, cargadas bajo demanda.
- PWA: precaché de los `.glb` y `CacheFirst` en runtime.
- CI (typecheck + build + `npm audit`), cabeceras de seguridad en `vercel.json`.

### Changed
- Rendimiento: render bajo demanda, sin sombras dinámicas ni clearcoat, dpr máx 1.5, entorno 128; solo las pieles se precachean.
- Sidebar: tarjetas de sistemas en cuadrícula y estructuras agrupadas por sección.
- `Scene` cargada con `React.lazy`; entorno de luz local (sin HDR remoto).

### Removed
- Primitivas geométricas de `HumanModel` y carpeta duplicada `atlas_anatomy/`.

### Fixed
- Encabezado GLB de los cuerpos (versión y longitud invertidas).
- IDs con tilde (`cubito`, `encefalo`).
