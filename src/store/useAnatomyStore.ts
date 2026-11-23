import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { System } from '../data/anatomy'

export type Gender = 'male' | 'female'
export type StudyMode = 'off' | 'quiz' | 'cards'
export type GroupBy = 'system' | 'region'

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
  studyMode: StudyMode
  setStudyMode: (m: StudyMode) => void
  quizTarget: string | null
  setQuizTarget: (id: string | null) => void
  sectionY: number | null
  setSectionY: (y: number | null) => void
  groupBy: GroupBy
  setGroupBy: (g: GroupBy) => void
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
      studyMode: 'off',
      setStudyMode: (studyMode) => set({ studyMode, selectedId: null, isolatedId: null, quizTarget: null }),
      quizTarget: null,
      setQuizTarget: (quizTarget) => set({ quizTarget }),
      sectionY: null,
      setSectionY: (sectionY) => set({ sectionY }),
      groupBy: 'system',
      setGroupBy: (groupBy) => set({ groupBy }),
      cameraReset: 0,
      resetCamera: () => set((s) => ({ cameraReset: s.cameraReset + 1 })),
    }),
    { name: 'atlas-anatomia-v3', partialize: (s) => ({ gender: s.gender, groupBy: s.groupBy, activeSystems: s.activeSystems, showLabels: s.showLabels }) }
  )
)
