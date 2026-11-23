export type System = 'esqueleto' | 'musculos' | 'nervioso' | 'vascular' | 'linfatico' | 'visceras' | 'piel' | 'reproductor' | 'sensorial'

export interface Structure {
  id: string
  name: string
  latinName?: string
  system: System
  description: string
  function?: string
  origin?: string
  insertion?: string
  innervation?: string
  bloodSupply?: string
  action?: string
  tags?: string[]
  /** exists only in this model (female-specific anatomy) */
  only?: 'female'
}

export const systems: { id: System; label: string; color: string }[] = [
  { id: 'esqueleto', label: 'Sistema Esquelético', color: '#d4b896' },
  { id: 'musculos', label: 'Sistema Muscular', color: '#e85d5d' },
  { id: 'nervioso', label: 'Sistema Nervioso', color: '#f4a261' },
  { id: 'vascular', label: 'Sistema Vascular', color: '#e63946' },
  { id: 'linfatico', label: 'Sistema Linfático', color: '#4cc9f0' },
  { id: 'visceras', label: 'Vísceras', color: '#9d4edd' },
  { id: 'piel', label: 'Piel y Tegumentos', color: '#fca311' },
  { id: 'reproductor', label: 'Sistema Reproductor', color: '#ec4899' },
  { id: 'sensorial', label: 'Órganos de los Sentidos', color: '#22c55e' },
]

export const structures: Structure[] = [
  { id: 'craneo', name: 'Cráneo', latinName: 'Cranium', system: 'esqueleto', description: 'Conjunto de huesos que forman la caja craneal y la cara.', function: 'Protección del encéfalo y órganos sensoriales', tags: ['hueso', 'cabeza'] },
  { id: 'columna-vertebral', name: 'Columna Vertebral', latinName: 'Columna vertebralis', system: 'esqueleto', description: 'Eje central formado por vértebras que protege la médula espinal.', function: 'Soporte axial, protección, movilidad', tags: ['columna'] },
  { id: 'esternon', name: 'Esternón', latinName: 'Sternum', system: 'esqueleto', description: 'Hueso plano anterior del tórax.', function: 'Protección cardíaca, inserción costal', tags: ['torax'] },
  { id: 'costillas', name: 'Costillas', latinName: 'Costae', system: 'esqueleto', description: '12 pares que forman la caja torácica.', function: 'Protección, mecánica respiratoria', tags: ['torax'] },
  { id: 'humerus', name: 'Húmero', latinName: 'Humerus', system: 'esqueleto', description: 'Hueso largo del brazo.', function: 'Soporte y movilización del miembro superior', tags: ['brazo'] },
  { id: 'radio', name: 'Radio', latinName: 'Radius', system: 'esqueleto', description: 'Hueso lateral del antebrazo.', function: 'Pronación/supinación', tags: ['antebrazo'] },
  { id: 'cubito', name: 'Cúbito', latinName: 'Ulna', system: 'esqueleto', description: 'Hueso medial del antebrazo.', function: 'Estabilización del codo', tags: ['antebrazo'] },
  { id: 'femur', name: 'Fémur', latinName: 'Femur', system: 'esqueleto', description: 'Hueso más largo y fuerte del cuerpo.', function: 'Soporte de peso, locomoción', tags: ['muslo'] },
  { id: 'tibia', name: 'Tibia', latinName: 'Tibia', system: 'esqueleto', description: 'Hueso principal de la pierna.', function: 'Transmisión de peso', tags: ['pierna'] },
  { id: 'perone', name: 'Peroné', latinName: 'Fibula', system: 'esqueleto', description: 'Hueso lateral delgado de la pierna.', function: 'Estabilidad del tobillo', tags: ['pierna'] },

  { id: 'deltoides', name: 'Músculo Deltoides', latinName: 'Deltoideus', system: 'musculos', description: 'Músculo en forma de delta sobre el hombro.', function: 'Abducción, flexión, extensión del hombro', origin: 'Clavícula, acromion, espina escapular', insertion: 'Tuberosidad deltoidea del húmero', innervation: 'Nervio axilar (C5-C6)', action: 'Abduce el brazo', tags: ['hombro'] },
  { id: 'pectorales-mayor', name: 'Pectoral Mayor', latinName: 'Pectoralis major', system: 'musculos', description: 'Músculo potente de la pared torácica anterior.', function: 'Aducción, flexión, rotación medial del brazo', origin: 'Clavícula, esternón, cartílagos costales', insertion: 'Surco intertubercular del húmero', innervation: 'Nervios pectorales', action: 'Aduce y rota medialmente el húmero', tags: ['torax', 'hombro'] },
  { id: 'biceps-braquial', name: 'Bíceps Braquial', latinName: 'Biceps brachii', system: 'musculos', description: 'Músculo de dos cabezas en cara anterior del brazo.', function: 'Flexión del codo y supinación', origin: 'Tubérculo supraglenoideo y apófisis coracoides', insertion: 'Tuberosidad bicipital del radio', innervation: 'Nervio musculocutáneo (C5-C6)', action: 'Flexiona codo y supina antebrazo', tags: ['brazo'] },
  { id: 'triceps-braquial', name: 'Tríceps Braquial', latinName: 'Triceps brachii', system: 'musculos', description: 'Músculo de tres cabezas en cara posterior del brazo.', function: 'Extensión del codo', origin: 'Tubérculo infraglenoideo y húmero', insertion: 'Olécranon del cúbito', innervation: 'Nervio radial (C6-C8)', action: 'Extiende el antebrazo', tags: ['brazo'] },
  { id: 'cuadriceps', name: 'Cuádriceps Femoral', latinName: 'Quadriceps femoris', system: 'musculos', description: 'Cuatro cabezas, principal extensor de la rodilla.', function: 'Extensión de rodilla, flexión de cadera', origin: 'Ilion y fémur', insertion: 'Tendón rotuliano -> tuberosidad tibial', innervation: 'Nervio femoral (L2-L4)', action: 'Extiende rodilla', tags: ['muslo'] },
  { id: 'isquiotibiales', name: 'Isquiotibiales', latinName: 'Hamstrings', system: 'musculos', description: 'Grupo posterior del muslo.', function: 'Flexión de rodilla, extensión de cadera', origin: 'Tuberosidad isquiática', insertion: 'Tibia y peroné', innervation: 'Nervio ciático (L5-S2)', action: 'Flexionan rodilla y extienden cadera', tags: ['muslo'] },
  { id: 'gastrocnemio', name: 'Gastrocnemio', latinName: 'Gastrocnemius', system: 'musculos', description: 'Músculo bicéfalo de la pantorrilla.', function: 'Flexión plantar', origin: 'Cóndilos femorales', insertion: 'Calcáneo vía tendón de Aquiles', innervation: 'Nervio tibial (S1-S2)', action: 'Flexión plantar y flexión de rodilla', tags: ['pantorrilla'] },

  { id: 'encefalo', name: 'Encéfalo', latinName: 'Encephalon', system: 'nervioso', description: 'Centro de control del SNC.', function: 'Integración, funciones superiores', tags: ['cerebro'] },
  { id: 'medula-espinal', name: 'Médula Espinal', latinName: 'Medulla spinalis', system: 'nervioso', description: 'Prolongación del SNC por conducto vertebral.', function: 'Conducción y reflejos', tags: ['medula'] },
  { id: 'nervio-ciatico', name: 'Nervio Ciático', latinName: 'Nervus ischiadicus', system: 'nervioso', description: 'Mayor nervio del cuerpo (L4-S3).', function: 'Inervación de miembro inferior', tags: ['nervio'] },

  { id: 'corazon', name: 'Corazón', latinName: 'Cor', system: 'vascular', description: 'Órgano muscular que impulsa la sangre.', function: 'Bomba circulatoria', tags: ['corazon'] },
  { id: 'aorta', name: 'Aorta', latinName: 'Aorta', system: 'vascular', description: 'Arteria principal del organismo.', function: 'Distribución sanguínea sistémica', tags: ['arteria'] },
  { id: 'arteria-femoral', name: 'Arteria Femoral', latinName: 'Arteria femoralis', system: 'vascular', description: 'Principal arteria del miembro inferior.', function: 'Irrigación de muslo y pierna', tags: ['arteria'] },

  { id: 'bazo', name: 'Bazo', latinName: 'Splen', system: 'linfatico', description: 'Órgano linfoide más grande, en el hipocondrio izquierdo.', function: 'Filtra la sangre, retira eritrocitos envejecidos y participa en la respuesta inmune', tags: ['abdomen'] },
  { id: 'timo', name: 'Timo', latinName: 'Thymus', system: 'linfatico', description: 'Órgano linfoide primario en el mediastino anterior.', function: 'Maduración de los linfocitos T', tags: ['torax'] },
  { id: 'amigdalas', name: 'Amígdalas Palatinas', latinName: 'Tonsilla palatina', system: 'linfatico', description: 'Tejido linfoide en la pared lateral de la orofaringe.', function: 'Vigilancia inmunitaria de la vía aerodigestiva', tags: ['faringe'] },
  { id: 'ganglios-cervicales', name: 'Ganglios Cervicales', latinName: 'Nodi lymphoidei cervicales', system: 'linfatico', description: 'Cadenas ganglionares de cabeza y cuello.', function: 'Drenaje y filtrado linfático de cabeza y cuello', tags: ['cuello', 'cabeza'] },
  { id: 'ganglios-axilares', name: 'Ganglios Axilares', latinName: 'Nodi lymphoidei axillares', system: 'linfatico', description: 'Ganglios de la axila y del miembro superior.', function: 'Drenaje de miembro superior, mama y pared torácica', tags: ['axila', 'brazo'] },
  { id: 'ganglios-inguinales', name: 'Ganglios Inguinales e Ilíacos', latinName: 'Nodi lymphoidei inguinales', system: 'linfatico', description: 'Ganglios de la ingle, la pelvis y el miembro inferior.', function: 'Drenaje de miembro inferior, periné y pelvis', tags: ['ingle', 'pelvis'] },

  { id: 'higado', name: 'Hígado', latinName: 'Hepar', system: 'visceras', description: 'Glándula más voluminosa del cuerpo, dividida en segmentos hepáticos.', function: 'Metabolismo, síntesis de proteínas, producción de bilis y detoxificación', tags: ['abdomen'] },
  { id: 'estomago', name: 'Estómago', latinName: 'Gaster', system: 'visceras', description: 'Víscera hueca que continúa al esófago.', function: 'Almacena y digiere parcialmente los alimentos', tags: ['abdomen', 'digestivo'] },
  { id: 'esofago', name: 'Esófago', latinName: 'Oesophagus', system: 'visceras', description: 'Tubo muscular que une la faringe con el estómago.', function: 'Transporte del bolo alimenticio por peristalsis', tags: ['digestivo'] },
  { id: 'pulmones', name: 'Pulmones', latinName: 'Pulmones', system: 'visceras', description: 'Órganos del intercambio gaseoso; derecho con tres lóbulos e izquierdo con dos.', function: 'Respiración: oxigenación de la sangre', tags: ['torax', 'respiratorio'] },
  { id: 'traquea-bronquios', name: 'Tráquea y Bronquios', latinName: 'Trachea et bronchi', system: 'visceras', description: 'Vía aérea inferior, desde la tráquea hasta los bronquios segmentarios.', function: 'Conducción del aire hacia los pulmones', tags: ['torax', 'respiratorio'] },
  { id: 'rinones', name: 'Riñones', latinName: 'Renes', system: 'visceras', description: 'Órganos retroperitoneales en forma de haba.', function: 'Filtración de la sangre, formación de orina y equilibrio hidroelectrolítico', tags: ['abdomen', 'urinario'] },
  { id: 'vejiga-urinaria', name: 'Vejiga y Vías Urinarias', latinName: 'Vesica urinaria', system: 'visceras', description: 'Vejiga, uréteres y uretra.', function: 'Almacenamiento y eliminación de la orina', tags: ['pelvis', 'urinario'] },
  { id: 'pancreas', name: 'Páncreas', latinName: 'Pancreas', system: 'visceras', description: 'Glándula mixta retroperitoneal junto al duodeno.', function: 'Enzimas digestivas (exocrina) e insulina y glucagón (endocrina)', tags: ['abdomen', 'digestivo'] },
  { id: 'vesicula-biliar', name: 'Vesícula y Vías Biliares', latinName: 'Vesica biliaris', system: 'visceras', description: 'Vesícula biliar y conductos biliares.', function: 'Almacena y concentra la bilis', tags: ['abdomen', 'digestivo'] },
  { id: 'intestino-delgado', name: 'Intestino Delgado', latinName: 'Intestinum tenue', system: 'visceras', description: 'Duodeno, yeyuno e íleon.', function: 'Digestión final y absorción de nutrientes', tags: ['abdomen', 'digestivo'] },
  { id: 'intestino-grueso', name: 'Intestino Grueso', latinName: 'Intestinum crassum', system: 'visceras', description: 'Ciego, apéndice, colon ascendente, transverso, descendente y sigmoide.', function: 'Absorción de agua y formación de las heces', tags: ['abdomen', 'digestivo'] },
  { id: 'tiroides', name: 'Tiroides y Paratiroides', latinName: 'Glandula thyroidea', system: 'visceras', description: 'Glándulas endocrinas del cuello.', function: 'Hormonas tiroideas y regulación del calcio', tags: ['cuello', 'endocrino'] },

  { id: 'utero', name: 'Útero y Trompas', latinName: 'Uterus et tubae uterinae', system: 'reproductor', only: 'female', description: 'Órgano muscular hueco de la pelvis donde se implanta y crece el embrión; las trompas lo comunican con los ovarios.', function: 'Gestación, menstruación y transporte del óvulo', tags: ['pelvis', 'reproductor'] },
  { id: 'ovarios', name: 'Ovarios', latinName: 'Ovaria', system: 'reproductor', only: 'female', description: 'Glándulas pares situadas a los lados del útero.', function: 'Producción de óvulos y de estrógenos y progesterona', tags: ['pelvis', 'reproductor'] },
  { id: 'mama', name: 'Glándula Mamaria', latinName: 'Glandula mammaria', system: 'reproductor', only: 'female', description: 'Glándula de la pared torácica anterior formada por lobulillos y tejido graso.', function: 'Producción de leche durante la lactancia', tags: ['torax', 'reproductor'] },
  { id: 'vagina', name: 'Vagina y Vulva', latinName: 'Vagina', system: 'reproductor', only: 'female', description: 'Conducto fibromuscular que une el cuello uterino con el vestíbulo vulvar.', function: 'Canal del parto y salida del flujo menstrual', tags: ['pelvis', 'reproductor'] },
  { id: 'embarazo', name: 'Embarazo (feto y placenta)', latinName: 'Graviditas', system: 'reproductor', only: 'female', description: 'Feto, placenta y membranas dentro del útero gestante.', function: 'Desarrollo fetal e intercambio materno-fetal', tags: ['pelvis', 'reproductor'] },
  { id: 'ojos', name: 'Ojos', latinName: 'Oculi', system: 'sensorial', only: 'female', description: 'Globos oculares con córnea, iris, cristalino, cuerpo vítreo y retina.', function: 'Recepción de la luz y formación de la imagen visual', tags: ['cabeza', 'vision'] },
]

export interface Region { id: string; label: string; color: string; ids: readonly string[] }

export const regions: readonly Region[] = [
  { id: 'cabeza-cuello', label: 'Cabeza y cuello', color: '#f4a261', ids: ['craneo', 'encefalo', 'ojos', 'amigdalas', 'ganglios-cervicales', 'tiroides'] },
  { id: 'torax', label: 'Tórax', color: '#e63946', ids: ['esternon', 'costillas', 'corazon', 'aorta', 'pulmones', 'traquea-bronquios', 'esofago', 'timo', 'pectorales-mayor', 'mama'] },
  { id: 'abdomen-pelvis', label: 'Abdomen y pelvis', color: '#9d4edd', ids: ['higado', 'estomago', 'pancreas', 'vesicula-biliar', 'bazo', 'rinones', 'intestino-delgado', 'intestino-grueso', 'vejiga-urinaria', 'utero', 'ovarios', 'vagina', 'embarazo'] },
  { id: 'miembro-superior', label: 'Miembro superior', color: '#e85d5d', ids: ['humerus', 'radio', 'cubito', 'deltoides', 'biceps-braquial', 'triceps-braquial', 'ganglios-axilares'] },
  { id: 'miembro-inferior', label: 'Miembro inferior', color: '#d4b896', ids: ['femur', 'tibia', 'perone', 'cuadriceps', 'isquiotibiales', 'gastrocnemio', 'arteria-femoral', 'nervio-ciatico', 'ganglios-inguinales'] },
  { id: 'columna', label: 'Columna y médula', color: '#4cc9f0', ids: ['columna-vertebral', 'medula-espinal'] },
]
