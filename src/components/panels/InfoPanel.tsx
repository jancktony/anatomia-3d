import { X, BookOpen, Activity, GitBranch, Droplet, Zap } from 'lucide-react'
import { structures, systems } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

export default function InfoPanel() {
  const { selectedId, setSelected, setIsolated } = useAnatomyStore()
  const s = structures.find((st) => st.id === selectedId)
  if (!s) return null
  const sys = systems.find(x => x.id === s.system)
  
  return (
    <aside className="w-96 shrink-0 h-full bg-[#0f1428]/95 backdrop-blur border-l border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="font-semibold text-lg">{s.name}</div>
            {s.latinName && <div className="text-sm text-slate-400 italic">{s.latinName}</div>}
          </div>
          <button onClick={() => { setSelected(null); setIsolated(null); }} className="text-slate-400 hover:text-slate-200 transition"><X size={20} /></button>
        </div>
        {sys && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sys.color + '20', color: sys.color }}>{sys.label}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <div className="flex items-center gap-2 text-slate-300 mb-2 font-medium"><BookOpen size={16} />Descripción</div>
          <p className="text-sm text-slate-300 leading-relaxed">{s.description}</p>
        </section>
        {s.function && <section><div className="flex items-center gap-2 text-slate-300 mb-2 font-medium"><Activity size={16} />Función</div><p className="text-sm text-slate-300 leading-relaxed">{s.function}</p></section>}
        {s.action && <section><div className="flex items-center gap-2 text-slate-300 mb-2 font-medium"><Zap size={16} />Acción</div><p className="text-sm text-slate-300 leading-relaxed">{s.action}</p></section>}
        {(s.origin || s.insertion) && <section><div className="text-slate-300 mb-2 font-medium">Inserciones</div><div className="space-y-2 text-sm"><div><span className="text-slate-400">Origen:</span> <span className="text-slate-300">{s.origin || 'N/A'}</span></div><div><span className="text-slate-400">Inserción:</span> <span className="text-slate-300">{s.insertion || 'N/A'}</span></div></div></section>}
        {s.innervation && <section><div className="flex items-center gap-2 text-slate-300 mb-2 font-medium"><GitBranch size={16} />Inervación</div><p className="text-sm text-slate-300 leading-relaxed">{s.innervation}</p></section>}
        {s.bloodSupply && <section><div className="flex items-center gap-2 text-slate-300 mb-2 font-medium"><Droplet size={16} />Irrigación</div><p className="text-sm text-slate-300 leading-relaxed">{s.bloodSupply}</p></section>}
      </div>
    </aside>
  )
}
