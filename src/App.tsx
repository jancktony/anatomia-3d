import { lazy, Suspense } from 'react'
import Sidebar from './components/panels/Sidebar'
import InfoPanel from './components/panels/InfoPanel'
import { useAnatomyStore } from './store/useAnatomyStore'
import { Brain, Target, RotateCcw, Eye } from 'lucide-react'

const Scene = lazy(() => import('./components/viewer/Scene'))

export default function App() {
  const { gender, setGender, selectedId, quizMode, setQuizMode, setIsolated, setSelected, resetCamera } = useAnatomyStore()
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b1026]">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0f1428]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="text-teal-400" size={20} />
            <span className="font-semibold text-lg">Atlas Anatómico 3D</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white/5 p-0.5 text-sm" role="group" aria-label="Sexo del modelo">
            {(['male', 'female'] as const).map((g) => <button key={g} aria-pressed={gender === g} onClick={() => setGender(g)} className={`px-3 py-1 rounded-md transition ${gender === g ? 'bg-teal-500/25 text-teal-200' : 'text-slate-400 hover:text-slate-200'}`}>{g === 'male' ? 'Hombre' : 'Mujer'}</button>)}
          </div>
          <button onClick={resetCamera} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition"><RotateCcw size={14} />Reiniciar Vista</button>
          <button onClick={() => { setIsolated(null); setSelected(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition"><Eye size={14} />Ver Todo</button>
          <button onClick={() => setQuizMode(!quizMode)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${quizMode ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/50' : 'bg-white/5 hover:bg-white/10'}`}><Target size={16} />{quizMode ? 'Salir de Quiz' : 'Modo Quiz'}</button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 relative">
          <Suspense fallback={<div className="h-full grid place-items-center text-sm text-slate-400">Cargando visor 3D…</div>}><Scene /></Suspense>
          {quizMode && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur px-6 py-2.5 rounded-full text-sm border border-teal-400/30 shadow-lg shadow-teal-400/10">Modo Quiz: Selecciona e identifica estructuras</div>}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-xs text-slate-400">Arrastra para rotar • Scroll para zoom • Click para seleccionar</div>
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-500">Huesos y músculos: <a className="underline" href="https://www.z-anatomy.com" target="_blank" rel="noreferrer">Z-Anatomy</a> (CC BY-SA 4.0) · Cuerpo: MakeHuman (CC0)</div>
        </main>
        {selectedId && <InfoPanel />}
      </div>
    </div>
  )
}
