import { lazy, Suspense, useState } from 'react'
import Sidebar from './components/panels/Sidebar'
import InfoPanel from './components/panels/InfoPanel'
import StudyPanel from './components/panels/StudyPanel'
import ReferencesPanel from './components/panels/ReferencesPanel'
import { useAnatomyStore } from './store/useAnatomyStore'
import { Brain, Target, RotateCcw, Eye, BookOpen } from 'lucide-react'

const Scene = lazy(() => import('./components/viewer/Scene'))

const Y_MIN = -0.34
const Y_MAX = 1.85

export default function App() {
  const { gender, setGender, selectedId, studyMode, setStudyMode, sectionY, setSectionY, setIsolated, setSelected, resetCamera } = useAnatomyStore()
  const [refsOpen, setRefsOpen] = useState(false)
  const btn = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition'
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b1026]">
      <header className="min-h-14 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0f1428]/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Brain className="text-teal-400" size={20} />
          <span className="font-semibold text-lg">Atlas Anatómico 3D</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-white/5 p-0.5 text-sm" role="group" aria-label="Sexo del modelo">
            {(['male', 'female'] as const).map((g) => <button key={g} aria-pressed={gender === g} onClick={() => setGender(g)} className={`px-3 py-1 rounded-md transition ${gender === g ? 'bg-teal-500/25 text-teal-200' : 'text-slate-400 hover:text-slate-200'}`}>{g === 'male' ? 'Hombre' : 'Mujer'}</button>)}
          </div>
          <button onClick={resetCamera} className={btn}><RotateCcw size={14} />Reiniciar Vista</button>
          <button onClick={() => { setIsolated(null); setSelected(null); resetCamera() }} className={btn}><Eye size={14} />Ver Todo</button>
          <button onClick={() => setRefsOpen(true)} className={btn}><BookOpen size={14} />Referencias</button>
          <button aria-pressed={studyMode !== 'off'} onClick={() => setStudyMode(studyMode === 'off' ? 'quiz' : 'off')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${studyMode !== 'off' ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/50' : 'bg-white/5 hover:bg-white/10'}`}><Target size={16} />{studyMode !== 'off' ? 'Salir de Estudio' : 'Estudio'}</button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 relative min-w-0">
          <Suspense fallback={<div className="h-full grid place-items-center text-sm text-slate-400">Cargando visor 3D…</div>}><Scene /></Suspense>
          {studyMode !== 'off' && <StudyPanel />}
          <div className="absolute bottom-14 left-4 flex items-center gap-2 rounded-lg bg-black/50 backdrop-blur px-3 py-2 text-xs text-slate-300">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={sectionY !== null} onChange={(e) => setSectionY(e.target.checked ? 1.0 : null)} />Corte axial</label>
            {sectionY !== null && <input aria-label="Altura del corte" type="range" min={Y_MIN} max={Y_MAX} step={0.01} value={sectionY} onChange={(e) => setSectionY(Number(e.target.value))} className="w-40" />}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-xs text-slate-400">Arrastra para rotar • Scroll para zoom • Click para seleccionar</div>
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-500">Huesos y músculos: <a className="underline" href="https://www.z-anatomy.com" target="_blank" rel="noreferrer">Z-Anatomy</a> (CC BY-SA 4.0) · Cuerpo: MakeHuman (CC0)</div>
        </main>
        {selectedId && studyMode === 'off' && <InfoPanel />}
      </div>
      {refsOpen && <ReferencesPanel onClose={() => setRefsOpen(false)} />}
    </div>
  )
}
