import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { System } from '../data/anatomy'

export type Gender = 'male' | 'female'

interface AnatomyState {
  gender: Gender
  setGender: (g: Gender) => void
  activeSystems: System[]
  toggleSystem: (s: System) => void
  setSystems: (s: System[]) => void
  selectedId: string | null
  setSelected: (id: string | null) => void
  isolatedId: string | null
  setIsolated: (id: string | null) => void
  searchQuery: string
  setSearch: (q: string) => void
  showLabels: boolean
  toggleLabels: () => void
  quizMode: boolean
  setQuizMode: (v: boolean) => void
  cameraReset: number
  resetCamera: () => void
}

export const useAnatomyStore = create<AnatomyState>()(
  persist(
    (set) => ({
      gender: 'male',
      setGender: (gender) => set({ gender }),
      activeSystems: ['piel'],
      toggleSystem: (s) => set((state) => ({
        activeSystems: state.activeSystems.includes(s)
          ? state.activeSystems.filter((x) => x !== s)
          : [...state.activeSystems, s]
      })),
      setSystems: (s) => set({ activeSystems: s }),
      selectedId: null,
      setSelected: (id) => set({ selectedId: id }),
      isolatedId: null,
      setIsolated: (id) => set({ isolatedId: id }),
      searchQuery: '',
      setSearch: (q) => set({ searchQuery: q }),
      showLabels: true,
      toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
      quizMode: false,
      setQuizMode: (v) => set({ quizMode: v }),
      cameraReset: 0,
      resetCamera: () => set((s) => ({ cameraReset: s.cameraReset + 1 })),
    }),
    { name: 'atlas-anatomia-v3', partialize: (s) => ({ gender: s.gender, activeSystems: s.activeSystems, showLabels: s.showLabels }) }
  )
)
