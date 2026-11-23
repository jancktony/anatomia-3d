import type { Structure } from '../data/anatomy'

export type Difficulty = 'facil' | 'medio' | 'dificil'
export const CHOICES: Readonly<Record<Difficulty, number>> = { facil: 3, medio: 4, dificil: 6 }

export interface Question {
  readonly target: Structure
  readonly choices: readonly Structure[]
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function makeQuestion(pool: readonly Structure[], difficulty: Difficulty, rng: () => number = Math.random): Question {
  if (pool.length < 2) throw new Error('quiz pool needs at least 2 structures')
  const target = pool[Math.floor(rng() * pool.length)]!
  const distractors = shuffle(pool.filter((s) => s.id !== target.id), rng).slice(0, Math.min(CHOICES[difficulty], pool.length) - 1)
  return { target, choices: shuffle([target, ...distractors], rng) }
}
