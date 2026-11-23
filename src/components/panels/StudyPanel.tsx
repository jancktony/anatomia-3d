import { useEffect, useMemo, useState } from 'react'
import { X, Check, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { structures, systems, type System } from '../../data/anatomy'
import { useAnatomyStore } from '../../store/useAnatomyStore'
import { makeQuestion, shuffle, type Difficulty, type Question } from '../../lib/quiz'

const LEVELS: readonly { id: Difficulty; label: string; hint: string }[] = [
  { id: 'facil', label: 'Fácil', hint: '3 opciones, estructura aislada y nombre latino' },
  { id: 'medio', label: 'Medio', hint: '4 opciones, estructura aislada' },
  { id: 'dificil', label: 'Difícil', hint: '6 opciones, resaltada dentro de su capa' },
]

export default function StudyPanel() {
  const mode = useAnatomyStore((s) => s.studyMode)
  const setStudyMode = useAnatomyStore((s) => s.setStudyMode)
  const [difficulty, setDifficulty] = useState<Difficulty>('facil')
  // the pool is fixed when the panel opens so quiz-driven layer changes can't reshuffle it
  const pool = useMemo(() => {
    const inner: readonly System[] = useAnatomyStore.getState().activeSystems.filter((x) => x !== 'piel')
    const p = structures.filter((s) => !inner.length || inner.includes(s.system))
    return p.length >= 4 ? p : structures
  }, [])
  const [question, setQuestion] = useState<Question>(() => makeQuestion(pool, 'facil'))
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const deck = useMemo(() => shuffle(pool), [pool])
  const [card, setCard] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const { setIsolated, setQuizTarget, activeSystems, setSystems } = useAnatomyStore.getState()
    const target = mode === 'quiz' ? question.target : mode === 'cards' ? deck[card] : undefined
    if (!target) return
    setQuizTarget(mode === 'quiz' ? target.id : null)
    if (mode === 'quiz' && difficulty === 'dificil') {
      setIsolated(null)
      if (!activeSystems.includes(target.system)) setSystems([...activeSystems, target.system])
    } else setIsolated(target.id)
  }, [mode, question, difficulty, deck, card])

  useEffect(() => () => { useAnatomyStore.getState().setStudyMode('off') }, [])

  const next = (d: Difficulty = difficulty) => { setQuestion(makeQuestion(pool, d)); setPicked(null) }
  const answer = (id: string) => {
    if (picked) return
    setPicked(id)
    setScore((s) => ({ ok: s.ok + (id === question.target.id ? 1 : 0), total: s.total + 1 }))
  }
  const cur = deck[card]!
  const tab = (m: 'quiz' | 'cards', label: string) => (
    <button onClick={() => setStudyMode(m)} aria-pressed={mode === m} className={`flex-1 px-3 py-1.5 rounded-md text-sm transition ${mode === m ? 'bg-accent/25 text-accent' : 'text-muted hover:text-fg'}`}>{label}</button>
  )

  return (
    <section aria-label="Estudio" className="absolute top-16 right-16 w-80 z-10 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-line bg-surface/95 backdrop-blur p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex w-full mr-3 rounded-lg bg-card p-0.5">{tab('quiz', 'Quiz')}{tab('cards', 'Tarjetas')}</div>
        <button aria-label="Cerrar estudio" onClick={() => setStudyMode('off')} className="text-muted hover:text-fg"><X size={18} /></button>
      </div>

      {mode === 'quiz' && (
        <div className="space-y-3">
          <div className="flex gap-1" role="group" aria-label="Dificultad">
            {LEVELS.map((l) => (
              <button key={l.id} title={l.hint} aria-pressed={difficulty === l.id} onClick={() => { setDifficulty(l.id); next(l.id) }} className={`flex-1 px-2 py-1 rounded text-xs ${difficulty === l.id ? 'bg-accent/25 text-accent' : 'bg-card text-muted'}`}>{l.label}</button>
            ))}
          </div>
          <p className="text-xs text-muted">{LEVELS.find((l) => l.id === difficulty)?.hint}</p>
          <div className="text-sm font-medium">¿Qué estructura está resaltada?</div>
          {difficulty === 'facil' && <div className="text-xs italic text-muted">Pista: {question.target.latinName ?? 'sin nombre latino'}</div>}
          <div className="grid gap-1.5">
            {question.choices.map((c) => {
              const right = picked && c.id === question.target.id
              const wrong = picked === c.id && c.id !== question.target.id
              return (
                <button key={c.id} disabled={!!picked} onClick={() => answer(c.id)} className={`flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm border transition ${right ? 'border-emerald-400/60 bg-emerald-500/15' : wrong ? 'border-rose-400/60 bg-rose-500/15' : 'border-line bg-card hover:bg-card-hover'}`}>
                  {c.name}{right ? <Check size={16} /> : wrong ? <XCircle size={16} /> : null}
                </button>
              )
            })}
          </div>
          {picked && (
            <div className="space-y-2" aria-live="polite">
              <p className="text-xs text-fg">{question.target.description}</p>
              <button onClick={() => next()} className="w-full rounded-lg bg-accent/25 text-accent py-1.5 text-sm">Siguiente</button>
            </div>
          )}
          <div className="text-xs text-muted">Aciertos: {score.ok} / {score.total}</div>
        </div>
      )}

      {mode === 'cards' && (
        <div className="space-y-3">
          <div className="text-xs text-muted">Tarjeta {card + 1} de {deck.length}</div>
          <div className="rounded-lg border border-line bg-card p-3 min-h-28">
            <div className="text-xs mb-1" style={{ color: systems.find((s) => s.id === cur.system)?.color }}>{systems.find((s) => s.id === cur.system)?.label}</div>
            {revealed ? (
              <div className="space-y-1">
                <div className="font-semibold">{cur.name}</div>
                {cur.latinName && <div className="text-xs italic text-muted">{cur.latinName}</div>}
                <p className="text-xs text-fg">{cur.description}</p>
                {cur.function && <p className="text-xs text-muted">Función: {cur.function}</p>}
              </div>
            ) : <div className="text-sm text-fg">Observa la estructura resaltada e intenta nombrarla.</div>}
          </div>
          <button onClick={() => setRevealed((r) => !r)} className="w-full rounded-lg bg-card-hover py-1.5 text-sm">{revealed ? 'Ocultar' : 'Mostrar respuesta'}</button>
          <div className="flex gap-2">
            <button aria-label="Anterior" onClick={() => { setCard((c) => (c - 1 + deck.length) % deck.length); setRevealed(false) }} className="flex-1 rounded-lg bg-card py-1.5 grid place-items-center"><ChevronLeft size={16} /></button>
            <button aria-label="Siguiente" onClick={() => { setCard((c) => (c + 1) % deck.length); setRevealed(false) }} className="flex-1 rounded-lg bg-card py-1.5 grid place-items-center"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </section>
  )
}
