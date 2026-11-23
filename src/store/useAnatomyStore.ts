import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { structures, type Region, type System } from '../data/anatomy'
import type { ThemeId } from '../lib/themes'

export type Gender = 'male' | 'female'
export type StudyMode = 'off' | 'quiz' | 'cards'
export type GroupBy = 'system' | 'region'
export type View = 'home' | 'viewer'
export type Quality = 'ahorro' | 'normal' | 'alta'
export type CamPreset = 'front' | 'back' | 'side' | 'persp'

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
  view: View
  theme: ThemeId
  setTheme: (t: ThemeId) => void
  showGround: boolean
  setShowGround: (v: boolean) => void
  autoRotate: boolean
  setAutoRotate: (v: boolean) => void
  quality: Quality
  setQuality: (q: Quality) => void
  resetSettings: () => void
  hoverId: string | null
  setHover: (id: string | null) => void
  explode: number
  setExplode: (n: number) => void
  camPreset: { id: CamPreset; n: number }
  setCamPreset: (id: CamPreset) => void
  focusIds: readonly string[] | null
  focusLabel: string | null
  goHome: () => void
  openSystem: (id: System, label: string) => void
  openRegion: (r: Region) => void
  openStructure: (id: string) => void
  openSkin: () => void
  openStudy: (m: Exclude<StudyMode, 'off'>) => void
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
        focusIds: null,
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
      view: 'home',
      theme: 'medianoche',
      setTheme: (theme) => set({ theme }),
      showGround: false,
      setShowGround: (showGround) => set({ showGround }),
      autoRotate: false,
      setAutoRotate: (autoRotate) => set({ autoRotate }),
      quality: 'normal',
      setQuality: (quality) => set({ quality }),
      resetSettings: () => set({ theme: 'medianoche', showGround: false, autoRotate: false, quality: 'normal', gender: 'male' }),
      hoverId: null,
      setHover: (hoverId) => set({ hoverId }),
      explode: 0,
      setExplode: (explode) => set({ explode }),
      camPreset: { id: 'persp', n: 0 },
      setCamPreset: (id) => set((s) => ({ camPreset: { id, n: s.camPreset.n + 1 } })),
      focusIds: null,
      focusLabel: null,
      goHome: () => set({ view: 'home', studyMode: 'off', selectedId: null, isolatedId: null, quizTarget: null, focusIds: null, focusLabel: null, sectionY: null, explode: 0 }),
      openSystem: (id, label) => set({ view: 'viewer', activeSystems: [id], focusIds: null, focusLabel: label, selectedId: null, isolatedId: null, studyMode: 'off' }),
      openRegion: (r) => set({ view: 'viewer', activeSystems: [...new Set(structures.filter((s) => r.ids.includes(s.id)).map((s) => s.system))], focusIds: r.ids, focusLabel: r.label, selectedId: null, isolatedId: null, studyMode: 'off' }),
      openStructure: (id) => set({ view: 'viewer', focusIds: null, focusLabel: null, selectedId: id, isolatedId: id, studyMode: 'off' }),
      openSkin: () => set({ view: 'viewer', activeSystems: ['piel'], focusIds: null, focusLabel: 'Cuerpo', selectedId: null, isolatedId: null, studyMode: 'off' }),
      openStudy: (studyMode) => set({ view: 'viewer', studyMode, focusIds: null, focusLabel: 'Estudio', selectedId: null, isolatedId: null, quizTarget: null }),
      groupBy: 'system',
      setGroupBy: (groupBy) => set({ groupBy }),
      cameraReset: 0,
      resetCamera: () => set((s) => ({ cameraReset: s.cameraReset + 1 })),
    }),
    { name: 'atlas-anatomia-v3', partialize: (s) => ({ gender: s.gender, theme: s.theme, showGround: s.showGround, autoRotate: s.autoRotate, quality: s.quality, groupBy: s.groupBy, activeSystems: s.activeSystems, showLabels: s.showLabels }) }
  )
)
