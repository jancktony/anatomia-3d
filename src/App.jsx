import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_BASE='./models/'
const MODEL_SOURCE='BodyParts3D 4.0 · CC BY 4.0 + capa muscular detallada BodyExplorer/Z-Anatomy · CC BY-SA 4.0'

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
function explain(name,system){
 const n=name.toLowerCase()
 const facts={'heart':'Bomba muscular de cuatro cavidades que impulsa la sangre por las circulaciones pulmonar y sistémica.','liver':'Órgano metabólico que procesa nutrientes, produce bilis y sintetiza numerosas proteínas plasmáticas.','brain':'Órgano central del sistema nervioso que integra información y participa en percepción, movimiento y regulación corporal.','stomach':'Cámara muscular que almacena y mezcla el alimento e inicia su digestión química.','spleen':'Órgano linfoide que filtra la sangre y participa en la respuesta inmunitaria.','pancreas':'Órgano con funciones digestivas y endocrinas; produce enzimas y hormonas como insulina y glucagón.','urinary bladder':'Reservorio muscular que almacena temporalmente la orina.','trachea':'Conducto respiratorio que conecta la laringe con los bronquios y mantiene abierta la vía aérea.','diaphragm':'Músculo que separa tórax y abdomen y participa de forma principal en la inspiración.'}
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
async function loadAtlas(){
 const base=new URL(MODEL_BASE,document.baseURI)
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
function AnatomyScene({active,onSelect,selected,resetToken,transparent,autoRotate,view,onProgress,isolate,explode,onCatalog}){
 const ref=useRef(),modelRef=useRef(null),[error,setError]=useState('')
 const activeRef=useRef(active),selectedRef=useRef(selected),autoRotateRef=useRef(autoRotate),viewRef=useRef(view),transparentRef=useRef(transparent),isolateRef=useRef(isolate),explodeRef=useRef(explode)
 activeRef.current=active;selectedRef.current=selected;autoRotateRef.current=autoRotate;viewRef.current=view;transparentRef.current=transparent;isolateRef.current=isolate;explodeRef.current=explode
 useEffect(()=>{
  const el=ref.current;let disposed=false,frame=0
  let renderer,scene,camera,controls,group,detailedGroup,atlas,parts=[],meshes=[],detailedMeshes=[],pickers=[],materials=[],detailedParts=[]
  const init=async()=>{
   try{
    atlas=await loadAtlas();if(disposed)return;parts=atlas.parts
    onCatalog?.(parts)
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
    const selectable=[...meshes,...detailedMeshes]
    const click=e=>{
     const r=renderer.domElement.getBoundingClientRect()
     mouse.x=(e.clientX-r.left)/r.width*2-1
     mouse.y=-(e.clientY-r.top)/r.height*2+1
     ray.setFromCamera(mouse,camera)
     const hits=ray.intersectObjects(selectable,false)
     if(!hits.length)return
     const hit=hits[0]
     if(hit.object.userData.isDetailedMuscle){
      const p=hit.object.userData.part
      if(p)onSelect(p)
      return
     }
     const geometry=hit.object.geometry
     const indexAttr=geometry.getAttribute('partIndex')
     if(!indexAttr || hit.faceIndex==null)return
     const a=geometry.index ? geometry.index.getX(hit.faceIndex*3) : hit.faceIndex*3
     const partIndex=Math.round(indexAttr.getX(a))
     if(parts[partIndex])onSelect(parts[partIndex])
    }
    renderer.domElement.addEventListener('click',click)
    const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
    window.addEventListener('resize',resize)
    let appliedView='front'
    const setViewPosition=which=>{
     const bounds=new THREE.Box3().setFromObject(group)
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
      if(currentView!==appliedView)setViewPosition(currentView)
      group.rotation.y=autoRotateRef.current?group.rotation.y+.0018:group.rotation.y
      controls.update();renderer.render(scene,camera)
     }
    }
    animate()
    const loadDeferredDetailed=async()=>{
     try{
      const [detailed,detailedSkeleton]=await Promise.all([loadDetailedMuscles(),loadDetailedSkeleton()])
      if(disposed)return
     
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
         
      if(detailedGroup&&detailedMeshes.length){
       const detailedBounds=new THREE.Box3().setFromObject(detailedGroup)
       const detailedCenter=detailedBounds.getCenter(new THREE.Vector3())
       detailedGroup.position.copy(center).sub(detailedCenter)
       detailedGroup.updateMatrixWorld(true)
       const allBounds=new THREE.Box3().setFromObject(group)
       allBounds.union(new THREE.Box3().setFromObject(detailedGroup))
       const allSphere=allBounds.getBoundingSphere(new THREE.Sphere())
       const allRadius=Math.max(allSphere.radius,.5)
       camera.near=Math.max(.01,allRadius/1000)
       camera.far=Math.max(100,allRadius*8)
       camera.updateProjectionMatrix()
       controls.maxDistance=Math.max(allRadius*8,10)
      }
      if(modelRef.current)modelRef.current.detailedParts=detailedParts
      onCatalog?.([...detailedParts,...parts])
     }catch(_){/* La capa detallada es opcional y no bloquea el atlas base. */}
    }
    const scheduleDetailed=window.requestIdleCallback
     ? cb=>window.requestIdleCallback(cb,{timeout:1800})
     : cb=>setTimeout(cb,900)
    scheduleDetailed(()=>loadDeferredDetailed())
    return()=>{renderer.domElement.removeEventListener('click',click);window.removeEventListener('resize',resize)}
   }catch(e){if(!disposed)setError(e instanceof Error?e.message:'No se pudo cargar el modelo anatómico.')}
  }
  init()
  return()=>{disposed=true;cancelAnimationFrame(frame);if(renderer){renderer.dispose();renderer.domElement.remove()};meshes.forEach(m=>m.geometry.dispose());detailedMeshes.forEach(m=>m.geometry.dispose());materials.forEach(m=>m.dispose())}
 },[])
 useEffect(()=>{if(resetToken&&modelRef.current){modelRef.current.group.rotation.y=0}},[resetToken])
 return <div className="scene-wrap"><div ref={ref} className="scene"/>{error&&<div className="model-error"><strong>Modelo 3D</strong><span>{error}</span><small>{error.includes('catalog')?'Comprueba la conexión a Internet y vuelve a cargar.':'Vuelve a cargar la página para intentar de nuevo.'}</small></div>}</div>
}
export default function App(){
 const [active,setActive]=useState(Object.fromEntries(systems.map(s=>[s.id,true]))),[selected,setSelected]=useState(null),[search,setSearch]=useState(''),[catalog,setCatalog]=useState([]),[reset,setReset]=useState(0),[transparent,setTransparent]=useState(false),[autoRotate,setAutoRotate]=useState(false),[view,setView]=useState('front'),[study,setStudy]=useState(false),[progress,setProgress]=useState(0),[isolate,setIsolate]=useState(false),[explode,setExplode]=useState(false)
 const toggle=id=>setActive(a=>({...a,[id]:!a[id]}))
 const matches=search.trim()?catalog.filter(p=>p.name?.toLowerCase().includes(search.trim().toLowerCase())).slice(0,12):[]
 const chooseSearch=p=>{setSelected(p);setSearch(p.name||'');setActive(a=>({...a,[p.system]:true}))}
 return <div className="app">
  <header><div><div className="eyebrow">ANATOMÍA 3D · ATLAS PERSONAL</div><h1>Atlas humano interactivo</h1><p>Modelo anatómico 3D detallado con capa muscular profunda y superficial.</p></div><div className="header-actions"><button onClick={()=>setStudy(!study)} className={study?'primary':''}>Modo estudio</button><button onClick={()=>setReset(x=>x+1)}>Restablecer</button><span className="badge">{progress<100?'CARGANDO '+progress+'%':'MODELO 3D CARGADO'}</span></div></header>
  <main>
   <aside className="left panel"><div className="panel-title">Sistemas anatómicos</div><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar estructura..."/></div><div className="search-hint">{catalog.length?`Catálogo real · ${catalog.length.toLocaleString("es-CO")} estructuras`:"Cargando catálogo..."}</div>{matches.length>0&&<div className="search-results">{matches.map(p=><button key={p.id} onClick={()=>chooseSearch(p)}><strong>{p.name}</strong><span>{systemMap[p.system]?.name||p.system}</span></button>)}</div>}
   <div className="systems"><button className="system active" onClick={()=>setActive(Object.fromEntries(systems.map(s=>[s.id,s.id==='muscular'])))}><span className="icon">💪</span><span>Solo músculos</span><i/></button>{systems.map(s=><button className={active[s.id]?'system active':'system'} key={s.id} onClick={()=>toggle(s.id)}><span className="icon">{s.icon}</span><span>{s.name}</span><i/></button>)}</div>
   <div className="tip"><strong>Herramientas</strong><label><input type="checkbox" checked={transparent} onChange={e=>setTransparent(e.target.checked)}/> Transparencia</label><label><input type="checkbox" checked={autoRotate} onChange={e=>setAutoRotate(e.target.checked)}/> Rotación automática</label><label><input type="checkbox" checked={isolate} onChange={e=>setIsolate(e.target.checked)} disabled={!selected}/> Aislar selección</label><label><input type="checkbox" checked={explode} onChange={e=>setExplode(e.target.checked)}/> Vista explotada</label></div>
   </aside>
   <section className="viewer"><AnatomyScene active={active} onSelect={setSelected} onCatalog={setCatalog} selected={selected} resetToken={reset} isolate={isolate} explode={explode} transparent={transparent} autoRotate={autoRotate} view={view} onProgress={setProgress}/>
    <div className="viewbar"><button className={view==='front'?'selected':''} onClick={()=>setView('front')}>Frontal</button><button className={view==='back'?'selected':''} onClick={()=>setView('back')}>Posterior</button><button className={view==='left'?'selected':''} onClick={()=>setView('left')}>Lateral</button><button className={view==='right'?'selected':''} onClick={()=>setView('right')}>Derecha</button></div>
    <div className="viewer-label"><span className="dot"/>Modelo BodyParts3D · arrastra para rotar · rueda para zoom</div>
   </section>
   <aside className="right panel">{study?<div className="study"><div className="kicker">MODO ESTUDIO</div><h2>Identifica la estructura</h2><p>Haz clic directamente sobre una estructura anatómica del modelo.</p><div className="study-card">{selected?<><strong>{selected.name}</strong><span>{systemMap[selected.system]?.name}</span><small>{explain(selected.name,selected.system)}</small></>:<><strong>Selecciona una estructura</strong><span>Haz clic sobre el modelo 3D</span></>}</div><button className="primary full" onClick={()=>setReset(x=>x+1)}>Nueva vista</button></div>:selected?<><div className="kicker">ESTRUCTURA SELECCIONADA</div><h2>{selected.name}</h2><div className="tag">{systemMap[selected.system]?.name}</div><div className="selection-actions"><button className="primary" onClick={()=>setIsolate(true)}>Aislar</button><button onClick={()=>setIsolate(false)}>Mostrar todo</button></div><div className="facts"><div><span>Sistema</span><strong>{systemMap[selected.system]?.name}</strong></div><div><span>Función / referencia</span><strong>{explain(selected.name,selected.system)}</strong></div></div><div className="section"><div className="panel-title">Fuente anatómica</div><p>{MODEL_SOURCE}. El conjunto utilizado es un modelo de referencia masculino adulto y tiene finalidad educativa.</p></div></>:<div className="empty"><div className="empty-icon">✦</div><h2>Selecciona una estructura</h2><p>Haz clic directamente sobre el modelo anatómico real.</p></div>}</aside>
  </main>
  <footer><span>Anatomía 3D · Proyecto educativo personal</span><span>BodyParts3D 4.0 · CC BY 4.0 · DBCLS</span></footer>
 </div>
}