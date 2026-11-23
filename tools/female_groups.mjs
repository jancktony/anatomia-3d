// Female atlas (Human Reference Atlas v1.5 + BodyParts3D): which part goes into which structure id / layer file.
// First matching rule wins; the last rule of each layer is the catch-all "-resto".
export const LAYERS = {
  senses_f: { systems: ['sensory'], rules: [['oidos', /external ear|\bear\b|auric/i], ['ojos', /./]] },
  bones_f: { systems: ['skeletal'], rules: [
    ['craneo', /skull|cranial|cranium|frontal bone|parietal|occipital|temporal bone|sphenoid|ethmoid|mandible|maxilla|zygomatic|nasal bone|lacrimal|palatine bone|vomer/i],
    ['columna-vertebral', /vertebra|sacrum|coccyx|atlas|axis|intervertebral/i],
    ['esternon', /sternum|manubrium|xiphoid/i],
    ['costillas', /\brib\b|ribs|costal/i],
    ['humerus', /humerus/i], ['radio', /\bradius\b/i], ['cubito', /\bulna\b/i],
    ['femur', /femur/i], ['tibia', /\btibia\b/i], ['perone', /\bfibula\b/i],
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
    // order matters: "bronchopulmonary segment" must not reach the liver, "gallbladder" must not reach "bladder", "hepatic flexure" is colon
    ['pulmones', /lung|bronchopulmonary|lobar bronch/i],
    ['vesicula-biliar', /gallbladder|bile|cystic|hepatic duct/i],
    ['intestino-grueso', /colon|cecum|caecum|rectum|appendix|large intestine|anal canal|ileocaecal|ileocecal/i],
    ['higado', /liver|porta hepatis|^(left|right) (anterolateral|superomedial|inferomedial|anterosuperior|posteroinferior|posterosuperior|posterolateral|posteromedial) segment\d*$/i],
    ['estomago', /stomach|gastric(?! impression)/i], ['esofago', /esophag|oesophag/i],
    ['traquea-bronquios', /trachea|bronch/i],
    ['rinones', /kidney|renal/i], ['vejiga-urinaria', /urinary bladder|ureter|urethra|trigone/i],
    ['pancreas', /pancrea/i],
    ['intestino-delgado', /duodenum|jejunum|ileum|small intestine/i],
    ['tiroides', /thyroid gland|parathyroid/i],
    ['visceras-resto', /./],
  ] },
  repro_f: { systems: ['reproductive', 'pregnancy'], rules: [
    ['embarazo', /fet|placent|amnio|umbilic|pregnan/i],
    ['mama', /mammary|breast|nipple|areol|lactif|adipose|tubercle/i],
    ['utero', /\buter|fallopian|cervix|endometri|myometri|cornua|salping|tube\b/i],
    ['ovarios', /\bovary\b/i], // ligaments/mesovarium stay in -resto: they dwarf the 3 cm ovaries in the exploded grid
    ['vagina', /vagin|vulva|clitor|labi|hymen|perine/i],
    ['reproductor-resto', /./],
  ] },
}

// every part of the dataset's "pregnancy" system (placental plates, amnion, cord...) is the gravid set, whatever its name
export const groupFor = (layer, p) => (p.system === 'pregnancy' ? 'embarazo' : groupOf(layer, p.name))
export const groupOf = (layer, name) => LAYERS[layer].rules.find(([, re]) => re.test(name))?.[0]
// a 2 cm lymph-node detail model (Yao_*) and compact/trabecular "bone tissue" cut-aways that overlap the hip bones add noise, not anatomy
// VH_F knee soft tissue (menisci, cruciate/anterolateral ligaments, quadriceps tendon) sits 4-7 cm lateral to the BodyParts3D leg bones: it floats beside the knees
export const EXCLUDE = (p) => p.id.startsWith('Yao_') || /(trabecular|compact) bone tissue/i.test(p.name) || /meniscus|articular disk of knee|cruciate ligament|anterolateral ligament|tendon of (left|right) quadriceps/i.test(p.name)
// palatine tonsils are filed under "digestive" in the dataset
// misfiled parts: tonsils sit under "digestive"; the iliotibial tract (a 61 cm fascia band) under "skeletal" and was drawn like bone;
// brain nuclei / dura / choroid plexus / lacrimal bone under "sensory"; wrist retinacula are not sense organs
export const layerFor = (p) => {
  if (EXCLUDE(p) || /retinaculum/i.test(p.name)) return undefined
  if (/tonsil/i.test(p.name)) return 'lymph_f'
  if (/iliotibial tract/i.test(p.name) || (p.system === 'skeletal' && /fibularis|tibialis|subscapularis|levator scapulae/i.test(p.name))) return 'muscles_f' // muscles filed as skeletal
  if (p.system === 'sensory' && /nuclear|nucleus|dura mater|choroid plexus/i.test(p.name)) return 'nerves_f'
  if (/(third|fourth|lateral) ventricle|interventricular foramen/i.test(p.name)) return 'nerves_f' // brain ventricles are filed under "cardiac"
  if (/lacrimal bone/i.test(p.name)) return 'bones_f'
  return layerOf(p.system)
}
export const layerOf = (system) => Object.entries(LAYERS).find(([, l]) => l.systems.includes(system))?.[0]
