import { useState } from 'react'
import { Search, Brain, Target, BookOpen, Layers, User } from 'lucide-react'
import { structures, systems, regions } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'

interface CardProps { n: string | number; label: string; hint: string; color: string; onClick: () => void }

function Card({ n, label, hint, color, onClick }: CardProps) {
  return (
    <button onClick={onClick} className="group text-left rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-teal-300" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="text-3xl font-semibold tabular-nums leading-none" style={{ color }}>{n}</div>
      <div className="mt-2 text-sm font-medium leading-tight">{label}</div>
      <div className="text-[11px] text-slate-400">{hint}</div>
    </button>
  )
}

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-[11px] uppercase tracking-widest text-slate-400">{title}</h2>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">{children}</div>
  </section>
)

export default function Home({ onRefs }: { onRefs: () => void }) {
  const { gender, setGender, openSystem, openRegion, openStructure, openSkin, openStudy } = useAnatomyStore()
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const found = needle
    ? structures.filter((s) => s.name.toLowerCase().includes(needle) || s.latinName?.toLowerCase().includes(needle) || s.tags?.some((t) => t.toLowerCase().includes(needle)))
    : []
  const count = (id: string) => structures.filter((s) => s.system === id).length

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#0b1026]">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="text-teal-400" size={26} />
            <div>
              <h1 className="text-xl font-semibold leading-none">Anatomía 3D</h1>
              <div className="text-xs text-slate-400">Atlas interactivo · elige qué quieres ver</div>
            </div>
          </div>
          <div className="flex rounded-lg bg-white/5 p-0.5 text-sm" role="group" aria-label="Sexo del modelo">
            {(['male', 'female'] as const).map((g) => <button key={g} aria-pressed={gender === g} onClick={() => setGender(g)} className={`px-3 py-1 rounded-md ${gender === g ? 'bg-teal-500/25 text-teal-200' : 'text-slate-400 hover:text-slate-200'}`}>{g === 'male' ? 'Hombre' : 'Mujer'}</button>)}
          </div>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input aria-label="Buscar estructura" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar una estructura: fémur, hígado, ganglios…" className="w-full rounded-xl bg-white/5 pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-400/60" />
        </div>

        {needle ? (
          <Group title={`Resultados (${found.length})`}>
            {found.map((s) => <Card key={s.id} n={systems.find((x) => x.id === s.system)?.label.replace('Sistema ', '').slice(0, 3) ?? ''} label={s.name} hint={s.latinName ?? ''} color={systems.find((x) => x.id === s.system)?.color ?? '#999'} onClick={() => openStructure(s.id)} />)}
            {found.length === 0 && <div className="text-sm text-slate-500">Sin resultados</div>}
          </Group>
        ) : (
          <>
            <Group title="Sistemas">
              {systems.filter((s) => count(s.id) > 0).map((s) => <Card key={s.id} n={count(s.id)} label={s.label.replace('Sistema ', '')} hint="estructuras" color={s.color} onClick={() => openSystem(s.id, s.label.replace('Sistema ', ''))} />)}
              <Card n="2" label="Cuerpo" hint="hombre y mujer" color="#fca311" onClick={openSkin} />
            </Group>
            <Group title="Regiones">
              {regions.map((r) => <Card key={r.id} n={r.ids.length} label={r.label} hint="estructuras" color={r.color} onClick={() => openRegion(r)} />)}
            </Group>
            <Group title="Estudio">
              <Card n={structures.length} label="Quiz" hint="3 niveles" color="#2dd4bf" onClick={() => openStudy('quiz')} />
              <Card n={structures.length} label="Tarjetas" hint="repaso" color="#2dd4bf" onClick={() => openStudy('cards')} />
              <Card n={5} label="Referencias" hint="atlas premium" color="#94a3b8" onClick={onRefs} />
            </Group>
          </>
        )}
        <footer className="flex items-center gap-3 text-[10px] text-slate-500 pb-4">
          <Layers size={12} /><span>Huesos, músculos, nervios, vasos, linfático y vísceras: Z-Anatomy (CC BY-SA 4.0) · Cuerpo: MakeHuman (CC0)</span>
          <User size={12} className="ml-auto" /><Target size={12} /><BookOpen size={12} />
        </footer>
      </div>
    </div>
  )
}
