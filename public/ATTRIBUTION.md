# Atribución y licencias

Esta aplicación es un proyecto educativo independiente y no copia contenido propietario de Anatomy Learning.

## Modelo anatómico general

La aplicación utiliza geometría procesada del proyecto **Human Atlas** de ashemag, basada en **BodyParts3D 4.0**.

**Atribución:**

> BodyParts3D, © The Database Center for Life Science.

La capa general se mantiene como referencia anatómica del atlas.

## Capa muscular detallada

La aplicación incorpora una capa muscular derivada de **BodyExplorer**, que utiliza datos de **BodyParts3D** y **Z-Anatomy** y distribuye 467 mallas individuales de músculos y tendones.

**Atribución requerida:**

> BodyParts3D, © The Database Center for Life Science.
>
> Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0.
>
> BodyExplorer — Johan Bellander — adaptación de datos anatómicos de BodyParts3D y Z-Anatomy.

La capa muscular derivada se distribuye bajo **CC BY-SA 4.0**, conforme a las condiciones de los datos de Z-Anatomy. El repositorio de Z-Anatomy exige atribución y que las obras derivadas de sus datos mantengan la licencia CC BY-SA 4.0. citeturn0search1turn0search8

Fuente de la capa web utilizada:
- BodyExplorer: https://github.com/JohanBellander/BodyExplorer
- Datos de mapeo y geometría muscular: derivados de BodyParts3D/Z-Anatomy.

## Código

- React, Three.js y Vite se utilizan con sus respectivas licencias.
- El código de esta aplicación es independiente del código de Z-Anatomy.

## Limitaciones

El modelo representa una anatomía masculina adulta de referencia. La capa muscular detallada mejora de forma importante el número de músculos individualizados, incluidos músculos de la cara, pero no debe interpretarse como una representación de todas las variaciones anatómicas humanas.

La aplicación tiene finalidad educativa y no constituye una herramienta de diagnóstico, tratamiento o cirugía.

Al crear una distribución local o una aplicación de escritorio, esta atribución debe mantenerse junto con los archivos anatómicos correspondientes.
