import { useEffect } from 'react'
import { X, BookOpen, RotateCcw } from 'lucide-react'
import { THEMES } from '../../lib/themes'
import { useAnatomyStore, type Quality } from '../../store/useAnatomyStore'

const QUALITY: readonly (readonly [Quality, string, string])[] = [
  ['ahorro', 'Ahorro', 'menos batería'],
  ['normal', 'Normal', 'recomendado'],
  ['alta', 'Alta', 'más nítido'],
]

function Switch({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-left hover:bg-card-hover">
      <span><span className="block text-sm">{label}</span><span className="block text-xs text-muted">{hint}</span></span>
      <span className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${on ? 'bg-accent' : 'bg-line'}`}><span className={`block size-4 rounded-full bg-app transition-transform ${on ? 'translate-x-4' : ''}`} /></span>
    </button>
  )
}

const H = ({ children }: { children: React.ReactNode }) => <h3 className="mb-2 text-[11px] uppercase tracking-widest text-muted">{children}</h3>

export default function SettingsPanel({ onClose, onRefs }: { onClose: () => void; onRefs: () => void }) {
  const s = useAnatomyStore()
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label="Configuración" onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-sm space-y-5 overflow-y-auto border-l border-line bg-surface p-5 text-fg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Configuración</h2>
          <button autoFocus aria-label="Cerrar" onClick={onClose} className="text-muted hover:text-fg"><X size={20} /></button>
        </div>

        <section>
          <H>Paleta de colores</H>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button key={t.id} aria-pressed={s.theme === t.id} onClick={() => s.setTheme(t.id)} className="flex items-center gap-2 rounded-lg border border-line bg-card px-2.5 py-2 text-left text-sm hover:bg-card-hover aria-pressed:ring-2 aria-pressed:ring-accent">
                <span className="flex"><i className="size-4 rounded-full border border-black/20" style={{ background: t.swatch[0] }} /><i className="-ml-1.5 size-4 rounded-full border border-black/20" style={{ background: t.swatch[1] }} /></span>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <H>Modelo</H>
          <div className="flex rounded-lg bg-card p-0.5 text-sm" role="group" aria-label="Sexo del modelo">
            {(['male', 'female'] as const).map((g) => <button key={g} aria-pressed={s.gender === g} onClick={() => s.setGender(g)} className="flex-1 rounded-md px-3 py-1.5 text-muted aria-pressed:bg-accent aria-pressed:text-accent-ink">{g === 'male' ? 'Hombre' : 'Mujer'}</button>)}
          </div>
        </section>

        <section className="space-y-2">
          <H>Escenario</H>
          <Switch label="Suelo con sombra" hint="disco bajo el cuerpo; apagado por defecto" on={s.showGround} onChange={s.setShowGround} />
          <Switch label="Giro automático" hint="el cuerpo rota solo; gasta más batería" on={s.autoRotate} onChange={s.setAutoRotate} />
        </section>

        <section>
          <H>Calidad gráfica</H>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY.map(([id, label, hint]) => (
              <button key={id} aria-pressed={s.quality === id} onClick={() => s.setQuality(id)} className="rounded-lg border border-line bg-card px-2 py-2 text-sm hover:bg-card-hover aria-pressed:ring-2 aria-pressed:ring-accent">
                {label}<span className="block text-[10px] text-muted">{hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <H>Información</H>
          <button onClick={() => { onClose(); onRefs() }} className="flex w-full items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm hover:bg-card-hover"><BookOpen size={16} />Referencias, reseñas y créditos</button>
          <button onClick={s.resetSettings} className="flex w-full items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm hover:bg-card-hover"><RotateCcw size={16} />Restablecer configuración</button>
        </section>
      </aside>
    </div>
  )
}
