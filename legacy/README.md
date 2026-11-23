# Código anterior del repo (referencia)

App anterior en JavaScript (`src/App.jsx`, 74 KB), archivada al unir los dos proyectos. Su historial completo sigue en git.
No se compila: vive aquí para portar sus funciones al atlas actual.

Por portar:
- Atlas femenino real: Human Reference Atlas, female v1.5 (CC BY 4.0), repo `HiMahendraBeniwal/female-atlas`.
- Atlas masculino BodyParts3D: repo `ashemag/human-atlas`. Formato propio `atlas.json` + chunks `body-N.bin(.gz)` (~4 MB cada uno).
- Capa muscular detallada (BodyExplorer / Z-Anatomy): `anatomy.glb`, `mesh_mapping.json`, `skeleton.glb` de `JohanBellander/BodyExplorer`.
- Fichas de referencia ampliadas por órgano, navegación por regiones, recorte espacial, tarjetas y quiz de 3 niveles (este último ya está en el atlas nuevo).
- Créditos: `public/ATTRIBUTION.md` y `public/NOTICE-ANATOMIA.md`.

El CI anterior descargaba esos modelos al compilar (`git show 055c106:.github/workflows/deploy.yml`).
