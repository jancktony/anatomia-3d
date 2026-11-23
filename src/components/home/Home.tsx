import { useEffect, useState } from 'react'
import { Search, Brain, Settings } from 'lucide-react'
import { systems, regions, type System } from '../../data/anatomy'
import { availableFor } from '../../lib/available'
import { prefetchSystem } from '../../lib/models'
import { useAnatomyStore } from '../../store/useAnatomyStore'

interface CardProps { n: string | number; label: string; hint: string; color: string; onClick: () => void; sys?: System }

function Card({ n, label, hint, color, onClick, sys }: CardProps) {
  return (
    <button onClick={onClick} onPointerEnter={() => sys && prefetchSystem(sys)} onFocus={() => sys && prefetchSystem(sys)} className="group text-left rounded-xl border border-line bg-card p-3 transition hover:bg-card-hover hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-accent" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="text-3xl font-semibold tabular-nums leading-none text-accent">{n}</div>
      <div className="mt-2 text-sm font-medium leading-tight">{label}</div>
      <div className="text-[11px] text-muted">{hint}</div>
    </button>
  )
}

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-[11px] uppercase tracking-widest text-muted">{title}</h2>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">{children}</div>
  </section>
)

export default function Home({ onSettings }: { onSettings: () => void }) {
  const { gender, setGender, openSystem, openRegion, openStructure, openSkin, openStudy } = useAnatomyStore()
  // warm the viewer chunk while the user reads the home
  useEffect(() => { const id = window.setTimeout(() => { void import('../viewer/Scene') }, 1200); return () => window.clearTimeout(id) }, [])
  const [q, setQ] = useState('')
  const pool = availableFor(gender)
  const needle = q.trim().toLowerCase()
  const found = needle
    ? pool.filter((s) => s.name.toLowerCase().includes(needle) || s.latinName?.toLowerCase().includes(needle) || s.tags?.some((t) => t.toLowerCase().includes(needle)))
    : []
  const count = (id: string) => pool.filter((s) => s.system === id).length

  return (
    <div className="h-screen w-screen overflow-y-auto bg-app">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="text-accent" size={26} />
            <div>
              <h1 className="text-xl font-semibold leading-none">Anatomía 3D</h1>
              <div className="text-xs text-muted">Atlas interactivo · elige qué quieres ver</div>
            </div>
          </div>
          <div className="flex items-center gap-2"><div className="flex rounded-lg bg-card p-0.5 text-sm" role="group" aria-label="Sexo del modelo">
            {(['male', 'female'] as const).map((g) => <button key={g} aria-pressed={gender === g} onClick={() => setGender(g)} className={`px-3 py-1 rounded-md ${gender === g ? 'bg-accent/25 text-accent' : 'text-muted hover:text-fg'}`}>{g === 'male' ? 'Hombre' : 'Mujer'}</button>)}
          </div>
          <button aria-label="Configuración" title="Configuración" onClick={onSettings} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-card-hover hover:text-fg"><Settings size={18} /></button></div>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-muted" size={16} />
          <input aria-label="Buscar estructura" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar una estructura: fémur, hígado, ganglios…" className="w-full rounded-xl bg-card pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent/60" />
        </div>

        {needle ? (
          <Group title={`Resultados (${found.length})`}>
            {found.map((s) => <Card key={s.id} n={systems.find((x) => x.id === s.system)?.label.replace('Sistema ', '').slice(0, 3) ?? ''} label={s.name} hint={s.latinName ?? ''} color={systems.find((x) => x.id === s.system)?.color ?? '#999'} onClick={() => openStructure(s.id)} />)}
            {found.length === 0 && <div className="text-sm text-muted">Sin resultados</div>}
          </Group>
        ) : (
          <>
            <Group title="Sistemas">
              {systems.filter((s) => count(s.id) > 0).map((s) => <Card key={s.id} n={count(s.id)} label={s.label.replace('Sistema ', '')} hint="estructuras" color={s.color} onClick={() => openSystem(s.id, s.label.replace('Sistema ', ''))} sys={s.id} />)}
              <Card n="2" label="Cuerpo" hint="hombre y mujer" color="#fca311" onClick={openSkin} />
            </Group>
            <Group title="Regiones">
              {regions.map((r) => ({ r, ids: r.ids.filter((id) => pool.some((x) => x.id === id)) })).filter((x) => x.ids.length > 0).map(({ r, ids }) => <Card key={r.id} n={ids.length} label={r.label} hint="estructuras" color={r.color} onClick={() => openRegion({ ...r, ids })} />)}
            </Group>
            <Group title="Estudio">
              <Card n={pool.length} label="Quiz" hint="3 niveles" color="#2dd4bf" onClick={() => openStudy('quiz')} />
              <Card n={pool.length} label="Tarjetas" hint="repaso" color="#2dd4bf" onClick={() => openStudy('cards')} />
              <Card n="⚙" label="Configuración" hint="colores y más" color="#94a3b8" onClick={onSettings} />
            </Group>
          </>
        )}
        <footer className="flex items-center gap-3 text-[10px] text-muted pb-4">
          <span>Capas: Z-Anatomy (CC BY-SA 4.0) y, en la mujer, Human Reference Atlas (CC BY 4.0) · Cuerpo: MakeHuman (CC0)</span>

        </footer>
      </div>
    </div>
  )
}
