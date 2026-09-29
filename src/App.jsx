import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_BASE='./models/'
const MODEL_SOURCE='BodyParts3D 4.0 · CC BY 4.0 + capa muscular detallada BodyExplorer/Z-Anatomy · CC BY-SA 4.0'
const FEMALE_SOURCE='Human Reference Atlas · Female v1.5 · CC BY 4.0'

const systems=[
 {id:'skeletal',name:'Esquelético',icon:'🦴',color:0xe2d9ba},{id:'muscular',name:'Muscular',icon:'💪',color:0xa85b50},
 {id:'cardiac',name:'Corazón',icon:'♥',color:0xb96760},{id:'arterial',name:'Arterial',icon:'↗',color:0xc05245},
 {id:'venous',name:'Venoso',icon:'↙',color:0x527c9f},{id:'nervous',name:'Nervioso',icon:'⚡',color:0xd8b565},
 {id:'respiratory',name:'Respiratorio',icon:'◉',color:0xb98991},{id:'digestive',name:'Digestivo',icon:'◒',color:0xb8916b},
 {id:'urinary',name:'Urinario',icon:'◈',color:0xb47961},{id:'lymphatic',name:'Linfático',icon:'◎',color:0x879f7c},
 {id:'endocrine',name:'Endocrino',icon:'✦',color:0xc5a09a},{id:'reproductive',name:'Reproductor',icon:'◇',color:0xbda098},
 {id:'connective',name:'Conectivo',icon:'△',color:0xaec3bb},{id:'sensory',name:'Órganos sensoriales',icon:'◌',color:0xb0c8ce}
]
const systemMap=Object.fromEntries(systems.map(s=>[s.id,s]))
const navigationVersion='regional-v2'
const regionalSections=[
 {id:'head',name:'Cabeza y cuello',icon:'◒',children:[
  {id:'skull',name:'Cráneo',desc:'Neurocráneo, viscerocráneo y base'},
  {id:'face',name:'Cara',desc:'Órbita, nariz, boca y expresión facial'},
  {id:'brain',name:'Cavidad craneal',desc:'Encéfalo, meninges y nervios craneales'},
  {id:'ear',name:'Oído',desc:'Oído externo, medio e interno'},
  {id:'eye',name:'Ojo y órbita',desc:'Globo ocular y músculos extraoculares'},
  {id:'neck',name:'Cuello',desc:'Faringe, laringe, tiroides, vasos y nervios'}
 ]},
 {id:'thorax',name:'Tórax',icon:'◇',children:[
  {id:'thoracic-wall',name:'Pared torácica',desc:'Costillas, esternón e intercostales'},
  {id:'heart',name:'Corazón',desc:'Corazón, pericardio y grandes vasos'},
  {id:'lungs',name:'Pulmones y pleura',desc:'Pulmones, bronquios y pleuras'},
  {id:'mediastinum',name:'Mediastino',desc:'Órganos, vasos y estructuras mediastínicas'}
 ]},
 {id:'abdomen',name:'Abdomen',icon:'◍',children:[
  {id:'abdominal-wall',name:'Pared abdominal',desc:'Músculos, fascias y regiones'},
  {id:'digestive-abdomen',name:'Sistema digestivo',desc:'Estómago, intestino, hígado y páncreas'},
  {id:'retroperitoneum',name:'Retroperitoneo',desc:'Riñones, suprarrenales y grandes vasos'},
  {id:'peritoneum',name:'Peritoneo',desc:'Cavidad y relaciones peritoneales'}
 ]},
 {id:'pelvis',name:'Pelvis',icon:'⌂',children:[
  {id:'pelvic-bone',name:'Pelvis ósea',desc:'Coxales, sacro y articulaciones'},
  {id:'pelvic-floor',name:'Suelo pélvico',desc:'Diafragma pélvico y periné'},
  {id:'male-pelvis',name:'Pelvis masculina',desc:'Próstata, vejiga y genitales'},
  {id:'female-pelvis',name:'Pelvis femenina',desc:'Útero, ovarios y genitales'}
 ]},
 {id:'back',name:'Espalda',icon:'▤',children:[
  {id:'spine',name:'Columna vertebral',desc:'Cervical, torácica, lumbar y sacra'},
  {id:'back-muscles',name:'Músculos de la espalda',desc:'Planos superficial y profundo'},
  {id:'spinal-cord',name:'Médula y raíces',desc:'Médula espinal y nervios espinales'},
  {id:'gluteal',name:'Región glútea',desc:'Glúteos y rotadores profundos'}
 ]},
 {id:'upper',name:'Miembro superior',icon:'↗',children:[
  {id:'shoulder',name:'Hombro',desc:'Cintura escapular y manguito rotador'},
  {id:'arm',name:'Brazo',desc:'Compartimentos anterior y posterior'},
  {id:'elbow',name:'Codo',desc:'Articulación, músculos y fosas'},
  {id:'forearm',name:'Antebrazo',desc:'Flexores, extensores, radio y ulna'},
  {id:'wrist',name:'Muñeca',desc:'Carpo, articulaciones y tendones'},
  {id:'hand',name:'Mano',desc:'Palma, dorso, dedos y músculos intrínsecos'}
 ]},
 {id:'lower',name:'Miembro inferior',icon:'↘',children:[
  {id:'hip',name:'Cadera',desc:'Articulación, glúteos y rotadores'},
  {id:'thigh',name:'Muslo',desc:'Compartimentos y fémur'},
  {id:'knee',name:'Rodilla',desc:'Meniscos, ligamentos y articulación'},
  {id:'leg',name:'Pierna',desc:'Tibia, fíbula y compartimentos'},
  {id:'ankle',name:'Tobillo',desc:'Articulación y estructuras estabilizadoras'},
  {id:'foot',name:'Pie',desc:'Tarso, metatarso, dedos y arcos'}
 ]},
 {id:'full',name:'Cuerpo completo',icon:'◉',children:[
  {id:'surface',name:'Superficie corporal',desc:'Vista general y referencias superficiales'},
  {id:'skeleton',name:'Esqueleto completo',desc:'Huesos y articulaciones'},
  {id:'muscles',name:'Sistema muscular',desc:'Capas musculares superficiales y profundas'},
  {id:'organs',name:'Órganos',desc:'Principales órganos y cavidades'}
 ]}
]

const spanishNames={
 'pectoralis major':'Pectoral mayor','pectoralis minor':'Pectoral menor','deltoid':'Deltoides','trapezius':'Trapecio','latissimus dorsi':'Dorsal ancho','rectus abdominis':'Recto abdominal','external oblique':'Oblicuo externo','internal oblique':'Oblicuo interno','transversus abdominis':'Transverso del abdomen','biceps brachii':'Bíceps braquial','triceps brachii':'Tríceps braquial','brachialis':'Braquial','brachioradialis':'Braquiorradial','gluteus maximus':'Glúteo mayor','gluteus medius':'Glúteo medio','gluteus minimus':'Glúteo menor','quadriceps femoris':'Cuádriceps femoral','rectus femoris':'Recto femoral','vastus lateralis':'Vasto lateral','vastus medialis':'Vasto medial','gastrocnemius':'Gastrocnemio','soleus':'Sóleo','tibialis anterior':'Tibial anterior','hamstring':'Isquiotibiales','sternocleidomastoid':'Esternocleidomastoideo','masseter':'Masetero','temporalis':'Temporal','orbicularis oculi':'Orbicular de los ojos','orbicularis oris':'Orbicular de la boca','zygomaticus major':'Cigomático mayor','frontalis':'Frontal','skull':'Cráneo','femur':'Fémur','tibia':'Tibia','fibula':'Fíbula','humerus':'Húmero','radius':'Radio','ulna':'Ulna','scapula':'Escápula','clavicle':'Clavícula','sternum':'Esternón','patella':'Rótula','pelvis':'Pelvis','sacrum':'Sacro','mandible':'Mandíbula','maxilla':'Maxilar'
}
function spanishAnatomyName(name){
 const raw=String(name||'').replace(/_/g,' ').trim(),key=raw.toLowerCase()
 return spanishNames[key]||raw.replace(/\b(major|minor|muscle|bone|left|right)\b/gi,m=>({major:'mayor',minor:'menor',muscle:'músculo',bone:'hueso',left:'izquierdo',right:'derecho'}[m.toLowerCase()]||m))
}
function anatomyDescription(name,system){
 const n=String(name||'').toLowerCase()
 const common=systemMap[system]?.name||'Estructura anatómica'
 if(n.includes('muscle')||system==='muscular')return 'Músculo que participa en el movimiento y la estabilidad de la región anatómica correspondiente.'
 if(n.includes('bone')||system==='skeletal')return 'Estructura ósea que proporciona soporte, protección y puntos de inserción para músculos y ligamentos.'
 if(system==='arterial')return 'Vaso arterial que transporta sangre desde el corazón hacia los tejidos.'
 if(system==='venous')return 'Vaso venoso que devuelve la sangre desde los tejidos hacia el corazón.'
 if(system==='nervous')return 'Estructura nerviosa relacionada con la transmisión de información sensitiva y motora.'
 return explain(spanishAnatomyName(name),system)||common+'.'
}

function explain(name,system){
 const n=name.toLowerCase()
 const facts={'heart':'Bomba muscular de cuatro cavidades que impulsa la sangre por las circulaciones pulmonar y sistémica.','liver':'Órgano metabólico que procesa nutrientes, produce bilis y sintetiza numerosas proteínas plasmáticas.','brain':'Órgano central del sistema nervioso que integra información y participa en percepción, movimiento y regulación corporal.','stomach':'Cámara muscular que almacena y mezcla el alimento e inicia su digestión química.','spleen':'Órgano linfoide que filtra la sangre y participa en la respuesta inmunitaria.','pancreas':'Órgano con funciones digestivas y endocrinas; produce enzimas y hormonas como insulina y glucagón.','urinary bladder':'Reservorio muscular que almacena temporalmente la orina.','trachea':'Conducto respiratorio que conecta la laringe con los bronquios y mantiene abierta la vía aérea.','diaphragm':'Músculo que separa tórax y abdomen y participa de forma principal en la inspiración.','bíceps braquial':'Músculo anterior del brazo que participa principalmente en la flexión del codo y la supinación del antebrazo.','deltoides':'Músculo del hombro que participa principalmente en la abducción del brazo.','pectoral mayor':'Músculo superficial del tórax que participa en los movimientos del brazo.','glúteo mayor':'Principal músculo superficial de la región glútea; participa en la extensión y rotación lateral de la cadera.','cuádriceps femoral':'Grupo muscular anterior del muslo responsable principalmente de la extensión de la rodilla.','gastrocnemio':'Músculo superficial de la pantorrilla que participa en la flexión plantar del pie.'}
 return facts[n]||systemMap[system]?.name||'Estructura anatómica del cuerpo humano.'
}
async function fetchFirst(urls){
 let lastError=null
 for(const url of urls){
  try{
   const res=await fetch(url,{cache:'no-store'})
   if(res.ok)return res
   lastError=new Error(`HTTP ${res.status}`)
  }catch(e){lastError=e}
 }
 throw lastError||new Error('No se pudo descargar el recurso anatómico.')
}
async function loadAtlas(bodySex='male'){
 const base=new URL(bodySex==='female'?'./models/female/':MODEL_BASE,document.baseURI)
 const res=await fetchFirst([new URL('atlas.json',base).href])
 const atlas=await res.json()
 atlas.parts=atlas.parts||[]
 const localFile=value=>value?new URL(String(value).split('/').pop(),base).href:null
 atlas.chunks=(atlas.chunks||[]).map(c=>({
  ...c,
  urls:[localFile(c.url)].filter(Boolean),
  gzipUrls:[localFile(c.gzip)].filter(Boolean)
 }))
 return atlas
}
async function loadDetailedSkeleton(){
 const base=new URL(MODEL_BASE,document.baseURI)
 const res=await fetch(new URL('detailed-skeleton.glb',base).href,{cache:'no-store'})
 if(!res.ok)throw new Error('No se pudo cargar el esqueleto detallado.')
 const buffer=await res.arrayBuffer()
 const loader=new GLTFLoader()
 return await new Promise((resolve,reject)=>loader.parse(buffer,'',resolve,reject))
}
async function loadDetailedMuscles(){
 const base=new URL(MODEL_BASE,document.baseURI)
 const [modelResponse,mappingResponse]=await Promise.all([
  fetch(new URL('detailed-muscles.glb',base).href,{cache:'no-store'}),
  fetch(new URL('detailed-muscles.json',base).href,{cache:'no-store'})
 ])
 if(!modelResponse.ok||!mappingResponse.ok)throw new Error('No se pudo cargar la capa muscular detallada.')
 const [modelBuffer,mapping]=await Promise.all([modelResponse.arrayBuffer(),mappingResponse.json()])
 const loader=new GLTFLoader()
 const gltf=await new Promise((resolve,reject)=>loader.parse(modelBuffer,'',resolve,reject))
 return {gltf,mapping:Array.isArray(mapping)?mapping:[]}
}
async function decode(response,expected,compressed){
 if(!response.ok)throw new Error('No se pudo descargar una capa anatómica.')
 const payload=await response.arrayBuffer(),u=new Uint8Array(payload)
 const isGzip=compressed&&u[0]===0x1f&&u[1]===0x8b
 const buffer=isGzip?await new Response(new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():payload
 if(expected&&buffer.byteLength!==expected)throw new Error('Una capa anatómica llegó incompleta.')
 return buffer
}
function AnatomyScene({active,onSelect,selected,resetToken,transparent,autoRotate,view,onProgress,isolate,explode,onCatalog,region,bodySex}){
 const ref=useRef(),modelRef=useRef(null),[error,setError]=useState('')
 const activeRef=useRef(active),selectedRef=useRef(selected),autoRotateRef=useRef(autoRotate),viewRef=useRef(view),regionRef=useRef(region),transparentRef=useRef(transparent),isolateRef=useRef(isolate),explodeRef=useRef(explode),bodySexRef=useRef(bodySex)
 activeRef.current=active;selectedRef.current=selected;autoRotateRef.current=autoRotate;viewRef.current=view;regionRef.current=region;transparentRef.current=transparent;isolateRef.current=isolate;explodeRef.current=explode;bodySexRef.current=bodySex
 useEffect(()=>{
  const el=ref.current;let disposed=false,frame=0
  let renderer,scene,camera,controls,group,detailedGroup,atlas,parts=[],meshes=[],detailedMeshes=[],pickers=[],materials=[],detailedParts=[]
  const init=async()=>{
   try{
    atlas=await loadAtlas(bodySex);if(disposed)return;parts=atlas.parts
    let detailed=null,detailedSkeleton=null
    const detailedPromise=bodySex==='male'?Promise.all([loadDetailedMuscles(),loadDetailedSkeleton()]).catch(()=>[null,null]):Promise.resolve([null,null])
    onCatalog?.(parts)

    scene=new THREE.Scene();scene.background=new THREE.Color(0xfff0f5)
    camera=new THREE.PerspectiveCamera(34,1,.01,100);camera.position.set(0,1,4.2)
    const mobile=window.matchMedia('(max-width: 650px)').matches
    renderer=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance',preserveDrawingBuffer:false})
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.08
    renderer.physicallyCorrectLights=true
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setSize(el.clientWidth,el.clientHeight);el.appendChild(renderer.domElement)
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enableZoom=true;controls.zoomToCursor=true;controls.screenSpacePanning=false;controls.target.set(0,.85,0);controls.minDistance=.08;controls.maxDistance=30
    scene.add(new THREE.HemisphereLight(0xfff7fa,0x20151a,1.55))
    const key=new THREE.DirectionalLight(0xfff8f4,4.2);key.position.set(4,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.near=.1;key.shadow.camera.far=30;key.shadow.bias=-.0003;scene.add(key)
    const fill=new THREE.DirectionalLight(0xffd4df,1.25);fill.position.set(-4,2,4);scene.add(fill)
    const rim=new THREE.DirectionalLight(0x9db7d9,1.55);rim.position.set(-4,4,-5);scene.add(rim)
    const soft=new THREE.PointLight(0xffb6ce,.55,12,2);soft.position.set(0,1.2,3);scene.add(soft)
    group=new THREE.Group();scene.add(group)
    detailedGroup=new THREE.Group();scene.add(detailedGroup)
    const realisticColors={
     skeletal:0xe2d6bd,muscular:0x8f302f,cardiac:0x9e2634,arterial:0xb72d32,
     venous:0x355f91,nervous:0xd2a64c,respiratory:0xb77b86,digestive:0x9b6049,
     urinary:0x875746,lymphatic:0x66896b,endocrine:0xb27e91,reproductive:0xa56c64,
     connective:0xa99a8d,sensory:0x81a8b5
    }
    const realisticFinish={
     skeletal:{roughness:.62,metalness:0,clearcoat:.06,clearcoatRoughness:.8},
     muscular:{roughness:.58,metalness:0,clearcoat:.16,clearcoatRoughness:.62,sheen:.22},
     cardiac:{roughness:.56,metalness:.01},
     arterial:{roughness:.48,metalness:.02},
     venous:{roughness:.52,metalness:.02},
     nervous:{roughness:.58,metalness:.01},
     respiratory:{roughness:.66,metalness:0},
     digestive:{roughness:.62,metalness:0},
     urinary:{roughness:.6,metalness:0},
     lymphatic:{roughness:.64,metalness:0},
     endocrine:{roughness:.58,metalness:0},
     reproductive:{roughness:.6,metalness:0},
     connective:{roughness:.72,metalness:0},
     sensory:{roughness:.5,metalness:0}
    }
    const makeMaterial=system=>{
     const finish=realisticFinish[system]||{}
     const material=system==='muscular'
      ? new THREE.MeshPhysicalMaterial({color:realisticColors[system]??0xd6b8c2,roughness:finish.roughness??.6,metalness:finish.metalness??0,clearcoat:finish.clearcoat??0,clearcoatRoughness:finish.clearcoatRoughness??.8,sheen:finish.sheen??0,sheenColor:new THREE.Color(0x5b0d18),ior:1.4,side:THREE.DoubleSide})
      : new THREE.MeshPhysicalMaterial({color:realisticColors[system]??0xd6b8c2,roughness:finish.roughness??.6,metalness:finish.metalness??0,clearcoat:finish.clearcoat??0,clearcoatRoughness:finish.clearcoatRoughness??.8,ior:1.4,side:THREE.DoubleSide})
     return material
    }
    const mats=new Map(systems.map(s=>[s.id,makeMaterial(s.id)]))
    let loaded=0
    for(let ci=0;ci<atlas.chunks.length;ci++){
     const c=atlas.chunks[ci],compressed=!!c.gzipUrls?.length&&typeof DecompressionStream!=='undefined'
     const urls=compressed?c.gzipUrls:c.urls
     const response=await fetchFirst(urls),buffer=await decode(response,c.bytes,compressed),groups=new Map()
     parts.forEach((p,i)=>{
      if(p.chunk!==ci)return
      const g=new THREE.BufferGeometry()
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3))
      g.setAttribute('normal',new THREE.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true))
      g.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1))
      g.setAttribute('partIndex',new THREE.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1))
      g.computeBoundingSphere()
      const arr=groups.get(p.system)||[];arr.push(g);groups.set(p.system,arr)
     })
     groups.forEach((gs,system)=>{
      const merged=mergeGeometries(gs,false)
      if(!merged)return
      merged.computeBoundingSphere()
      const mesh=new THREE.Mesh(merged,mats.get(system)||mats.get('connective'))
      if(system==='muscular'){
       mesh.material.userData.muscleShader=true
       mesh.material.onBeforeCompile=shader=>{
        shader.uniforms.uSelectedPart={value:-1}
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float partIndex;\nvarying float vPartIndex;')
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPartIndex=partIndex;')
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vPartIndex;\nuniform float uSelectedPart;\nfloat muscleHash(float n){return fract(sin(n*12.9898)*43758.5453);}')
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat mv=muscleHash(vPartIndex);\nvec3 muscleTint=mix(vec3(0.62,0.09,0.12),vec3(0.88,0.30,0.30),mv*0.72);\ndiffuseColor.rgb*=muscleTint;\nif(abs(vPartIndex-uSelectedPart)<0.5){diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0,0.32,0.62),0.72);}')
        mesh.material.userData.shader=shader
       }
      }
      mesh.frustumCulled=false
      mesh.castShadow=true
      mesh.receiveShadow=true
      mesh.userData.system=system
      group.add(mesh)
      meshes.push(mesh)
     })
     loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100))
    }
    const atlasBounds=new THREE.Box3().setFromObject(group)
    const center=atlasBounds.getCenter(new THREE.Vector3())
    const bounds=new THREE.Box3().setFromObject(group)
    const sphere=bounds.getBoundingSphere(new THREE.Sphere())
    const radius=Math.max(sphere.radius,.5)
    controls.target.copy(center)
    const fov=THREE.MathUtils.degToRad(camera.fov)
    const distance=(radius/Math.tan(fov/2))*1.18
    camera.position.set(center.x,center.y,center.z+distance)
    camera.near=Math.max(.01,radius/1000)
    camera.far=Math.max(100,radius*8)
    camera.updateProjectionMatrix()
    controls.minDistance=Math.max(radius*.08,.05)
    controls.maxDistance=Math.max(radius*8,10)
    controls.update()
    modelRef.current={atlas,parts,detailedParts,camera,controls,group,detailedGroup,meshes,detailedMeshes}
    const ray=new THREE.Raycaster(),mouse=new THREE.Vector2()
    const selectable=meshes
    const click=e=>{
     const r=renderer.domElement.getBoundingClientRect()
     mouse.x=(e.clientX-r.left)/r.width*2-1
     mouse.y=-(e.clientY-r.top)/r.height*2+1
     ray.setFromCamera(mouse,camera)
     const hits=ray.intersectObjects([...selectable,...detailedMeshes],false)
     if(!hits.length)return
     const hit=hits[0]
     if(hit.object.userData.isDetailedMuscle){
      const p=hit.object.userData.part
      if(p)onSelect({...p,name:spanishAnatomyName(p.name),originalName:p.originalName||p.name,description:p.description||anatomyDescription(p.name,p.system)})
      return
     }
     const geometry=hit.object.geometry
     const indexAttr=geometry.getAttribute('partIndex')
     if(!indexAttr || hit.faceIndex==null)return
     const a=geometry.index ? geometry.index.getX(hit.faceIndex*3) : hit.faceIndex*3
     const partIndex=Math.round(indexAttr.getX(a))
     if(parts[partIndex]){const p=parts[partIndex];onSelect({...p,name:spanishAnatomyName(p.name),originalName:p.name,description:anatomyDescription(p.name,p.system)})}
    }
    renderer.domElement.addEventListener('click',click)
    const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
    window.addEventListener('resize',resize)
    let appliedView='front',appliedRegion='full'
    const setViewPosition=which=>{
     const bounds=new THREE.Box3().setFromObject(group)
     if(detailedGroup)bounds.union(new THREE.Box3().setFromObject(detailedGroup))
     const center=bounds.getCenter(new THREE.Vector3())
     const sphere=bounds.getBoundingSphere(new THREE.Sphere())
     const radius=Math.max(sphere.radius,.5)
     const distance=(radius/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.18
     const dir=which==='back'?new THREE.Vector3(0,0,-1):which==='left'?new THREE.Vector3(-1,0,0):which==='right'?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1)
     camera.position.copy(center).addScaledVector(dir,distance)
     controls.target.copy(center)
     controls.update()
     appliedView=which
    }
    const setRegionFocus=which=>{
     const b=new THREE.Box3().setFromObject(group)
     if(detailedGroup)b.union(new THREE.Box3().setFromObject(detailedGroup))
     const size=b.getSize(new THREE.Vector3())
     const cx=(b.min.x+b.max.x)/2, cz=(b.min.z+b.max.z)/2
     const t={head:.9,face:.88,neck:.76,chest:.61,abdomen:.43,pelvis:.25,upper:.58,lower:.29}[which]??.5
     const y=b.min.y+size.y*t
     const target=new THREE.Vector3(cx,y,cz)
     const span=which==='head'||which==='face'?size.y*.16:which==='neck'?size.y*.22:which==='chest'?size.y*.28:which==='abdomen'?size.y*.24:which==='pelvis'?size.y*.18:size.y*.34
     const radius=Math.max(span,size.x*.22,size.z*.22,0.5)
     const distance=(radius/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.55
     const current=camera.position.clone().sub(controls.target).normalize()
     if(!Number.isFinite(current.x))current.set(0,0,1)
     camera.position.copy(target).addScaledVector(current,distance)
     controls.target.copy(target)
     controls.minDistance=Math.max(radius*.08,.04)
     controls.maxDistance=Math.max(radius*12,8)
     controls.update()
    }
    const animate=()=>{
     if(disposed)return;frame=requestAnimationFrame(animate)
     const st=modelRef.current
     if(st){
      meshes.forEach(mesh=>{
       if(mesh.userData.system==='muscular' && mesh.material.userData.shader){
        const selectedIndex=selectedRef.current?parts.findIndex(p=>p.id===selectedRef.current.id):-1
        mesh.material.userData.shader.uniforms.uSelectedPart.value=selectedIndex
       }
       const system=mesh.userData.system
       const systemVisible=!!activeRef.current[system]
       let visible=systemVisible
       if(system==='muscular' && detailedMeshes.length) visible=false
       if(isolateRef.current && selectedRef.current) visible=systemVisible && system===selectedRef.current.system && visible
       mesh.visible=visible
       mesh.material.transparent=!!transparentRef.current
       mesh.material.opacity=transparentRef.current?.52:1
      })
      detailedMeshes.forEach(mesh=>{
       const system=mesh.userData.system
       const systemVisible=!!activeRef.current[system]
       let visible=systemVisible
       if(isolateRef.current && selectedRef.current) visible=systemVisible && system===selectedRef.current.system
       const idx=mesh.userData.detailIndex
       const selectedIndex=selectedRef.current?detailedParts.findIndex(p=>p.id===selectedRef.current.id):-1
       mesh.visible=visible
       mesh.material.transparent=!!transparentRef.current
       mesh.material.opacity=transparentRef.current?.52:1
       if(mesh.userData.isDetailedMuscle){
        mesh.material.emissive.set(idx===selectedIndex?0x7a1630:0x000000)
        mesh.material.emissiveIntensity=idx===selectedIndex?.62:0
       }
      })
      const currentView=viewRef.current
      if(currentView!==appliedView){setViewPosition(currentView);appliedView=currentView}
      const currentRegion=regionRef.current||'full'
      if(currentRegion!==appliedRegion){if(currentRegion==='full')setViewPosition(currentView);else setRegionFocus(currentRegion);appliedRegion=currentRegion}
      group.rotation.y=autoRotateRef.current?group.rotation.y+.0018:group.rotation.y
      controls.update();renderer.render(scene,camera)
     }
    }
    animate()
    ;(async()=>{
     const pair=await detailedPromise
     if(disposed)return
     detailed=pair[0];detailedSkeleton=pair[1]
     if(!detailed)return
     detailedParts=detailed.mapping.map((p,i)=>({
      id:`muscle-${i}-${p.fmaId||p.bpId||i}`,
      name:p.name||p.originalName||`Músculo ${i+1}`,
      originalName:p.originalName||p.name||'',
      system:'muscular',
      source:'Z-Anatomy / BodyExplorer',
      isTendon:!!p.isTendon,
      fmaId:p.fmaId||'',
      bpId:p.bpId||''
     }))
    

     const sourceRoot=detailed.gltf.scene
     const sourceBox=new THREE.Box3().setFromObject(sourceRoot)
     const sourceCenter=sourceBox.getCenter(new THREE.Vector3())
     const sourceSize=sourceBox.getSize(new THREE.Vector3())
     const sourceScale=30/Math.max(sourceSize.z,1)
     const transformDetailedGeometry=geometry=>{
      const pos=geometry.getAttribute('position')
      const normal=geometry.getAttribute('normal')
      if(pos){
       const a=pos.array
       for(let i=0;i<a.length;i+=3){
        const x=a[i],y=a[i+1],z=a[i+2]
        a[i]=(x-sourceCenter.x)*sourceScale
        a[i+1]=(z-sourceCenter.z)*sourceScale
        a[i+2]=-(y-sourceCenter.y)*sourceScale
       }
       pos.needsUpdate=true
      }
      if(normal){
       const a=normal.array
       for(let i=0;i<a.length;i+=3){
        const x=a[i],y=a[i+1],z=a[i+2]
        a[i]=x
        a[i+1]=z
        a[i+2]=-y
       }
       normal.needsUpdate=true
      }
      geometry.computeBoundingBox();geometry.computeBoundingSphere()
     }
     const rawMapping=detailed.mapping||[]
     detailedParts=rawMapping.map((entry,i)=>({...entry,id:entry.id||`muscle-${i}`,name:spanishAnatomyName(entry.name||entry.originalName||`Músculo ${i+1}`),originalName:entry.originalName||entry.name,description:anatomyDescription(entry.name,'muscular')}))
     const normalizeName=value=>String(value||'').toLowerCase().replace(/_/g,' ').replace(/[^a-z0-9áéíóúüñ() -]/gi,' ').replace(/\s+/g,' ').trim()
     const mappingQueues=new Map()
     rawMapping.forEach((entry,i)=>{
      const key=normalizeName(entry.name||entry.originalName)
      const queue=mappingQueues.get(key)||[]
      queue.push({...entry,_sourceIndex:i})
      mappingQueues.set(key,queue)
     })
     detailed.gltf.scene.traverse(node=>{
      if(!node.isMesh)return
      const idx=detailedMeshes.length
      const key=normalizeName(node.name)
      const queue=mappingQueues.get(key)||[]
      const raw=queue.length?queue.shift():rawMapping[idx]
      const meta0=detailedParts[raw?raw._sourceIndex:idx]||{id:`muscle-${idx}`,name:spanishAnatomyName(node.name||`Músculo ${idx+1}`),system:'muscular'}
      const meta={...meta0,name:spanishAnatomyName(meta0.name),originalName:meta0.name,description:anatomyDescription(meta0.name,meta0.system)}
      const geometry=node.geometry.clone()
      transformDetailedGeometry(geometry)
      const material=new THREE.MeshPhysicalMaterial({
       color:meta.isTendon?0xe2c8b4:0xb83f45,
       roughness:meta.isTendon?.62:.58,
       metalness:0,
       clearcoat:.12,
       clearcoatRoughness:.7,
       sheen:.18,
       sheenColor:new THREE.Color(0x64121d),
       side:THREE.DoubleSide
      })
      const mesh=new THREE.Mesh(geometry,material)
      mesh.name=meta.name
      mesh.userData={system:'muscular',detailIndex:idx,part:meta,isDetailedMuscle:true}
      mesh.castShadow=false
      mesh.receiveShadow=true
      detailedGroup.add(mesh)
      detailedMeshes.push(mesh)
      materials.push(material)
     })
     detailedGroup.updateMatrixWorld(true)
     if(detailedSkeleton){
      detailedSkeleton.scene.traverse(node=>{
       if(!node.isMesh)return
       const geometry=node.geometry.clone()
       transformDetailedGeometry(geometry)
       const material=new THREE.MeshPhysicalMaterial({
        color:0xe6dcc9,roughness:.7,metalness:0,clearcoat:.08,
        clearcoatRoughness:.78,side:THREE.DoubleSide,
        transparent:true,opacity:.72,depthWrite:false,renderOrder:2
       })
       const mesh=new THREE.Mesh(geometry,material)
       mesh.name=node.name||'Hueso'
       mesh.userData={system:'skeletal',isDetailedSkeleton:true}
       mesh.renderOrder=2
       detailedGroup.add(mesh);detailedMeshes.push(mesh);materials.push(material)
      })
     }
     const atlasMuscle=meshes.filter(m=>m.userData.system==='muscular')
     atlasMuscle.forEach(m=>m.visible=false)

      // Ajuste de escala: el modelo detallado debe ocupar exactamente la misma altura
     // que el atlas base. Antes usábamos una escala fija (30), que hacía que el
     // cuerpo detallado quedara más pequeño cuando cambiaba la proporción del atlas.
     detailedGroup.updateMatrixWorld(true)
     const detailedBounds=new THREE.Box3().setFromObject(detailedGroup)
     const detailedSize=detailedBounds.getSize(new THREE.Vector3())
     const atlasSize=atlasBounds.getSize(new THREE.Vector3())
     const heightRatio=atlasSize.y/Math.max(detailedSize.y,0.0001)
     detailedGroup.scale.setScalar(heightRatio)
     detailedGroup.updateMatrixWorld(true)

     // Después de escalar, centramos ambos modelos en el mismo punto anatómico.
     const fittedBounds=new THREE.Box3().setFromObject(detailedGroup)
     const fittedCenter=fittedBounds.getCenter(new THREE.Vector3())
     detailedGroup.position.add(center).sub(fittedCenter)
     detailedGroup.updateMatrixWorld(true)
     onCatalog?.([...detailedParts,...parts])
     appliedView='';appliedRegion='full';setViewPosition(viewRef.current)
     const allBounds=new THREE.Box3().setFromObject(group)
     allBounds.union(new THREE.Box3().setFromObject(detailedGroup))
     const allSphere=allBounds.getBoundingSphere(new THREE.Sphere())
     const allRadius=Math.max(allSphere.radius,.5)
     camera.near=Math.max(.01,allRadius/1000)
     camera.far=Math.max(100,allRadius*8)
     camera.updateProjectionMatrix()
     controls.maxDistance=Math.max(allRadius*8,10)
    })().catch(()=>{})
    return()=>{renderer.domElement.removeEventListener('click',click);window.removeEventListener('resize',resize)}
   }catch(e){if(!disposed)setError(e instanceof Error?e.message:'No se pudo cargar el modelo anatómico.')}
  }
  init()
  return()=>{disposed=true;cancelAnimationFrame(frame);if(renderer){renderer.dispose();renderer.domElement.remove()};meshes.forEach(m=>m.geometry.dispose());detailedMeshes.forEach(m=>m.geometry.dispose());materials.forEach(m=>m.dispose())}
 },[bodySex])
 useEffect(()=>{if(resetToken&&modelRef.current){modelRef.current.group.rotation.y=0}},[resetToken])
 return <div className="scene-wrap"><div ref={ref} className="scene"/>{error&&<div className="model-error"><strong>Modelo 3D</strong><span>{error}</span><small>{error.includes('catalog')?'Comprueba la conexión a Internet y vuelve a cargar.':'Vuelve a cargar la página para intentar de nuevo.'}</small></div>}</div>
}
export default function App(){
 const [active,setActive]=useState(Object.fromEntries(systems.map(s=>[s.id,true]))),[selected,setSelected]=useState(null),[bodySex,setBodySex]=useState('male'),[quiz,setQuiz]=useState(null),[quizScore,setQuizScore]=useState(()=>Number(localStorage.getItem('anatomia3d-quiz-score')||0)),[quizAnswered,setQuizAnswered]=useState(0),[region,setRegion]=useState('full'),[search,setSearch]=useState(''),[catalog,setCatalog]=useState([]),[reset,setReset]=useState(0),[transparent,setTransparent]=useState(false),[autoRotate,setAutoRotate]=useState(false),[view,setView]=useState('front'),[study,setStudy]=useState(false),[progress,setProgress]=useState(0),[isolate,setIsolate]=useState(false),[explode,setExplode]=useState(false),[navMode,setNavMode]=useState('regions'),[expandedRegion,setExpandedRegion]=useState('full'),[selectedSubregion,setSelectedSubregion]=useState(null)
 const toggle=id=>setActive(a=>({...a,[id]:!a[id]}))
 const matches=search.trim()?catalog.filter(p=>p.name?.toLowerCase().includes(search.trim().toLowerCase())).slice(0,12):[]
 const chooseSearch=p=>{const item={...p,name:spanishAnatomyName(p.name),originalName:p.originalName||p.name,description:p.description||anatomyDescription(p.name,p.system)};setSelected(item);setSearch(item.name||'');setActive(a=>({...a,[item.system]:true}))}
 const buildQuiz=()=>{const pool=catalog.filter(p=>p?.name&&p.system);if(pool.length<4)return;const target=pool[Math.floor(Math.random()*pool.length)];const distractors=pool.filter(p=>p.id!==target.id&&p.system===target.system).sort(()=>Math.random()-.5).slice(0,3);const fallback=pool.filter(p=>p.id!==target.id&&p.system!==target.system).sort(()=>Math.random()-.5).slice(0,3-distractors.length);const choices=[target,...distractors,...fallback].sort(()=>Math.random()-.5);setSelected(target);setIsolate(true);setQuiz({target,choices,answered:null});setStudy(true)}
 const answerQuiz=choice=>{if(!quiz||quiz.answered)return;const correct=choice.id===quiz.target.id;setQuiz(q=>({...q,answered:choice.id}));setQuizAnswered(n=>n+1);if(correct)setQuizScore(n=>{const v=n+1;localStorage.setItem('anatomia3d-quiz-score',String(v));return v})}
 const chooseRegion=(section,child=null)=>{
  setRegion(section.id);setExpandedRegion(section.id);setSelectedSubregion(child?.id||null)
  if(section.id==='head'&&child?.id==='face')setActive(a=>({...a,muscular:true,skeletal:false}))
  else if(child?.id==='heart')setActive(a=>({...a,cardiac:true,arterial:true,venous:true}))
  else if(child?.id==='lungs')setActive(a=>({...a,respiratory:true}))
  else if(child?.id==='digestive-abdomen')setActive(a=>({...a,digestive:true}))
  else if(child?.id==='spine'||child?.id==='skull')setActive(a=>({...a,skeletal:true}))
 }
 return <div className="atlas-app">
  <header className="topbar">
   <div className="brand"><div className="brand-mark">A3</div><div><div className="brand-name">ANATOMÍA <span>3D</span></div><div className="brand-sub">Atlas interactivo</div></div></div>
   <div className="top-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar músculo, hueso, órgano, nervio..."/><kbd>Ctrl K</kbd></div>
   <div className="top-actions"><div className="body-switch"><button className={bodySex==='male'?'active':''} onClick={()=>{setBodySex('male');setSelected(null);setQuiz(null)}}>♂ Masculino</button><button className={bodySex==='female'?'active':''} onClick={()=>{setBodySex('female');setSelected(null);setQuiz(null)}}>♀ Femenino</button></div><button onClick={()=>{setStudy(!study);if(!study)buildQuiz()}} className={study?'active':''}>Estudiar</button><button onClick={()=>setReset(x=>x+1)}>Restablecer</button></div>
  </header>
  <div className="workspace">
   <aside className="sidebar left-sidebar">
    <div className="sidebar-head"><div><small>EXPLORAR</small><h2>Anatomía</h2></div><span className="live-dot"/></div>
    <div className="nav-switch">
      <button className={navMode==='regions'?'active':''} onClick={()=>setNavMode('regions')}>Regiones</button>
      <button className={navMode==='systems'?'active':''} onClick={()=>setNavMode('systems')}>Sistemas</button>
    </div>
    {navMode==='regions'?<div className="region-browser">
      <div className="section-label">ANATOMÍA REGIONAL</div>
      <button className={region==='full'&&!selectedSubregion?'region-root active':'region-root'} onClick={()=>chooseRegion(regionalSections.find(s=>s.id==='full'))}>
        <span>◉</span><div><b>Cuerpo completo</b><small>Vista general del atlas</small></div>
      </button>
      {regionalSections.filter(s=>s.id!=='full').map(section=><div className="region-tree" key={section.id}>
        <button className={region===section.id&&!selectedSubregion?'region-root active':'region-root'} onClick={()=>chooseRegion(section)}>
          <span>{section.icon}</span><div><b>{section.name}</b><small>{section.children.length} secciones</small></div><i className={expandedRegion===section.id?'open':''}>⌄</i>
        </button>
        {expandedRegion===section.id&&<div className="subregion-list">{section.children.map(child=>
          <button key={child.id} className={selectedSubregion===child.id?'subregion active':'subregion'} onClick={()=>chooseRegion(section,child)}>
            <span></span><div><b>{child.name}</b><small>{child.desc}</small></div>
          </button>)}</div>}
      </div>)}
      <div className="section-label">CAPAS RÁPIDAS</div>
      <div className="quick-layers">
       <button onClick={()=>setActive(a=>({...a,skeletal:true}))}>Huesos</button>
       <button onClick={()=>setActive(a=>({...a,muscular:true}))}>Músculos</button>
       <button onClick={()=>setActive(a=>({...a,cardiac:true,arterial:true,venous:true}))}>Vasos</button>
       <button onClick={()=>setActive(a=>({...a,nervous:true}))}>Nervios</button>
       <button onClick={()=>setActive(a=>({...a,respiratory:true,digestive:true,urinary:true}))}>Órganos</button>
      </div>
    </div>:<div className="system-browser">
      <div className="section-label">SISTEMAS DEL CUERPO</div>
      <div className="system-presets"><button onClick={()=>setActive(Object.fromEntries(systems.map(s=>[s.id,false])))}>Ocultar todos</button><button onClick={()=>setActive(Object.fromEntries(systems.map(s=>[s.id,true])))}>Mostrar todos</button></div>
      {systems.map(s=><button className={active[s.id]?'layer active':'layer'} key={s.id} onClick={()=>toggle(s.id)}><span className="layer-icon" style={{background:'#'+s.color.toString(16).padStart(6,'0')}}>{s.icon}</span><span>{s.name}</span><i/></button>)}
    </div>}
   </aside>
   <section className="viewer-shell">
    <div className="viewer-toolbar">
      <div className="toolbar-group"><button onClick={()=>setRegion('full')} className={region==='full'?'selected':''}>Cuerpo entero</button><button onClick={()=>setView('front')} className={view==='front'?'selected':''}>Frontal</button><button onClick={()=>setView('back')} className={view==='back'?'selected':''}>Posterior</button><button onClick={()=>setView('left')} className={view==='left'?'selected':''}>Lateral</button></div>
      <div className="toolbar-group"><button onClick={()=>setAutoRotate(!autoRotate)} className={autoRotate?'selected':''}>↻ Rotar</button><button onClick={()=>setTransparent(!transparent)} className={transparent?'selected':''}>◐ Transparencia</button><button onClick={()=>setExplode(!explode)} className={explode?'selected':''}>✧ Capas</button></div>
    </div>
    <AnatomyScene bodySex={bodySex} active={active} onSelect={setSelected} onCatalog={setCatalog} selected={selected} resetToken={reset} isolate={isolate} explode={explode} transparent={transparent} autoRotate={autoRotate} view={view} onProgress={setProgress} region={region}/>
    <div className="viewer-status"><span className="status-dot"/><span>{selectedSubregion?selectedSubregion.replaceAll('-',' ').toUpperCase():region==='full'?'CUERPO COMPLETO':(regionalSections.find(s=>s.id===region)?.name||region).toUpperCase()}</span><span>•</span><span>{progress<100?'Cargando '+progress+'%':'Listo'}</span></div>
    <div className="quick-controls"><button onClick={()=>setReset(x=>x+1)}>⟳</button><button onClick={()=>setView('front')}>●</button><button onClick={()=>setView('back')}>◐</button></div>
   </section>
   <aside className="sidebar detail-sidebar">
    {matches.length>0&&<div className="search-popover"><div className="section-label">RESULTADOS</div>{matches.map(p=><button key={p.id} onClick={()=>chooseSearch(p)}><strong>{p.name}</strong><small>{systemMap[p.system]?.name||p.system}</small></button>)}</div>}
    {study?<div className="detail-content"><div className="eyebrow">MODO ESTUDIO 3D</div><h2>Entrenamiento anatómico</h2><p>Identifica la estructura resaltada en el modelo.</p>{quiz?<div className="quiz-card"><div className="quiz-meta"><span>Pregunta {quizAnswered+1}</span><b>{quizScore} aciertos</b></div><strong className="quiz-prompt">¿Qué estructura está seleccionada?</strong><div className="quiz-choices">{quiz.choices.map(choice=><button key={choice.id} className={quiz.answered?(choice.id===quiz.target.id?'correct':choice.id===quiz.answered?'wrong':''):' '} onClick={()=>answerQuiz(choice)}>{choice.name}</button>)}</div>{quiz.answered&&<div className={quiz.answered===quiz.target.id?'quiz-result correct':'quiz-result wrong'}>{quiz.answered===quiz.target.id?'Correcto.':'Incorrecto.'} <b>{quiz.target.name}</b><small>{quiz.target.description||anatomyDescription(quiz.target.name,quiz.target.system)}</small><button onClick={buildQuiz}>Siguiente pregunta</button></div>}</div>:<button className="primary study-start" onClick={buildQuiz}>Comenzar entrenamiento</button>}<div className="study-card"><strong>{bodySex==='female'?'Atlas femenino':'Atlas masculino'}</strong><span>{catalog.length.toLocaleString('es-CO')} estructuras cargadas</span><small>Las respuestas y el puntaje se guardan localmente en este navegador.</small></div></div>:selected?<div className="detail-content"><div className="structure-head"><span className="structure-pill">{systemMap[selected.system]?.name}</span><button onClick={()=>setSelected(null)}>×</button></div><h1>{selected.name}</h1><p className="latin">{selected.originalName||'Nombre anatómico'}</p><div className="detail-actions"><button className="primary" onClick={()=>setIsolate(true)}>Aislar</button><button onClick={()=>setIsolate(false)}>Mostrar todo</button></div><div className="info-card"><small>FUNCIÓN / REFERENCIA</small><p>{selected.description||anatomyDescription(selected.name,selected.system)}</p></div><div className="info-card"><small>SISTEMA</small><p>{systemMap[selected.system]?.name}</p></div></div>:<div className="detail-content welcome"><div className="welcome-icon">✦</div><div className="eyebrow">ATLAS 3D</div><h2>Explora el cuerpo humano</h2><p>Selecciona una región, activa un sistema y toca cualquier estructura para conocerla.</p><div className="feature-row"><span>01</span><b>Regiones</b></div><div className="feature-row"><span>02</span><b>Capas anatómicas</b></div><div className="feature-row"><span>03</span><b>Selección individual</b></div></div>}
   </aside>
  </div>
  <footer className="atlas-footer"><span>Anatomía 3D</span><span>Modelo educativo independiente · {bodySex==='female'?FEMALE_SOURCE:MODEL_SOURCE}</span><span>{catalog.length.toLocaleString('es-CO')} estructuras catalogadas</span></footer>
 </div>
}
