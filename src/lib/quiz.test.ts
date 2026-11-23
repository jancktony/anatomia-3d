import { describe, expect, it } from 'vitest'
import { regions, structures } from '../data/anatomy'
import { CHOICES, makeQuestion, type Difficulty } from './quiz'
import { availableFor } from './available'
import femaleIds from '../data/female-ids.json'

describe('makeQuestion', () => {
  it.each(Object.keys(CHOICES) as Difficulty[])('%s: includes the target once, no duplicates, right size', (d) => {
    for (let i = 0; i < 50; i++) {
      const q = makeQuestion(structures, d)
      const ids = q.choices.map((c) => c.id)
      expect(ids).toContain(q.target.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids.length).toBe(CHOICES[d])
    }
  })
  it('shrinks the choices when the pool is small', () => {
    expect(makeQuestion(structures.slice(0, 2), 'dificil').choices).toHaveLength(2)
  })
  it('rejects a pool that cannot make a question', () => {
    expect(() => makeQuestion(structures.slice(0, 1), 'facil')).toThrow()
  })
  it('structure ids are unique and every region id exists', () => {
    const ids = new Set(structures.map((s) => s.id))
    expect(ids.size).toBe(structures.length)
    for (const r of regions) for (const id of r.ids) expect(ids.has(id), `${r.id}:${id}`).toBe(true)
  })
  it('female ids exist and female-only structures stay out of the male model', () => {
    const ids = new Set(structures.map((s) => s.id))
    for (const id of femaleIds) expect(ids.has(id), id).toBe(true)
    expect(availableFor('male').some((s) => s.only === 'female')).toBe(false)
    expect(availableFor('female').some((s) => s.id === 'utero')).toBe(true)
    expect(availableFor('female').length).toBe(femaleIds.length)
  })
})
