import { Search, Eye, EyeOff, Layers, Brain } from 'lucide-react'
import { systems, structures, type System } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

export default function Sidebar() {
  const { activeSystems, toggleSystem, searchQuery, setSearch, selectedId, setSelected, setIsolated } = useAnatomyStore()
  const filtered = structures.filter((s) => {
    const q = searchQuery.toLowerCase()
    if (q && !s.name.toLowerCase().includes(q) && !s.latinName?.toLowerCase().includes(q) && !s.tags?.some(t => t.toLowerCase().includes(q))) return false
    const inner: readonly System[] = activeSystems.filter((x) => x !== 'piel')
    if (inner.length && !inner.includes(s.system)) return false
    return true
  }).sort((a,b) => a.name.localeCompare(b.name))

  return (
    <aside className="w-80 shrink-0 h-full bg-[#0f1428]/95 backdrop-blur border-r border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="text-teal-400" size={18} />
          <div>
            <div className="font-semibold">Atlas Anatómico 3D</div>
            <div className="text-xs text-slate-400">Interactivo</div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2 text-slate-400" size={16} />
          <input value={searchQuery} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white/5 text-sm outline-none focus:ring-1 focus:ring-teal-400/50" />
        </div>
      </div>

      <div className="p-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2"><Layers size={14} /><span>Sistemas</span></div>
        <div className="flex flex-wrap gap-1">
          {systems.map((sys) => (
            <button key={sys.id} onClick={() => toggleSystem(sys.id)} className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${activeSystems.includes(sys.id) ? 'bg-white/10' : 'bg-white/5 opacity-40'}`} style={{ borderLeft: `2px solid ${sys.color}` }}>
              {activeSystems.includes(sys.id) ? <Eye size={12} /> : <EyeOff size={12} />}
              {sys.label.replace('Sistema ', '').replace('Piel y ', 'Piel')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs text-slate-400 px-2 py-1">Estructuras ({filtered.length})</div>
        {filtered.map((s) => (
          <button key={s.id} onClick={() => { setSelected(s.id); setIsolated(s.id); }} className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/5 transition ${selectedId === s.id ? 'bg-teal-500/10 border-l-2 border-teal-400' : ''}`}>
            <div className="text-sm">{s.name}</div>
            {s.latinName && <div className="text-xs text-slate-500 italic">{s.latinName}</div>}
          </button>
        ))}
      </div>
    </aside>
  )
}
