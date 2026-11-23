import { lazy, Suspense, useEffect, useState } from 'react'
import Home from './components/home/Home'
import Sidebar from './components/panels/Sidebar'
import InfoPanel from './components/panels/InfoPanel'
import StudyPanel from './components/panels/StudyPanel'
import ReferencesPanel from './components/panels/ReferencesPanel'
import SettingsPanel from './components/panels/SettingsPanel'
import { applyTheme } from './lib/themes'
import { structures, systems } from './data/anatomy'
import { availableFor } from './lib/available'
import { useAnatomyStore, type CamPreset } from './store/useAnatomyStore'
import { ArrowLeft, List, Scissors, Boxes, Target, RotateCcw, Eye, Settings } from 'lucide-react'

const Scene = lazy(() => import('./components/viewer/Scene'))

const Y_MIN = -0.34
const Y_MAX = 1.85
const VIEWS: readonly (readonly [CamPreset, string])[] = [['front', 'Frente'], ['back', 'Atrás'], ['side', 'Lado'], ['persp', 'Perspectiva']]

const rail = 'absolute top-0 h-full w-12 z-20 flex flex-col items-center gap-2 py-3 bg-surface/85 backdrop-blur'
const tool = 'grid size-9 place-items-center rounded-lg text-fg hover:bg-card-hover aria-pressed:bg-accent/25 aria-pressed:text-accent'

function Viewer({ onSettings }: { onSettings: () => void }) {
  const s = useAnatomyStore()
  const [listOpen, setListOpen] = useState(false)
  const sel = structures.find((x) => x.id === s.selectedId)
  const pool = availableFor(s.gender)
  const hover = structures.find((x) => x.id === s.hoverId)
  const title = hover?.name ?? sel?.name ?? s.focusLabel ?? 'Atlas'
  const Btn = ({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className={tool}>{children}</button>
  )
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-app">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full grid place-items-center text-sm text-muted">Cargando visor 3D…</div>}><Scene /></Suspense>
      </div>

      <nav aria-label="Capas" className={`${rail} left-0 border-r border-line`}>
        <Btn label="Volver al inicio" onClick={s.goHome}><ArrowLeft size={18} /></Btn>
        <Btn label="Lista de estructuras" pressed={listOpen} onClick={() => setListOpen((v) => !v)}><List size={18} /></Btn>
        <div className="h-px w-6 bg-card-hover" />
        {systems.filter((sys) => sys.id === 'piel' || pool.some((x) => x.system === sys.id)).map((sys) => {
          const on = s.activeSystems.includes(sys.id)
          return (
            <button key={sys.id} aria-label={`Capa ${sys.label}`} title={sys.label} aria-pressed={on} onClick={() => s.toggleSystem(sys.id)} className="grid size-9 place-items-center rounded-lg hover:bg-card-hover">
              <span className="size-4 rounded-full transition" style={{ background: on ? sys.color : 'transparent', border: `2px solid ${sys.color}` }} />
            </button>
          )
        })}
      </nav>

      <nav aria-label="Herramientas" className={`${rail} right-0 border-l border-line`}>
        <Btn label={s.gender === 'male' ? 'Modelo: hombre (cambiar a mujer)' : 'Modelo: mujer (cambiar a hombre)'} onClick={() => s.setGender(s.gender === 'male' ? 'female' : 'male')}><span className="text-xs font-semibold">{s.gender === 'male' ? '♂' : '♀'}</span></Btn>
        <Btn label="Corte axial" pressed={s.sectionY !== null} onClick={() => s.setSectionY(s.sectionY === null ? 1.0 : null)}><Scissors size={18} /></Btn>
        <Btn label="Despiece" pressed={s.explode > 0} onClick={() => s.setExplode(s.explode > 0 ? 0 : 1)}><Boxes size={18} /></Btn>
        <Btn label="Estudio" pressed={s.studyMode !== 'off'} onClick={() => s.setStudyMode(s.studyMode === 'off' ? 'quiz' : 'off')}><Target size={18} /></Btn>
        <div className="h-px w-6 bg-card-hover" />
        <Btn label="Reiniciar vista" onClick={s.resetCamera}><RotateCcw size={18} /></Btn>
        <Btn label="Ver todo" onClick={() => { s.setIsolated(null); s.setSelected(null); s.resetCamera() }}><Eye size={18} /></Btn>
        <Btn label="Configuración" onClick={onSettings}><Settings size={18} /></Btn>
      </nav>

      <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-surface/85 border border-line px-4 py-1.5 text-sm backdrop-blur">{title}</div>

      {listOpen && <div className="absolute left-12 top-0 z-20 h-full shadow-xl"><Sidebar /></div>}
      {s.selectedId && s.studyMode === 'off' && <div className="absolute right-12 top-0 z-10 h-full"><InfoPanel /></div>}
      {s.studyMode !== 'off' && <StudyPanel />}

      <div className="absolute bottom-3 left-1/2 z-10 flex max-w-[calc(100%-7rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl bg-surface/85 border border-line px-3 py-2 text-xs text-fg backdrop-blur">
        <div className="flex gap-1" role="group" aria-label="Vista">
          {VIEWS.map(([id, label]) => <button key={id} onClick={() => s.setCamPreset(id)} className="rounded-md px-2 py-1 hover:bg-card-hover">{label}</button>)}
        </div>
        <label className="flex items-center gap-2">Ensamblado
          <input aria-label="Ensamblado a separado" type="range" min={0} max={1} step={0.01} value={s.explode} onChange={(e) => s.setExplode(Number(e.target.value))} className="w-28" />Separado
        </label>
        {s.sectionY !== null && (
          <label className="flex items-center gap-2">Corte
            <input aria-label="Altura del corte" type="range" min={Y_MIN} max={Y_MAX} step={0.01} value={s.sectionY} onChange={(e) => s.setSectionY(Number(e.target.value))} className="w-28" />
          </label>
        )}
      </div>
      <div className="absolute bottom-1 right-14 z-10 text-[10px] text-muted">{s.gender === 'female' ? 'Human Reference Atlas + BodyParts3D (CC BY 4.0)' : 'Z-Anatomy (CC BY-SA 4.0)'} · MakeHuman (CC0)</div>
    </div>
  )
}

export default function App() {
  const view = useAnatomyStore((s) => s.view)
  const [refsOpen, setRefsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const theme = useAnatomyStore((s) => s.theme)
  useEffect(() => { applyTheme(theme) }, [theme])
  return (
    <>
      {view === 'home' ? <Home onSettings={() => setSettingsOpen(true)} /> : <Viewer onSettings={() => setSettingsOpen(true)} />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} onRefs={() => setRefsOpen(true)} />}
      {refsOpen && <ReferencesPanel onClose={() => setRefsOpen(false)} />}
    </>
  )
}
