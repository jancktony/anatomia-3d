import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Ref { name: string; review: string; taken: string }

const REFS: readonly Ref[] = [
  { name: 'Complete Anatomy', review: 'Citado como la opción de pago más completa: capas, cortes y movimiento muscular. Suscripción desde unos 39 USD al año.', taken: 'Capas por sistema y plano de corte axial.' },
  { name: 'Visible Body', review: 'Estudio guiado sistema por sistema, quizzes y cortes en tiempo real; muy usado en facultades.', taken: 'Categorías por sistema, quiz con dificultad y cortes.' },
  { name: 'BioDigital Human', review: 'Funciona en el navegador; su plan gratis solo cubre el contenido base. Fuerte en patología.', taken: 'Experiencia web sin instalar.' },
  { name: 'Human Anatomy Atlas', review: 'Compra única de bajo precio; referencia 3D básica para móvil.', taken: 'Búsqueda rápida y ficha por estructura.' },
  { name: 'Anatomy Learning', review: 'Estudio 3D gratuito organizado por sistemas.', taken: 'Cuadrícula de categorías.' },
]

const SOURCES: readonly (readonly [string, string])[] = [
  ['getbodysmart', 'https://www.getbodysmart.com/best-anatomy-apps/'],
  ['decodemed', 'https://www.decodemed.app/blog/best-apps-to-learn-anatomy'],
  ['promapranker', 'https://promapranker.com/blog/best-anatomy-app'],
  ['educationalappstore', 'https://www.educationalappstore.com/app/category/anatomy-apps'],
  ['voka', 'https://voka.io/top-anatomy-apps-like-teachmeanatomy/'],
]

export default function ReferencesPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Referencias y reseñas" onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-full overflow-y-auto rounded-xl border border-white/10 bg-[#0f1428] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Referencias y reseñas</h2>
          <button autoFocus aria-label="Cerrar" onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={20} /></button>
        </div>
        <p className="text-sm text-slate-400 mb-3">Resumen propio de comparativas de 2026 sobre atlas premium. Son listados de terceros que se contradicen entre sí: no hay una nota única. Precios y planes cambian.</p>
        <div className="grid gap-2">
          {REFS.map((r) => (
            <div key={r.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="font-medium">{r.name}</div>
              <p className="text-sm text-slate-300">{r.review}</p>
              <p className="text-xs text-teal-300 mt-1">Aquí: {r.taken}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">Fuentes: {SOURCES.map(([n, u], i) => <span key={n}>{i > 0 && ' · '}<a className="underline" href={u} target="_blank" rel="noreferrer">{n}</a></span>)}</p>
        <h3 className="font-medium mt-4 mb-1">Créditos de los modelos</h3>
        <ul className="text-xs text-slate-400 list-disc pl-5 space-y-1">
          <li>Huesos, músculos, nervios, vasos, linfático y vísceras: <a className="underline" href="https://www.z-anatomy.com" target="_blank" rel="noreferrer">Z-Anatomy</a> (CC BY-SA 4.0), basado en BodyParts3D.</li>
          <li>Cuerpos hombre y mujer: MakeHuman (CC0).</li>
          <li>Proyecto educativo independiente; no usa modelos ni marcas de los atlas comerciales citados.</li>
        </ul>
      </div>
    </div>
  )
}
