import { Suspense, useRef, useEffect, type ComponentRef, type RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows, useProgress } from '@react-three/drei'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { Body, preloadBodies } from './Body'
import { Anatomy } from './Anatomy'
import { useAnatomyStore, type CamPreset, type Quality } from '../../store/useAnatomyStore'
import { themeOf } from '../../lib/themes'

preloadBodies()

const DPR: Readonly<Record<Quality, [number, number]>> = { ahorro: [1, 1], normal: [1, 1.5], alta: [1, 2] }

// DOM overlay instead of drei <Html>: the Html portal inside Suspense threw removeChild errors on unmount
function Progress() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex flex-col items-center gap-1 text-xs text-muted" role="status">
      <div className="h-1 w-32 overflow-hidden rounded-full bg-card-hover"><div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div>
      {progress.toFixed(0)}%
    </div>
  )
}

const PRESETS: Readonly<Record<CamPreset, readonly [number, number, number]>> = {
  front: [0, 0.9, 4.4],
  back: [0, 0.9, -4.4],
  side: [4.4, 0.9, 0],
  persp: [2.8, 1.6, 3.6],
}

function CameraReset({ controlsRef }: { controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null> }) {
  const cameraReset = useAnatomyStore((s) => s.cameraReset)
  const preset = useAnatomyStore((s) => s.camPreset)
  const { camera } = useThree()
  useEffect(() => {
    if (!controlsRef.current) return
    const [x, y, z] = PRESETS[preset.id]
    camera.position.set(x, y, z)
    controlsRef.current.target.set(0, 0.9, 0)
    controlsRef.current.update()
  }, [cameraReset, preset, camera, controlsRef])
  return null
}

export default function Scene() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const theme = themeOf(useAnatomyStore((s) => s.theme))
  const showGround = useAnatomyStore((s) => s.showGround)
  const autoRotate = useAnatomyStore((s) => s.autoRotate)
  const quality = useAnatomyStore((s) => s.quality)
  return (
    <>
      <Canvas camera={{ position: [2.8, 1.6, 3.6], fov: 40 }} frameloop={autoRotate ? 'always' : 'demand'} onCreated={({ gl }) => { gl.localClippingEnabled = true }} dpr={DPR[quality]} gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}>
        <color attach="background" args={[theme.stage]} />
        <fog attach="fog" args={[theme.stage, 9, 18]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 12, 8]} intensity={1.4} />
        <directionalLight position={[-4, 6, -5]} intensity={1.1} color="#9fd2ff" />
        <spotLight position={[0, 6, 4]} angle={0.5} penumbra={1} intensity={60} color="#fff1e6" />
        <hemisphereLight args={['#bfe3ff', theme.stage, 0.4]} />
        <Suspense fallback={null}>
          <Body />
          <Anatomy />
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={2.2} position={[0, 5, 5]} scale={[10, 4, 1]} />
            <Lightformer form="rect" intensity={1.2} position={[-6, 2, -2]} scale={[6, 6, 1]} color="#9fd2ff" />
            <Lightformer form="ring" intensity={1} position={[5, 3, -4]} scale={4} color="#ffd9b8" />
          </Environment>
          {showGround && (
            <>
              <mesh rotation-x={-Math.PI / 2} position={[0, -0.341, 0]}><circleGeometry args={[2.6, 64]} /><meshStandardMaterial color={theme.ground} roughness={0.9} /></mesh>
              <ContactShadows resolution={512} position={[0, -0.335, 0]} opacity={0.5} scale={6} blur={3} far={4} />
            </>
          )}
        </Suspense>
        <OrbitControls ref={controls} makeDefault autoRotate={autoRotate} autoRotateSpeed={1} minDistance={0.15} maxDistance={7} enableDamping dampingFactor={0.08} />
        <CameraReset controlsRef={controls} />
      </Canvas>
      <Progress />
    </>
  )
}
