import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

const systems=[
 {id:'skeleton',name:'Esquelético',icon:'🦴',color:0xe6edf3},
 {id:'muscular',name:'Muscular',icon:'💪',color:0xc94b55},
 {id:'nervous',name:'Nervioso',icon:'⚡',color:0xf2c14e},
 {id:'cardio',name:'Cardiovascular',icon:'❤️',color:0xd9415d},
 {id:'respiratory',name:'Respiratorio',icon:'◉',color:0x69a9d8},
 {id:'digestive',name:'Digestivo',icon:'◒',color:0xd98254},
 {id:'urinary',name:'Urinario',icon:'◈',color:0x8c7bd9},
 {id:'reproductive',name:'Reproductor',icon:'✦',color:0xb56ac8}
]

const info={
 skeleton:{title:'Sistema esquelético',desc:'Sostén, protección y palancas para el movimiento.',structures:['Cráneo','Columna vertebral','Esternón','Costillas','Húmero','Radio','Cúbito','Pelvis','Fémur','Tibia']},
 muscular:{title:'Sistema muscular',desc:'Genera movimiento y contribuye a la estabilidad y producción de calor.',structures:['Deltoides','Pectoral mayor','Bíceps braquial','Tríceps braquial','Recto abdominal','Glúteo mayor','Cuádriceps','Gastrocnemio']},
 nervous:{title:'Sistema nervioso',desc:'Integra información sensorial y coordina respuestas del organismo.',structures:['Encéfalo','Médula espinal','Nervios periféricos']},
 cardio:{title:'Sistema cardiovascular',desc:'Transporta sangre, oxígeno, nutrientes y productos metabólicos.',structures:['Corazón','Aorta','Arterias','Venas']},
 respiratory:{title:'Sistema respiratorio',desc:'Permite el intercambio de oxígeno y dióxido de carbono.',structures:['Tráquea','Bronquios','Pulmones','Diafragma']},
 digestive:{title:'Sistema digestivo',desc:'Procesa alimentos y permite la absorción de nutrientes.',structures:['Esófago','Estómago','Hígado','Páncreas','Intestino delgado','Intestino grueso']},
 urinary:{title:'Sistema urinario',desc:'Filtra la sangre y regula agua, electrolitos y eliminación de desechos.',structures:['Riñones','Uréteres','Vejiga','Uretra']},
 reproductive:{title:'Sistema reproductor',desc:'Conjunto de órganos relacionados con la reproducción.',structures:['Órganos reproductores','Conductos y glándulas asociadas']}
}

function makePart(name,geo,mat,pos,system){
 const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.userData={name,system};return m
}

function AnatomyScene({active,onSelect,resetToken}){
 const ref=useRef(); const sceneRef=useRef(); const selectedRef=useRef()
 useEffect(()=>{
   const el=ref.current, scene=new THREE.Scene();scene.background=new THREE.Color(0x07111f)
   const camera=new THREE.PerspectiveCamera(42,el.clientWidth/el.clientHeight,.1,100);camera.position.set(0,1.3,5.8)
   const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;el.appendChild(renderer.domElement)
   const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,1.25,0)
   scene.add(new THREE.HemisphereLight(0xffffff,0x172033,2.2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(3,5,5);scene.add(key)
   const group=new THREE.Group();scene.add(group)
   const created=[]
   const add=(m)=>{group.add(m);created.push(m)}
   const bone=new THREE.MeshStandardMaterial({color:0xdfe7ee,roughness:.65,metalness:.02})
   const muscle=new THREE.MeshStandardMaterial({color:0xb94150,roughness:.72})
   const organ=new THREE.MeshStandardMaterial({color:0x9c5362,roughness:.7})
   const nerve=new THREE.MeshStandardMaterial({color:0xe4bd42,roughness:.55,emissive:0x4a3600})
   const vessel=new THREE.MeshStandardMaterial({color:0xc83e54,roughness:.6})
   add(makePart('Cráneo',new THREE.SphereGeometry(.42,28,20),bone,[0,3.05,0],'skeleton'))
   add(makePart('Columna vertebral',new THREE.CylinderGeometry(.12,.14,2.15,16),bone,[0,1.75,0],'skeleton'))
   for(let i=0;i<6;i++) add(makePart('Costilla '+(i+1),new THREE.TorusGeometry(.62,.035,8,28,Math.PI),bone,[0,2.5-i*.25,.02],'skeleton'))
   add(makePart('Pelvis',new THREE.TorusGeometry(.62,.18,12,24,Math.PI*1.35),bone,[0,.65,0],'skeleton'))
   for(const x of [-.22,.22]){add(makePart('Fémur',new THREE.CylinderGeometry(.12,.15,1.75,16),bone,[x,-.35,0],'skeleton'));add(makePart('Tibia',new THREE.CylinderGeometry(.09,.11,1.55,14),bone,[x,-1.95,0],'skeleton'))}
   for(const x of [-.42,.42]){add(makePart('Pectoral mayor',new THREE.SphereGeometry(.32,20,16),muscle,[x,2.25,.2],'muscular'));add(makePart('Deltoides',new THREE.SphereGeometry(.22,18,14),muscle,[x*1.7,2.28,0],'muscular'));add(makePart('Cuádriceps',new THREE.CapsuleGeometry(.2,.85,10,18),muscle,[x,-.45,.18],'muscular'))}
   add(makePart('Corazón',new THREE.SphereGeometry(.3,24,18),vessel,[0,1.85,.38],'cardio'))
   for(const x of [-.25,.25]) add(makePart('Pulmón',new THREE.SphereGeometry(.38,24,18),organ,[x,1.9,.05],'respiratory'))
   add(makePart('Hígado',new THREE.SphereGeometry(.52,24,16),organ,[.28,1.15,.1],'digestive'))
   add(makePart('Estómago',new THREE.SphereGeometry(.3,22,16),organ,[-.3,1.15,.25],'digestive'))
   add(makePart('Encéfalo',new THREE.SphereGeometry(.3,24,18),nerve,[0,3.12,.08],'nervous'))
   add(makePart('Riñón derecho',new THREE.SphereGeometry(.2,20,14),organ,[.34,.82,.08],'urinary'))
   add(makePart('Riñón izquierdo',new THREE.SphereGeometry(.2,20,14),organ,[-.34,.82,.08],'urinary'))
   add(makePart('Órgano reproductor',new THREE.SphereGeometry(.22,20,14),organ,[0,.25,.18],'reproductive'))
   const ray=new THREE.Raycaster(),mouse=new THREE.Vector2()
   const click=e=>{const r=el.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(created)[0];if(hit){selectedRef.current=hit.object;onSelect(hit.object.userData.name,hit.object.userData.system)}}
   el.addEventListener('click',click)
   const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}
   window.addEventListener('resize',resize)
   sceneRef.current={scene,camera,renderer,controls,group,created}
   let id;const loop=()=>{controls.update();renderer.render(scene,camera);id=requestAnimationFrame(loop)};loop()
   return()=>{cancelAnimationFrame(id);window.removeEventListener('resize',resize);el.removeEventListener('click',click);renderer.dispose();el.removeChild(renderer.domElement)}
 },[])
 useEffect(()=>{const s=sceneRef.current;if(!s)return;s.created.forEach(m=>{m.visible=active[m.userData.system]})},[active])
 useEffect(()=>{const s=sceneRef.current;if(!s)return;s.controls.reset();s.camera.position.set(0,1.3,5.8)},[resetToken])
 return <div ref={ref} className="scene"/>
}

export default function App(){
 const [active,setActive]=useState(Object.fromEntries(systems.map(s=>[s.id,true])))
 const [selected,setSelected]=useState({name:'',system:''});const [search,setSearch]=useState('');const [reset,setReset]=useState(0)
 const filtered=systems.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()))
 const toggle=id=>setActive(a=>({...a,[id]:!a[id]}))
 return <div className="app">
   <header><div><div className="eyebrow">ANATOMÍA 3D</div><h1>Atlas humano interactivo</h1><p>Explora el cuerpo, sus sistemas y estructuras en 3D.</p></div><div className="header-actions"><button onClick={()=>setReset(x=>x+1)}>Restablecer vista</button><span className="badge">GRATIS · EDUCATIVO</span></div></header>
   <main>
    <aside className="left panel"><div className="panel-title">Sistemas</div><div className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar sistema..."/></div>
    <div className="systems">{filtered.map(s=><button className={active[s.id]?'system active':'system'} key={s.id} onClick={()=>toggle(s.id)}><span className="icon">{s.icon}</span><span>{s.name}</span><i/></button>)}</div>
    <div className="tip"><strong>Controles</strong><span>Arrastra para rotar</span><span>Rueda para zoom</span><span>Clic para seleccionar</span></div></aside>
    <section className="viewer"><AnatomyScene active={active} onSelect={(name,system)=>setSelected({name,system})} resetToken={reset}/><div className="viewer-label"><span className="dot"/>Vista 3D interactiva</div></section>
    <aside className="right panel">{selected.name?<><div className="kicker">ESTRUCTURA SELECCIONADA</div><h2>{selected.name}</h2><div className="tag">{info[selected.system]?.title||selected.system}</div><p>{info[selected.system]?.desc||'Estructura anatómica interactiva.'}</p><div className="section"><div className="panel-title">Estructuras del sistema</div>{(info[selected.system]?.structures||[]).map(x=><div className="structure" key={x}>{x}<span>›</span></div>)}</div></>:<><div className="empty"><div className="empty-icon">✦</div><h2>Selecciona una estructura</h2><p>Haz clic sobre una parte del modelo para consultar su información anatómica.</p></div></>}</aside>
   </main>
   <footer><span>Anatomía 3D · Proyecto educativo</span><span>Basado en datos anatómicos abiertos. No sustituye formación médica.</span></footer>
 </div>
}