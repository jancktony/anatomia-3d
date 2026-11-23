// Female atlas (Human Reference Atlas v1.5 + BodyParts3D): which part goes into which structure id / layer file.
// First matching rule wins; the last rule of each layer is the catch-all "-resto".
export const LAYERS = {
  senses_f: { systems: ['sensory'], rules: [['oidos', /external ear|ear|auric/i], ['ojos', /./]] },
  bones_f: { systems: ['skeletal'], rules: [
    ['craneo', /skull|cranial|cranium|frontal bone|parietal|occipital|temporal bone|sphenoid|ethmoid|mandible|maxilla|zygomatic|nasal bone|lacrimal|palatine bone|vomer/i],
    ['columna-vertebral', /vertebra|sacrum|coccyx|atlas|axis|intervertebral/i],
    ['esternon', /sternum|manubrium|xiphoid/i],
    ['costillas', /\brib\b|ribs|costal/i],
    ['humerus', /humerus/i], ['radio', /\bradius\b/i], ['cubito', /\bulna\b/i],
    ['femur', /femur/i], ['tibia', /\btibia\b/i], ['perone', /fibula/i],
    ['esqueleto-resto', /./],
  ] },
  muscles_f: { systems: ['muscular'], rules: [
    ['deltoides', /deltoid/i], ['pectorales-mayor', /pectoralis major/i],
    ['biceps-braquial', /biceps brachii/i], ['triceps-braquial', /triceps brachii/i],
    ['cuadriceps', /rectus femoris|vastus|quadriceps/i],
    ['isquiotibiales', /biceps femoris|semitendinosus|semimembranosus/i],
    ['gastrocnemio', /gastrocnemius/i],
    ['musculos-resto', /./],
  ] },
  nerves_f: { systems: ['nervous'], rules: [
    ['encefalo', /nuclear|nucleus|dura mater|choroid plexus|pontine|brain|cerebr|cerebell|hippocamp|thalam|gyrus|medulla oblongata|midbrain|pons|corpus callosum|ventricle|caudate|putamen|hypothalam|lobe/i],
    ['medula-espinal', /spinal cord/i],
    ['nervio-ciatico', /sciatic/i],
    ['nervioso-resto', /./],
  ] },
  vessels_f: { systems: ['cardiac', 'arterial', 'venous'], rules: [
    ['corazon', /heart|ventric|atri|cardiac|valve|coronary|myocard/i],
    ['aorta', /aort/i],
    ['arteria-femoral', /femoral artery/i],
    ['vascular-resto', /./],
  ] },
  lymph_f: { systems: ['lymphatic'], rules: [
    ['bazo', /spleen/i], ['timo', /thymus/i], ['amigdalas', /tonsil/i],
    ['ganglios-cervicales', /cervical|jugul|submandibular|submental|occipital|mastoid|parotid/i],
    ['ganglios-axilares', /axillary|brachial|cubital|supratrochlear/i],
    ['ganglios-inguinales', /inguinal|iliac|obturator|popliteal/i],
    ['linfatico-resto', /./],
  ] },
  viscera_f: { systems: ['digestive', 'respiratory', 'urinary', 'endocrine'], rules: [
    ['higado', /liver|hepatic|porta hepatis|segment\d*$/i], ['estomago', /stomach|gastric(?! impression)/i], ['esofago', /esophag|oesophag/i],
    ['pulmones', /lung|pulmon/i], ['traquea-bronquios', /trachea|bronch/i],
    ['rinones', /kidney|renal/i], ['vejiga-urinaria', /bladder|ureter|urethra/i],
    ['pancreas', /pancrea/i], ['vesicula-biliar', /gallbladder|bile|cystic/i],
    ['intestino-delgado', /duodenum|jejunum|ileum|small intestine/i],
    ['intestino-grueso', /colon|cecum|caecum|rectum|appendix|large intestine|anal/i],
    ['tiroides', /thyroid|parathyroid/i],
    ['visceras-resto', /./],
  ] },
  repro_f: { systems: ['reproductive', 'pregnancy'], rules: [
    ['embarazo', /fet|placent|amnio|umbilic|pregnan/i],
    ['utero', /uter|fallopian|tube|cervix|endometri|myometri/i],
    ['ovarios', /ovar/i],
    ['mama', /mammary|breast|nipple|areol|lactif|adipose/i],
    ['vagina', /vagin|vulva|clitor|labi|hymen|perine/i],
    ['reproductor-resto', /./],
  ] },
}

// every part of the dataset's "pregnancy" system (placental plates, amnion, cord...) is the gravid set, whatever its name
export const groupFor = (layer, p) => (p.system === 'pregnancy' ? 'embarazo' : groupOf(layer, p.name))
export const groupOf = (layer, name) => LAYERS[layer].rules.find(([, re]) => re.test(name))?.[0]
// a 2 cm lymph-node detail model (Yao_*) and compact/trabecular "bone tissue" cut-aways that overlap the hip bones add noise, not anatomy
export const EXCLUDE = (p) => p.id.startsWith('Yao_') || /(trabecular|compact) bone tissue/i.test(p.name)
// palatine tonsils are filed under "digestive" in the dataset
// misfiled parts: tonsils sit under "digestive"; the iliotibial tract (a 61 cm fascia band) under "skeletal" and was drawn like bone;
// brain nuclei / dura / choroid plexus / lacrimal bone under "sensory"; wrist retinacula are not sense organs
export const layerFor = (p) => {
  if (EXCLUDE(p) || /retinaculum/i.test(p.name)) return undefined
  if (/tonsil/i.test(p.name)) return 'lymph_f'
  if (/iliotibial tract/i.test(p.name)) return 'muscles_f'
  if (p.system === 'sensory' && /nuclear|nucleus|dura mater|choroid plexus/i.test(p.name)) return 'nerves_f'
  if (/lacrimal bone/i.test(p.name)) return 'bones_f'
  return layerOf(p.system)
}
export const layerOf = (system) => Object.entries(LAYERS).find(([, l]) => l.systems.includes(system))?.[0]
