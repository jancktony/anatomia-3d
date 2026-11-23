import { X, BookOpen, Activity, GitBranch, Droplet, Zap } from 'lucide-react'
import { structures, systems } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

export default function InfoPanel() {
  const { selectedId, setSelected, setIsolated } = useAnatomyStore()
  const s = structures.find((st) => st.id === selectedId)
  if (!s) return null
  const sys = systems.find(x => x.id === s.system)
  
  return (
    <aside className="w-96 shrink-0 h-full bg-surface/95 backdrop-blur border-l border-line flex flex-col">
      <div className="p-4 border-b border-line">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="font-semibold text-lg">{s.name}</div>
            {s.latinName && <div className="text-sm text-muted italic">{s.latinName}</div>}
          </div>
          <button onClick={() => { setSelected(null); setIsolated(null); }} className="text-muted hover:text-fg transition"><X size={20} /></button>
        </div>
        {sys && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sys.color + '20', color: sys.color }}>{sys.label}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <div className="flex items-center gap-2 text-fg mb-2 font-medium"><BookOpen size={16} />Descripción</div>
          <p className="text-sm text-fg leading-relaxed">{s.description}</p>
        </section>
        {s.function && <section><div className="flex items-center gap-2 text-fg mb-2 font-medium"><Activity size={16} />Función</div><p className="text-sm text-fg leading-relaxed">{s.function}</p></section>}
        {s.action && <section><div className="flex items-center gap-2 text-fg mb-2 font-medium"><Zap size={16} />Acción</div><p className="text-sm text-fg leading-relaxed">{s.action}</p></section>}
        {(s.origin || s.insertion) && <section><div className="text-fg mb-2 font-medium">Inserciones</div><div className="space-y-2 text-sm"><div><span className="text-muted">Origen:</span> <span className="text-fg">{s.origin || 'N/A'}</span></div><div><span className="text-muted">Inserción:</span> <span className="text-fg">{s.insertion || 'N/A'}</span></div></div></section>}
        {s.innervation && <section><div className="flex items-center gap-2 text-fg mb-2 font-medium"><GitBranch size={16} />Inervación</div><p className="text-sm text-fg leading-relaxed">{s.innervation}</p></section>}
        {s.bloodSupply && <section><div className="flex items-center gap-2 text-fg mb-2 font-medium"><Droplet size={16} />Irrigación</div><p className="text-sm text-fg leading-relaxed">{s.bloodSupply}</p></section>}
      </div>
    </aside>
  )
}
