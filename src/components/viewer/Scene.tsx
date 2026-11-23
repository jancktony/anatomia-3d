import { Suspense, useRef, useEffect, type ComponentRef, type RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows, Html, useProgress } from '@react-three/drei'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { Body, preloadBodies } from './Body'
import { Anatomy } from './Anatomy'
import { useAnatomyStore, type CamPreset } from '../../store/useAnatomyStore'

preloadBodies()

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-teal-400 transition-all" style={{ width: progress + '%' }} />
        </div>
        <div className="text-xs text-slate-300">{progress.toFixed(0)}%</div>
      </div>
    </Html>
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
  return (
    <Canvas camera={{ position: [2.8, 1.6, 3.6], fov: 40 }} frameloop="demand" onCreated={({ gl }) => { gl.localClippingEnabled = true }} dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}>
      <color attach="background" args={['#0b1026']} />
      <fog attach="fog" args={['#0b1026', 9, 18]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 12, 8]} intensity={1.4} />
      <directionalLight position={[-4, 6, -5]} intensity={1.1} color="#9fd2ff" />
      <spotLight position={[0, 6, 4]} angle={0.5} penumbra={1} intensity={60} color="#fff1e6" />
      <hemisphereLight args={['#bfe3ff', '#0b1026', 0.4]} />
      <Suspense fallback={<Loader />}>
        <Body />
        <Anatomy />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 5]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[-6, 2, -2]} scale={[6, 6, 1]} color="#9fd2ff" />
          <Lightformer form="ring" intensity={1} position={[5, 3, -4]} scale={4} color="#ffd9b8" />
        </Environment>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.341, 0]} receiveShadow><circleGeometry args={[2.6, 64]} /><meshStandardMaterial color="#10183a" roughness={0.9} /></mesh>
        <ContactShadows resolution={512} position={[0, -0.335, 0]} opacity={0.5} scale={6} blur={3} far={4} />
      </Suspense>
      <OrbitControls ref={controls} makeDefault minDistance={0.15} maxDistance={7} enableDamping dampingFactor={0.08} />
      <CameraReset controlsRef={controls} />
    </Canvas>
  )
}
