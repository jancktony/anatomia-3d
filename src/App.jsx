import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

const systems=[
 {id:'skeleton',name:'Esquelético',icon:'🦴',color:0xdce5ec},
 {id:'muscular',name:'Muscular',icon:'💪',color:0xc84a57},
 {id:'nervous',name:'Nervioso',icon:'⚡',color:0xe7bd48},
 {id:'cardio',name:'Cardiovascular',icon:'♥',color:0xd63f55},
 {id:'respiratory',name:'Respiratorio',icon:'◉',color:0x62a9d8},
 {id:'digestive',name:'Digestivo',icon:'◒',color:0xd47b52},
 {id:'urinary',name:'Urinario',icon:'◈',color:0x8c78d3},
 {id:'reproductive',name:'Reproductor',icon:'✦',color:0xb15dc5}
]

const structures={
 'Cráneo':{system:'skeleton',region:'Cabeza',function:'Protege el encéfalo y forma el esqueleto de la cabeza.'},
 'Columna vertebral':{system:'skeleton',region:'Tronco',function:'Sostiene el cuerpo y protege la médula espinal.'},
 'Costillas':{system:'skeleton',region:'Tórax',function:'Protegen los órganos torácicos y participan en la mecánica respiratoria.'},
 'Pelvis':{system:'skeleton',region:'Pelvis',function:'Transfiere el peso del tronco a los miembros inferiores y protege vísceras pélvicas.'},
 'Fémur':{system:'skeleton',region:'Miembro inferior',function:'Principal hueso del muslo y soporte de carga.'},
 'Tibia':{system:'skeleton',region:'Pierna',function:'Principal hueso medial de la pierna y transmisor de carga.'},
 'Pectoral mayor':{system:'muscular',region:'Tórax',function:'Aduce, rota medialmente y participa en la flexión del brazo.'},
 'Deltoides':{system:'muscular',region:'Hombro',function:'Principal músculo de la abducción del brazo.'},
 'Cuádriceps':{system:'muscular',region:'Muslo',function:'Extiende la rodilla; el recto femoral también flexiona la cadera.'},
 'Corazón':{system:'cardio',region:'Mediastino',function:'Bombea la sangre a la circulación pulmonar y sistémica.'},
 'Aorta':{system:'cardio',region:'Tórax y abdomen',function:'Principal arteria que distribuye sangre oxigenada desde el ventrículo izquierdo.'},
 'Pulmones':{system:'respiratory',region:'Tórax',function:'Realizan el intercambio gaseoso entre el aire y la sangre.'},
 'Tráquea':{system:'respiratory',region:'Cuello y tórax',function:'Conduce el aire hacia los bronquios.'},
 'Hígado':{system:'digestive',region:'Abdomen superior',function:'Participa en metabolismo, almacenamiento y producción de sustancias esenciales.'},
 'Estómago':{system:'digestive',region:'Abdomen superior',function:'Almacena y mezcla el alimento e inicia su digestión química.'},
 'Encéfalo':{system:'nervous',region:'Cráneo',function:'Integra información sensorial y coordina funciones del organismo.'},
 'Médula espinal':{system:'nervous',region:'Canal vertebral',function:'Conduce información nerviosa entre el encéfalo y el cuerpo.'},
 'Riñones':{system:'urinary',region:'Abdomen posterior',function:'Filtran la sangre y contribuyen al equilibrio de agua y electrolitos.'},
 'Vejiga':{system:'urinary',region:'Pelvis',function:'Almacena temporalmente la orina.'},
 'Sistema reproductor':{system:'reproductive',region:'Pelvis',function:'Comprende órganos y estructuras relacionados con la reproducción.'}
}

function part(name,geo,mat,pos,system,scale=[1,1,1]){
 const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.userData={name,system};return m
}

function AnatomyScene({active,onSelect,resetToken,transparent,autoRotate,view}){
 const ref=useRef(), sceneRef=useRef()
 useEffect(()=>{
  const el=ref.current,scene=new THREE.Scene();scene.background=new THREE.Color(0x07111f)
  const camera=new THREE.PerspectiveCamera(40,el.clientWidth/el.clientHeight,.05,100);camera.position.set(0,1.25,6)
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(el.clientWidth,el.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement)
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,1.25,0);controls.minDistance=2.7;controls.maxDistance=9
  scene.add(new THREE.HemisphereLight(0xffffff,0x172033,2.3))
  const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(3,5,5);scene.add(key)
  const rim=new THREE.DirectionalLight(0x5b8fbd,1.5);rim.position.set(-4,2,-4);scene.add(rim)
  const group=new THREE.Group();scene.add(group);const created=[]
  const add=m=>{group.add(m);created.push(m)}
  const bone=new THREE.MeshStandardMaterial({color:0xdce5ec,roughness:.65})
  const muscle=new THREE.MeshStandardMaterial({color:0xb83f4c,roughness:.72})
  const organ=new THREE.MeshStandardMaterial({color:0xa65362,roughness:.65})
  const nerve=new THREE.MeshStandardMaterial({color:0xe4bb42,roughness:.5,emissive:0x352600})
  const vessel=new THREE.MeshStandardMaterial({color:0xd33d53,roughness:.58})
  const blue=new THREE.MeshStandardMaterial({color:0x4d8fbe,roughness:.58})
  add(part('Cráneo',new THREE.SphereGeometry(.43,32,22),bone,[0,3.12,0],'skeleton',[1.02,1.08,.92]))
  add(part('Columna vertebral',new THREE.CylinderGeometry(.105,.15,2.25,18),bone,[0,1.7,0],'skeleton'))
  for(let i=0;i<7;i++){const y=2.55-i*.25;add(part('Costillas',new THREE.TorusGeometry(.64,.035,8,32,Math.PI),bone,[0,y,.02],'skeleton',[1,.9,1]))}
  add(part('Pelvis',new THREE.TorusGeometry(.63,.17,12,28,Math.PI*1.4),bone,[0,.62,0],'skeleton',[1,.75,1]))
  for(const x of[-.23,.23]){add(part('Fémur',new THREE.CylinderGeometry(.115,.15,1.75,18),bone,[x,-.35,0],'skeleton'));add(part('Tibia',new THREE.CylinderGeometry(.085,.11,1.5,16),bone,[x,-1.95,0],'skeleton'))}
  for(const x of[-.44,.44]){add(part('Pectoral mayor',new THREE.SphereGeometry(.32,24,18),muscle,[x,2.28,.23],'muscular',[1.2,.8,.72]));add(part('Deltoides',new THREE.SphereGeometry(.23,22,16),muscle,[x*1.7,2.3,0],'muscular'));add(part('Cuádriceps',new THREE.CapsuleGeometry(.19,.86,10,18),muscle,[x,-.43,.18],'muscular',[1.05,1,.8]))}
  add(part('Corazón',new THREE.SphereGeometry(.3,28,20),vessel,[0,1.87,.4],'cardio',[.9,1.12,.82]))
  add(part('Aorta',new THREE.CylinderGeometry(.055,.07,.75,14),vessel,[.05,2.28,.3],'cardio',[1,1,1]))
  for(const x of[-.27,.27])add(part('Pulmones',new THREE.SphereGeometry(.4,28,20),blue,[x,1.92,.04],'respiratory',[.75,1.25,.65]))
  add(part('Tráquea',new THREE.CylinderGeometry(.07,.08,.62,16),blue,[0,2.48,.03],'respiratory'))
  add(part('Hígado',new THREE.SphereGeometry(.52,28,20),organ,[.27,1.15,.1],'digestive',[1.25,.72,.78]))
  add(part('Estómago',new THREE.SphereGeometry(.3,24,18),organ,[-.3,1.18,.28],'digestive',[.9,1.2,.9]))
  add(part('Encéfalo',new THREE.SphereGeometry(.31,28,20),nerve,[0,3.17,.08],'nervous',[1.15,.9,1]))
  add(part('Médula espinal',new THREE.CylinderGeometry(.045,.055,1.95,12),nerve,[0,1.7,.08],'nervous'))
  for(const x of[-.34,.34])add(part('Riñones',new THREE.SphereGeometry(.21,24,16),organ,[x,.82,.08],'urinary',[.7,1.25,1]))
  add(part('Vejiga',new THREE.SphereGeometry(.23,24,18),organ,[0,.28,.18],'urinary',[1,.8,.9]))
  add(part('Sistema reproductor',new THREE.SphereGeometry(.23,24,18),organ,[0,.05,.2],'reproductive',[1,.8,.8]))
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2()
  const click=e=>{const r=el.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(created)[0];if(hit)onSelect(hit.object.userData.name,hit.object.userData.system)}
  el.addEventListener('click',click)
  const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
  window.addEventListener('resize',resize)
  sceneRef.current={camera,renderer,controls,created,group}
  let frame;const loop=()=>{if(autoRotate)group.rotation.y+=.0025;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(loop)};loop()
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);el.removeEventListener('click',click);renderer.dispose();el.removeChild(renderer.domElement)}
 },[])
 useEffect(()=>{const s=sceneRef.current;if(!s)return;s.created.forEach(m=>{m.visible=!!active[m.userData.system];m.material.transparent=transparent;m.material.opacity=transparent?.34:1})},[active,transparent])
 useEffect(()=>{const s=sceneRef.current;if(!s)return;s.controls.reset();s.group.rotation.y=0;if(view==='front'){s.camera.position.set(0,1.25,6);s.controls.target.set(0,1.25,0)}if(view==='back'){s.camera.position.set(0,1.25,-6);s.controls.target.set(0,1.25,0)}if(view==='left'){s.camera.position.set(-6,1.25,0);s.controls.target.set(0,1.25,0)}if(view==='right'){s.camera.position.set(6,1.25,0);s.controls.target.set(0,1.25,0)}s.camera.lookAt(0,1.25,0)},[resetToken,view])
 return <div ref={ref} className="scene"/>
}

export default function App(){
 const [active,setActive]=useState(Object.fromEntries(systems.map(s=>[s.id,true])))
 const [selected,setSelected]=useState(null),[search,setSearch]=useState(''),[reset,setReset]=useState(0),[transparent,setTransparent]=useState(false),[autoRotate,setAutoRotate]=useState(false),[view,setView]=useState('front'),[study,setStudy]=useState(false)
 const visible=Object.entries(structures).filter(([name,d])=>name.toLowerCase().includes(search.toLowerCase())&&active[d.system])
 const select=(name,system)=>setSelected({name,system})
 const selectedData=selected?structures[selected.name]:null
 return <div className="app">
  <header><div><div className="eyebrow">ANATOMÍA 3D · ATLAS PERSONAL</div><h1>Atlas humano interactivo</h1><p>Explora sistemas, estructuras y relaciones anatómicas en 3D.</p></div><div className="header-actions"><button onClick={()=>setStudy(!study)} className={study?'primary':''}>Modo estudio</button><button onClick={()=>setReset(x=>x+1)}>Restablecer</button><span className="badge">EDUCATIVO · OFFLINE READY</span></div></header>
  <main>
   <aside className="left panel"><div className="panel-title">Sistemas</div><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar estructura..."/></div>
   <div className="systems">{systems.map(s=><button className={active[s.id]?'system active':'system'} key={s.id} onClick={()=>setActive(a=>({...a,[s.id]:!a[s.id]}))}><span className="icon">{s.icon}</span><span>{s.name}</span><i/></button>)}</div>
   <div className="tip"><strong>Herramientas</strong><label><input type="checkbox" checked={transparent} onChange={e=>setTransparent(e.target.checked)}/> Transparencia</label><label><input type="checkbox" checked={autoRotate} onChange={e=>setAutoRotate(e.target.checked)}/> Rotación automática</label></div>
   <div className="tip"><strong>Estructuras</strong>{visible.slice(0,8).map(([name])=><button className="mini" key={name} onClick={()=>select(name,structures[name].system)}>{name}</button>)}</div></aside>
   <section className="viewer"><AnatomyScene active={active} onSelect={select} resetToken={reset} transparent={transparent} autoRotate={autoRotate} view={view}/>
    <div className="viewbar"><button className={view==='front'?'selected':''} onClick={()=>setView('front')}>Frontal</button><button className={view==='back'?'selected':''} onClick={()=>setView('back')}>Posterior</button><button className={view==='left'?'selected':''} onClick={()=>setView('left')}>Lateral</button></div>
    <div className="viewer-label"><span className="dot"/>3D interactivo · arrastra para rotar · rueda para zoom</div>
   </section>
   <aside className="right panel">{study?<div className="study"><div className="kicker">MODO ESTUDIO</div><h2>Identifica la estructura</h2><p>Selecciona una estructura del modelo. El atlas mostrará su sistema y función para ayudarte a estudiar.</p><div className="study-card">{selected?<><strong>{selected.name}</strong><span>{selectedData?.region}</span><small>{selectedData?.function}</small></>:<><strong>Haz clic en el modelo</strong><span>Comienza una identificación</span></>}</div><button className="primary full" onClick={()=>setReset(x=>x+1)}>Nueva vista</button></div>:selected?<><div className="kicker">ESTRUCTURA SELECCIONADA</div><h2>{selected.name}</h2><div className="tag">{systems.find(s=>s.id===selected.system)?.name}</div><div className="facts"><div><span>Región</span><strong>{selectedData?.region}</strong></div><div><span>Función</span><strong>{selectedData?.function}</strong></div></div><div className="section"><div className="panel-title">Información anatómica</div><p>Esta ficha es una base educativa. En la siguiente fase añadiremos origen, inserción, inervación, irrigación, relaciones y referencias.</p></div></>:<div className="empty"><div className="empty-icon">✦</div><h2>Selecciona una estructura</h2><p>Haz clic sobre el modelo o usa la búsqueda para abrir su ficha anatómica.</p></div>}</aside>
  </main>
  <footer><span>Anatomía 3D · Proyecto educativo personal</span><span>Modelos y datos abiertos con atribución. No sustituye formación médica.</span></footer>
 </div>
}