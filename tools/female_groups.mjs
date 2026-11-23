// Female-specific anatomy from the Human Reference Atlas female set (+ the BodyParts3D parts that live in the same sensory system).
// Everything else in the dataset (bones, muscles, vessels, nerves, viscera) is BodyParts3D, i.e. the SAME body the male Z-Anatomy layers use,
// but filed in a frame that does not match the Visible Human organs (3-7 cm offsets, duplicated kidneys/heart/spine): the woman reuses the male layers instead.
// First matching rule wins; the last rule of each layer is the catch-all "-resto".
export const LAYERS = {
  senses_f: { rules: [['oidos', /external ear|\bear\b|auric/i], ['ojos', /./]] },
  repro_f: { rules: [
    ['embarazo', /fet|placent|amnio|umbilic|pregnan/i], // parts of the dataset's "pregnancy" system are forced here by groupFor
    ['mama', /mammary|breast|nipple|areol|lactif|adipose|tubercle/i],
    ['utero', /\buter|fallopian|cervix|endometri|myometri|cornua|salping|tube\b/i],
    ['ovarios', /\bovary\b/i], // ligaments/mesovarium stay in -resto: they dwarf the 3 cm ovaries in the exploded grid
    ['vagina', /vagin|vulva|clitor|labi|hymen|perine/i],
    ['reproductor-resto', /./],
  ] },
}

/** Which layer file a dataset part goes to (undefined = not used). */
export function layerFor(p) {
  if (p.id.startsWith('Yao_') || /retinaculum|lacrimal bone|nuclear|nucleus|dura mater|choroid plexus/i.test(p.name)) return undefined
  if (p.system === 'reproductive' || p.system === 'pregnancy') return 'repro_f'
  if (p.system === 'sensory') return 'senses_f'
  return undefined
}

// every part of the dataset's "pregnancy" system (placental plates, amnion, cord...) is the gravid set, whatever its name
export const groupFor = (layer, p) => (p.system === 'pregnancy' ? 'embarazo' : LAYERS[layer].rules.find(([, re]) => re.test(p.name))?.[0])

// Visible Human (VH_F) parts sit lower/behind their BodyParts3D neighbours: measured on paired organs (kidneys, heart, sacrum, lumbar vertebrae)
// in the dataset frame, metres. BodyParts3D parts (ears, lacrimal system) are already consistent and get no extra shift.
export const ALIGN_VH = { mama: [0.02, 0.03], utero: [0.01, 0.025], ovarios: [0.01, 0.025], vagina: [0.01, 0.025], embarazo: [0.01, 0.025], 'reproductor-resto': [0.01, 0.025], ojos: [-0.015, -0.02] }
