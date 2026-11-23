export type ThemeId = 'medianoche' | 'rosa-blanco' | 'todo-rosa' | 'rojo-negro' | 'rojo-blanco' | 'rosa-negro'

export interface Theme {
  readonly id: ThemeId
  readonly label: string
  readonly dark: boolean
  readonly swatch: readonly [string, string]
  /** 3D background / fog colour */
  readonly stage: string
  /** optional ground disc colour (Settings -> Suelo) */
  readonly ground: string
  readonly vars: Readonly<Record<string, string>>
}

const t = (
  id: ThemeId, label: string, dark: boolean,
  v: { app: string; surface: string; card: string; hover: string; fg: string; muted: string; line: string; accent: string; ink: string; ground: string },
): Theme => ({
  id, label, dark, swatch: [v.app, v.accent], stage: v.app, ground: v.ground,
  vars: {
    '--app': v.app, '--surface': v.surface, '--card': v.card, '--card-hover': v.hover, '--fg': v.fg,
    '--muted': v.muted, '--line': v.line, '--accent': v.accent, '--accent-ink': v.ink,
  },
})

export const THEMES: readonly Theme[] = [
  t('medianoche', 'Medianoche', true, { app: '#0b1026', surface: '#0f1428', card: 'rgba(255,255,255,.06)', hover: 'rgba(255,255,255,.12)', fg: '#e6ebf7', muted: '#9aa6c2', line: 'rgba(255,255,255,.1)', accent: '#2dd4bf', ink: '#04201d', ground: '#1b2550' }),
  t('rosa-blanco', 'Rosa y blanco', false, { app: '#fff5f9', surface: '#ffffff', card: '#ffffff', hover: '#ffe3ef', fg: '#3a1230', muted: '#8c5a78', line: '#f3c9dc', accent: '#e8357f', ink: '#ffffff', ground: '#ffd0e3' }),
  t('todo-rosa', 'Todo rosa', true, { app: '#d6317f', surface: '#e5509a', card: 'rgba(255,255,255,.16)', hover: 'rgba(255,255,255,.28)', fg: '#ffffff', muted: '#ffd3e7', line: 'rgba(255,255,255,.35)', accent: '#ffffff', ink: '#d6317f', ground: '#f58bbd' }),
  t('rojo-negro', 'Rojo y negro', true, { app: '#0a0a0a', surface: '#171212', card: 'rgba(255,255,255,.06)', hover: 'rgba(255,255,255,.12)', fg: '#f5eeee', muted: '#b69a9a', line: '#3a1d1d', accent: '#e11d2e', ink: '#ffffff', ground: '#2a1113' }),
  t('rojo-blanco', 'Rojo y blanco', false, { app: '#ffffff', surface: '#fff5f5', card: '#ffffff', hover: '#ffe9ea', fg: '#2a0a0d', muted: '#8a5a5e', line: '#f1c4c8', accent: '#d61f2c', ink: '#ffffff', ground: '#ffd5d8' }),
  t('rosa-negro', 'Rosa y negro', true, { app: '#0d0a0c', surface: '#1a1216', card: 'rgba(255,255,255,.06)', hover: 'rgba(255,255,255,.12)', fg: '#fbeef4', muted: '#c19ab0', line: '#3b1f2d', accent: '#ff4fa3', ink: '#1a0610', ground: '#3a1a2c' }),
]

export const themeOf = (id: ThemeId): Theme => THEMES.find((x) => x.id === id) ?? THEMES[0]!

export function applyTheme(id: ThemeId): void {
  const th = themeOf(id)
  const root = document.documentElement
  for (const [k, v] of Object.entries(th.vars)) root.style.setProperty(k, v)
  root.style.colorScheme = th.dark ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', th.stage)
}
