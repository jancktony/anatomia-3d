import { Search, Eye, EyeOff, Brain } from 'lucide-react'
import { systems, structures, regions, type Structure, type System } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

const short = (label: string) => label.replace('Sistema ', '')

export default function Sidebar() {
  const { activeSystems, toggleSystem, searchQuery, setSearch, selectedId, setSelected, setIsolated, groupBy, setGroupBy } = useAnatomyStore()
  const q = searchQuery.toLowerCase()
  const inner: readonly System[] = activeSystems.filter((x) => x !== 'piel')
  const visible = structures.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q) && !s.latinName?.toLowerCase().includes(q) && !s.tags?.some((t) => t.toLowerCase().includes(q))) return false
    return !inner.length || inner.includes(s.system)
  })
  const groups = groupBy === 'system'
    ? systems.map((g) => ({ id: g.id as string, label: short(g.label), color: g.color, match: (s: Structure) => s.system === g.id }))
    : regions.map((g) => ({ id: g.id, label: g.label, color: g.color, match: (s: Structure) => g.ids.includes(s.id) }))
  const sections = groups
    .map((g) => ({ g, items: visible.filter(g.match).sort((a, b) => a.name.localeCompare(b.name)) }))
    .filter((x) => x.items.length)

  return (
    <aside className="w-80 shrink-0 h-full bg-surface/95 backdrop-blur border-r border-line flex flex-col">
      <div className="p-4 border-b border-line">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="text-accent" size={18} />
          <div>
            <div className="font-semibold">Atlas Anatómico 3D</div>
            <div className="text-xs text-muted">Interactivo</div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2 text-muted" size={16} />
          <input aria-label="Buscar estructura" value={searchQuery} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-card text-sm outline-none focus:ring-1 focus:ring-accent/60" />
        </div>
      </div>

      <div className="p-3 border-b border-line grid grid-cols-2 gap-2">
        {systems.map((sys) => {
          const on = activeSystems.includes(sys.id)
          const n = structures.filter((s) => s.system === sys.id).length
          return (
            <button key={sys.id} aria-pressed={on} onClick={() => toggleSystem(sys.id)} className={`rounded-lg p-2 text-left transition border border-line ${on ? 'bg-card-hover' : 'bg-card opacity-50 hover:opacity-80'}`} style={{ borderTop: `3px solid ${sys.color}` }}>
              <div className="flex items-center justify-between text-fg">{on ? <Eye size={14} /> : <EyeOff size={14} />}<span className="text-[10px] text-muted">{n}</span></div>
              <div className="text-xs font-medium mt-1 leading-tight">{short(sys.label)}</div>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {sections.length === 0 && <div className="text-xs text-muted px-1">Sin resultados</div>}
        <div className="flex rounded-lg bg-card p-0.5 text-xs" role="group" aria-label="Agrupar por">
          {(['system', 'region'] as const).map((m) => <button key={m} aria-pressed={groupBy === m} onClick={() => setGroupBy(m)} className={`flex-1 px-2 py-1 rounded-md ${groupBy === m ? 'bg-accent/25 text-accent' : 'text-muted'}`}>{m === 'system' ? 'Por sistema' : 'Por región'}</button>)}
        </div>
        {sections.map(({ g, items }) => (
          <section key={g.id}>
            <div className="flex items-center gap-2 text-xs text-muted mb-1.5"><span className="size-2 rounded-full" style={{ background: g.color }} />{g.label} ({items.length})</div>
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((s) => (
                <button key={s.id} onClick={() => { setSelected(s.id); setIsolated(s.id) }} className={`text-left px-2 py-1.5 rounded-lg bg-card hover:bg-card-hover transition ${selectedId === s.id ? 'ring-1 ring-accent/60 bg-accent/10' : ''}`}>
                  <div className="text-sm leading-tight">{s.name}</div>
                  {s.latinName && <div className="text-[10px] text-muted italic truncate">{s.latinName}</div>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
