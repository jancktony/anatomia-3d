import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const MODEL_BASE='https://raw.githubusercontent.com/ashemag/human-atlas/main/public/models/'
const MODEL_SOURCE='BodyParts3D 4.0 · CC BY 4.0'

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
async function loadAtlas(){
 const res=await fetch(MODEL_BASE+'atlas.json');if(!res.ok)throw new Error('No se pudo cargar el catálogo anatómico.')
 const atlas=await res.json()
 atlas.parts=atlas.parts||[]
 atlas.chunks=(atlas.chunks||[]).map(c=>({...c,url:c.url?new URL(c.url,MODEL_BASE).href:null,gzip:c.gzip?new URL(c.gzip,MODEL_BASE).href:null}))
 return atlas
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
  let renderer,scene,camera,controls,group,atlas,parts=[],meshes=[],pickers=[],materials=[],partTexture,selectionTexture
  const init=async()=>{
   try{
    atlas=await loadAtlas();if(disposed)return;parts=atlas.parts
    onCatalog?.(parts)
    scene=new THREE.Scene();scene.background=new THREE.Color(0x07111f)
    camera=new THREE.PerspectiveCamera(34,1,.01,100);camera.position.set(0,1,4.2)
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setSize(el.clientWidth,el.clientHeight);el.appendChild(renderer.domElement)
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.target.set(0,.85,0);controls.minDistance=.08;controls.maxDistance=30
    scene.add(new THREE.HemisphereLight(0xffffff,0x172033,1.9))
    const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(3,5,4);scene.add(key)
    const rim=new THREE.DirectionalLight(0x759bc0,1.5);rim.position.set(-4,2,-4);scene.add(rim)
    group=new THREE.Group();scene.add(group)
    const width=THREE.MathUtils.ceilPowerOfTwo(parts.length),data=new Float32Array(width*4),selectedData=new Uint8Array(width*4)
    partTexture=new THREE.DataTexture(data,width,1,THREE.RGBAFormat,THREE.FloatType);partTexture.needsUpdate=true
    selectionTexture=new THREE.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true
    const makeMaterial=system=>{
     const m=new THREE.MeshStandardMaterial({color:systemMap[system]?.color||0xaebbb8,roughness:.58,metalness:.04,transparent:true,opacity:1,side:THREE.DoubleSide})
     m.onBeforeCompile=shader=>{
      shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.stateWidth={value:width}
      shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\\n'+shader.vertexShader
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\\nvec2 uvState=vec2((partIndex+0.5)/stateWidth,0.5);vec4 st=texture2D(partState,uvState);transformed+=st.xyz;partVisible=st.w;partSelected=texture2D(selectionState,uvState).r;')
      shader.fragmentShader='varying float partVisible; varying float partSelected;\\n'+shader.fragmentShader
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\\nif(partVisible<0.5)discard;')
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.28,0.85,0.76),partSelected*0.8);')
     }
     materials.push(m);return m
    }
    const mats=new Map(systems.map(s=>[s.id,makeMaterial(s.id)]))
    let loaded=0
    for(let ci=0;ci<atlas.chunks.length;ci++){
     const c=atlas.chunks[ci],compressed=!!c.gzip&&typeof DecompressionStream!=='undefined'
     const response=await fetch(compressed?c.gzip:c.url),buffer=await decode(response,c.bytes,compressed),groups=new Map()
     parts.forEach((p,i)=>{
      if(p.chunk!==ci)return
      const g=new THREE.BufferGeometry()
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3))
      g.setAttribute('normal',new THREE.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true))
      g.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1))
      g.setAttribute('partIndex',new THREE.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1))
      g.computeBoundingSphere()
      const picker=new THREE.Mesh(g);picker.visible=false;pickers[i]=picker;group.add(picker)
      const arr=groups.get(p.system)||[];arr.push(g);groups.set(p.system,arr)
     })
     groups.forEach((gs,system)=>{const merged=mergeGeometries(gs,false);if(!merged)return;const mesh=new THREE.Mesh(merged,mats.get(system)||mats.get('connective'));mesh.frustumCulled=false;group.add(mesh);meshes.push(mesh)})
     loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100))
    }
    modelRef.current={atlas,parts,data,selectedData,width,partTexture,selectionTexture,camera,controls,group}
    const ray=new THREE.Raycaster(),mouse=new THREE.Vector2()
    const click=e=>{
     const r=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;ray.setFromCamera(mouse,camera)
     let hit=null,dist=Infinity
     pickers.forEach((p,i)=>{if(!p)return;const h=ray.intersectObject(p,false)[0];if(h&&h.distance<dist){dist=h.distance;hit=i}})
     if(hit!==null)onSelect(parts[hit])
    }
    renderer.domElement.addEventListener('click',click)
    const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
    window.addEventListener('resize',resize)
    const animate=()=>{
     if(disposed)return;frame=requestAnimationFrame(animate)
     const st=modelRef.current
     if(st){
      parts.forEach((p,i)=>{
       const isSelected=selectedRef.current?.id===p.id
       const visible=!!activeRef.current[p.system] && (!isolateRef.current || isSelected)
       data[i*4+3]=visible?1:0
       selectedData[i*4]=isSelected?255:0
       let ox=0,oy=0,oz=0
       if(explodeRef.current && visible && !isSelected){
        const b=p.bounds
        if(b){
         const cx=(b[0][0]+b[1][0])/2,cy=(b[0][1]+b[1][1])/2,cz=(b[0][2]+b[1][2])/2
         const len=Math.hypot(cx,cy,cz)||1
         const amount=.85
         ox=cx/len*amount;oy=cy/len*amount;oz=cz/len*amount
        }
       }
       data[i*4]=ox;data[i*4+1]=oy;data[i*4+2]=oz
      })
      materials.forEach(m=>{m.transparent=true;m.opacity=transparentRef.current?.52:1;m.needsUpdate=true})
      partTexture.needsUpdate=true;selectionTexture.needsUpdate=true
      const currentView=viewRef.current;const v=currentView==='back'?[0,1,-4.2]:currentView==='left'?[-4.2,1,0]:currentView==='right'?[4.2,1,0]:[0,1,4.2]
      camera.position.lerp(new THREE.Vector3(...v),.08);controls.target.set(0,.85,0)
      group.rotation.y=autoRotateRef.current?group.rotation.y+.0018:group.rotation.y
      controls.update();renderer.render(scene,camera)
     }
    }
    animate()
    return()=>{renderer.domElement.removeEventListener('click',click);window.removeEventListener('resize',resize)}
   }catch(e){if(!disposed)setError(e instanceof Error?e.message:'No se pudo cargar el modelo anatómico.')}
  }
  init()
  return()=>{disposed=true;cancelAnimationFrame(frame);if(renderer){renderer.dispose();renderer.domElement.remove()};meshes.forEach(m=>m.geometry.dispose());pickers.forEach(m=>m?.geometry.dispose());materials.forEach(m=>m.dispose());partTexture?.dispose();selectionTexture?.dispose()}
 },[])
 useEffect(()=>{if(resetToken&&modelRef.current){modelRef.current.group.rotation.y=0}},[resetToken])
 return <div className="scene-wrap"><div ref={ref} className="scene"/>{error&&<div className="model-error"><strong>Modelo 3D</strong><span>{error}</span><small>{error.includes('catalog')?'Comprueba la conexión a Internet y vuelve a cargar.':'Vuelve a cargar la página para intentar de nuevo.'}</small></div>}</div>
}
export default function App(){
 const [active,setActive]=useState(Object.fromEntries(systems.map(s=>[s.id,true]))),[selected,setSelected]=useState(null),[search,setSearch]=useState(''),[catalog,setCatalog]=useState([]),[reset,setReset]=useState(0),[transparent,setTransparent]=useState(false),[autoRotate,setAutoRotate]=useState(false),[view,setView]=useState('front'),[study,setStudy]=useState(false),[progress,setProgress]=useState(0),[isolate,setIsolate]=useState(false),[explode,setExplode]=useState(false)
 const toggle=id=>setActive(a=>({...a,[id]:!a[id]}))
 const matches=search.trim()?catalog.filter(p=>p.name?.toLowerCase().includes(search.trim().toLowerCase())).slice(0,8):[]
 const chooseSearch=p=>{setSelected(p);setSearch(p.name||'')}
 return <div className="app">
  <header><div><div className="eyebrow">ANATOMÍA 3D · ATLAS PERSONAL</div><h1>Atlas humano interactivo</h1><p>Modelo anatómico real basado en BodyParts3D 4.0.</p></div><div className="header-actions"><button onClick={()=>setStudy(!study)} className={study?'primary':''}>Modo estudio</button><button onClick={()=>setReset(x=>x+1)}>Restablecer</button><span className="badge">{progress<100?'CARGANDO '+progress+'%':'MODELO 3D CARGADO'}</span></div></header>
  <main>
   <aside className="left panel"><div className="panel-title">Sistemas anatómicos</div><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar estructura..."/></div><div className="search-hint">{catalog.length?`Catálogo real · ${catalog.length.toLocaleString("es-CO")} estructuras`:"Cargando catálogo..."}</div>{matches.length>0&&<div className="search-results">{matches.map(p=><button key={p.id} onClick={()=>chooseSearch(p)}><strong>{p.name}</strong><span>{systemMap[p.system]?.name||p.system}</span></button>)}</div>}
   <div className="systems">{systems.map(s=><button className={active[s.id]?'system active':'system'} key={s.id} onClick={()=>toggle(s.id)}><span className="icon">{s.icon}</span><span>{s.name}</span><i/></button>)}</div>
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