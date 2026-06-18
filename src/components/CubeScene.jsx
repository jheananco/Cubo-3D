import { Suspense, useRef, useEffect, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Edges, Html } from '@react-three/drei'
import * as THREE from 'three'

/* ══════════════════════════════════════════════════
   Escala: cm → unidades de escena
   ══════════════════════════════════════════════════ */
function toScene(a) { return Math.max(a * 0.2, 0.1) }

const FACE_COLORS = ['#60a5fa', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#a78bfa']
const FACE_NAMES  = ['Frente', 'Atrás', 'Derecha', 'Izquierda', 'Superior', 'Inferior']

/* ══════════════════════════════════════════════════
   Rotaciones FIJAS de cada cara — nunca cambian para
   los modos assembled/exploded (igual que en CSS):

     .frente   { transform: translateZ(100px) }
     .atras    { transform: rotateY(180deg) translateZ(100px) }
     .derecha  { transform: rotateY(90deg)  translateZ(100px) }
     ...

   Los grupos THREE tienen estas rotaciones y NUNCA
   se animan en el modo explosión — solo cambia el Z
   del mesh hijo. Para la red plana sí cambian.
   ══════════════════════════════════════════════════ */
const FACE_ROTATIONS = [
  [0,              0, 0], // 0 Frente    — sin rotación
  [0,    Math.PI,   0], // 1 Atrás     — 180° en Y
  [0, -Math.PI / 2,  0], // 2 Derecha   — -90° en Y
  [0,  Math.PI / 2,  0], // 3 Izquierda — +90° en Y
  [-Math.PI / 2,    0, 0], // 4 Superior  — -90° en X
  [ Math.PI / 2,    0, 0], // 5 Inferior  — +90° en X
]

/* ══════════════════════════════════════════════════
   Datos de animación por modo.

   Arquitectura de jerarquía (espejo del CSS):
     faceGroup(position, rotation)
       └── mesh(position.z = translateZ análogo)

   assembled → groups en origen, rotaciones fijas, z = s/2
   exploded  → groups en origen, rotaciones fijas, z = s*2.8
               (¡SOLO CAMBIA Z! idéntico a CSS translateZ)
   net       → groups reposicionados y girados a plano,
               z = 0 (la cara queda centrada en el grupo)
   ══════════════════════════════════════════════════ */
function targetData(mode, size) {
  if (mode === 'assembled') {
    return FACE_ROTATIONS.map(rot => ({
      groupPos: [0, 0, 0],
      groupRot: rot,
      meshZ: size / 2,
    }))
  }

  if (mode === 'exploded') {
    /* Patrón CSS: misma rotación, solo translateZ aumenta */
    return FACE_ROTATIONS.map(rot => ({
      groupPos: [0, 0, 0],
      groupRot: rot,
      meshZ: size * 2.8,
    }))
  }

  if (mode === 'net') {
    /* Cruz canónica en plano XZ (Y=0)
         [Sup(0,0,-s)]
   [Izq] [Fren] [Der] [Atrás]
         [Inf(0,0,s)]         */
    const flat = [-Math.PI / 2, 0, 0]
    const positions = [
      [0,         0, 0      ], // 0 Frente (ancla)
      [size * 2,  0, 0      ], // 1 Atrás
      [size,      0, 0      ], // 2 Derecha
      [-size,     0, 0      ], // 3 Izquierda
      [0,         0, -size  ], // 4 Superior
      [0,         0,  size  ], // 5 Inferior
    ]
    return positions.map(pos => ({
      groupPos: pos,
      groupRot: flat,
      meshZ: 0, // sin offset: la cara queda centrada en el grupo
    }))
  }

  return targetData('assembled', size)
}

/* ══════════════════════════════════════════════════
   Easing (equivalente a las timing-functions de CSS)
   ══════════════════════════════════════════════════ */
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeOutBack    = t => {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const easeOutCubic   = t => 1 - Math.pow(1 - t, 3)

/* ══════════════════════════════════════════════════
   Delays por cara (análogo a transition-delay en CSS)
   [0=Fren, 1=Atrás, 2=Der, 3=Izq, 4=Sup, 5=Inf]

   Explosión: Frente primero, Atrás al final
   Red plana: Frente como ancla, Atrás al final
   Armado:    Todo regresa casi simultáneamente
   ══════════════════════════════════════════════════ */
const DELAY_EXPLODED  = [0.00, 0.50, 0.10, 0.20, 0.30, 0.40]
const DUR_EXPLODED    = 0.62

const DELAY_NET       = [0.00, 1.15, 0.68, 0.90, 0.23, 0.45]
const DUR_NET         = 0.56

const DELAY_ASSEMBLED = [0.00, 0.00, 0.05, 0.05, 0.10, 0.10]
const DUR_ASSEMBLED   = 0.52

/* ══════════════════════════════════════════════════
   CubeFaces — 6 caras animadas (SIEMPRE MONTADO)

   Jerarquía Three.js que espeja el patrón CSS:
     <group ref={faceGroupRefs[i]}>   ← rotación fija
       <mesh ref={meshRefs[i]}>       ← position.z varía
         <planeGeometry>
         <Html>  ← sigue al mesh automáticamente
       </mesh>
     </group>

   Para EXPLOSIÓN: solo meshZ cambia (groupPos=[0,0,0],
   groupRot fijo). Idéntico a translateZ en CSS.
   Para RED PLANA: groupPos y groupRot cambian, meshZ→0.
   ══════════════════════════════════════════════════ */
function CubeFaces({ size, mode }) {
  const active        = mode !== 'assembled'
  const faceGroupRefs = useRef([])
  const meshRefs      = useRef([])

  const animStart      = useRef(null)
  const startGroupPos  = useRef(Array.from({ length: 6 }, () => new THREE.Vector3()))
  const startGroupQuat = useRef(Array.from({ length: 6 }, () => new THREE.Quaternion()))
  const startMeshZ     = useRef(new Float32Array(6))
  const targetGroupPos = useRef(Array.from({ length: 6 }, () => new THREE.Vector3()))
  const targetGroupQuat= useRef(Array.from({ length: 6 }, () => new THREE.Quaternion()))
  const targetMeshZ    = useRef(new Float32Array(6))

  /* Establece posición inicial ANTES del primer rAF (sin flash en origen) */
  useLayoutEffect(() => {
    const data = targetData('assembled', size)
    faceGroupRefs.current.forEach((ref, i) => {
      if (!ref) return
      ref.position.set(...data[i].groupPos)
      ref.rotation.set(...data[i].groupRot)
    })
    meshRefs.current.forEach((ref, i) => {
      if (!ref) return
      ref.position.set(0, 0, data[i].meshZ)
    })
    data.forEach((d, i) => {
      startGroupPos.current[i].set(...d.groupPos)
      targetGroupPos.current[i].set(...d.groupPos)
      startGroupQuat.current[i].setFromEuler(new THREE.Euler(...d.groupRot))
      targetGroupQuat.current[i].setFromEuler(new THREE.Euler(...d.groupRot))
      startMeshZ.current[i]  = d.meshZ
      targetMeshZ.current[i] = d.meshZ
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Al cambiar modo o arista: captura estado actual → actualiza targets → arranca reloj */
  useEffect(() => {
    faceGroupRefs.current.forEach((ref, i) => {
      if (!ref) return
      startGroupPos.current[i].copy(ref.position)
      startGroupQuat.current[i].copy(ref.quaternion)
    })
    meshRefs.current.forEach((ref, i) => {
      if (!ref) return
      startMeshZ.current[i] = ref.position.z
    })

    const data = targetData(mode, size)
    data.forEach((d, i) => {
      targetGroupPos.current[i].set(...d.groupPos)
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...d.groupRot))
      // Garantiza que slerp tome el camino más corto
      if (startGroupQuat.current[i].dot(q) < 0) q.negate()
      targetGroupQuat.current[i].copy(q)
      targetMeshZ.current[i] = d.meshZ
    })

    animStart.current = performance.now()
  }, [mode, size])

  /* Animación por frame: lerpVectors + slerpQuaternions + lerp de Z */
  useFrame(() => {
    if (!animStart.current) return
    const elapsed = (performance.now() - animStart.current) / 1000

    const delays   = mode === 'exploded' ? DELAY_EXPLODED  :
                     mode === 'net'      ? DELAY_NET       : DELAY_ASSEMBLED
    const duration = mode === 'exploded' ? DUR_EXPLODED    :
                     mode === 'net'      ? DUR_NET         : DUR_ASSEMBLED
    const easeFn   = mode === 'exploded' ? easeOutBack     :
                     mode === 'net'      ? easeInOutCubic  : easeOutCubic

    for (let i = 0; i < 6; i++) {
      const localT = elapsed - delays[i]
      if (localT <= 0) continue

      const progress = Math.min(localT / duration, 1)
      const eased    = easeFn(progress)

      const fg = faceGroupRefs.current[i]
      const m  = meshRefs.current[i]

      if (fg) {
        fg.position.lerpVectors(
          startGroupPos.current[i],
          targetGroupPos.current[i],
          eased,
        )
        fg.quaternion.slerpQuaternions(
          startGroupQuat.current[i],
          targetGroupQuat.current[i],
          eased,
        )
      }

      if (m) {
        m.position.z = startMeshZ.current[i] +
          (targetMeshZ.current[i] - startMeshZ.current[i]) * eased
      }
    }
  })

  return (
    <group visible={active}>
      {FACE_ROTATIONS.map((_, i) => (
        <group key={i} ref={el => { faceGroupRefs.current[i] = el }}>
          {/* El mesh actúa como el `translateZ` de CSS.
              Html es hijo del mesh → lo sigue automáticamente */}
          <mesh ref={el => { meshRefs.current[i] = el }}>
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial
              color={FACE_COLORS[i]}
              side={THREE.DoubleSide}
              roughness={0.22}
              metalness={0.18}
              transparent
              opacity={0.94}
            />
            {active && (
              <Html center distanceFactor={5} style={{ pointerEvents: 'none' }}>
                <div style={{
                  background: 'rgba(6,11,24,0.92)',
                  border: `1px solid ${FACE_COLORS[i]}88`,
                  borderRadius: 5,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: FACE_COLORS[i],
                  whiteSpace: 'nowrap',
                  fontFamily: 'Inter, sans-serif',
                  userSelect: 'none',
                  letterSpacing: '0.03em',
                }}>
                  {FACE_NAMES[i]}
                </div>
              </Html>
            )}
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ══════════════════════════════════════════════════
   AssembledCube — cubo sólido con agua y partes
   ══════════════════════════════════════════════════ */
function AssembledCube({ size, waterLevel, showParts, visible }) {
  const hasWater = waterLevel > 0.001
  return (
    <group visible={visible}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color="#3b82f6"
          roughness={0.15}
          metalness={0.35}
          transparent
          opacity={hasWater ? 0.26 : 0.88}
          side={THREE.FrontSide}
        />
        <Edges scale={1.001} threshold={15} color="#7dd3fc" lineWidth={1.5} />
      </mesh>
      {hasWater && <WaterMesh size={size} level={waterLevel} />}
      {showParts && <PartsLabels size={size} />}
    </group>
  )
}

/* ══════════════════════════════════════════════════
   WaterMesh — agua que sube desde la base
   ══════════════════════════════════════════════════ */
function WaterMesh({ size, level }) {
  const safe   = Math.max(level, 0.001)
  const scaleY = size * safe
  const posY   = -size / 2 + scaleY / 2

  return (
    <group position={[0, posY, 0]}>
      <mesh scale={[size * 0.985, scaleY, size * 0.985]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#0ea5e9"
          emissiveIntensity={0.13}
          transparent
          opacity={0.65}
          roughness={0.05}
          metalness={0.15}
        />
      </mesh>
      {/* Superficie del agua */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, scaleY / 2 + 0.001, 0]}
        scale={[size * 0.985, size * 0.985, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
          roughness={0}
          metalness={0.2}
        />
      </mesh>
    </group>
  )
}

/* ══════════════════════════════════════════════════
   PartsLabels — etiquetas HTML sobre el cubo armado
   ══════════════════════════════════════════════════ */
function PartsLabels({ size }) {
  const s = size
  const labels = [
    { pos: [0,           0,            s * 0.72], text: 'Cara',      color: '#60a5fa', sub: '6 caras iguales' },
    { pos: [s * 0.70,    s * 0.55,    0        ], text: 'Arista',    color: '#34d399', sub: '12 aristas' },
    { pos: [s * 0.62,    s * 0.62,    s * 0.62 ], text: 'Vértice',  color: '#f472b6', sub: '8 vértices' },
    { pos: [0,           -s * 0.74,   0        ], text: 'Base',      color: '#a78bfa', sub: 'Cara inferior' },
    { pos: [s * 0.74,    0,           0        ], text: 'Altura = a',color: '#fb923c', sub: `${(s * 5).toFixed(1)} cm` },
    { pos: [-s * 0.55,   s * 0.55,   -s * 0.55 ], text: 'Diagonal', color: '#fbbf24', sub: 'a√3' },
  ]
  return (
    <>
      {labels.map((l, idx) => (
        <Html key={idx} position={l.pos} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(6,11,24,0.90)',
            border: `1px solid ${l.color}55`,
            borderRadius: 6,
            padding: '4px 10px',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: l.color, fontFamily: 'Inter, sans-serif' }}>
              {l.text}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.8)', fontFamily: 'Inter, sans-serif' }}>
              {l.sub}
            </div>
          </div>
        </Html>
      ))}
    </>
  )
}

/* ══════════════════════════════════════════════════
   CameraController — ajusta la vista al cambiar modo
   ══════════════════════════════════════════════════ */
function CameraController({ cubeMode, size }) {
  const { camera } = useThree()
  const prevMode   = useRef(cubeMode)

  useEffect(() => {
    if (prevMode.current === cubeMode) return
    if (cubeMode === 'net') {
      camera.position.set(size * 0.5, size * 9, size * 4)
      camera.lookAt(size * 0.5, 0, 0)
    } else if (cubeMode === 'assembled') {
      camera.position.set(size * 3, size * 2.5, size * 4)
      camera.lookAt(0, 0, 0)
    } else if (cubeMode === 'exploded') {
      camera.position.set(size * 5, size * 4, size * 6)
      camera.lookAt(0, 0, 0)
    }
    prevMode.current = cubeMode
  }, [cubeMode, size, camera])

  return null
}

/* ══════════════════════════════════════════════════
   Scene — grafo completo de Three.js
   ══════════════════════════════════════════════════ */
function Scene({ arista, showParts, cubeMode, waterLevel }) {
  const size        = toScene(arista)
  const isAssembled = cubeMode === 'assembled'

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-6, -6, -4]} intensity={0.7} color="#818cf8" />
      <pointLight position={[6,  -4,  6]} intensity={0.4} color="#06b6d4" />

      <gridHelper
        args={[24, 24, 'rgba(59,130,246,0.07)', 'rgba(59,130,246,0.03)']}
        position={[0, -size * 0.5 - 0.01, 0]}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={0.5}
        maxDistance={22}
        enableDamping
        dampingFactor={0.07}
      />

      <CameraController cubeMode={cubeMode} size={size} />

      {/* Cubo sólido: visible solo en modo armado */}
      <AssembledCube
        size={size}
        waterLevel={waterLevel}
        showParts={showParts}
        visible={isAssembled}
      />

      {/* Las 6 caras — SIEMPRE en escena.
          visible={false} cuando está armado: animación silenciosa
          de regreso a posición de cubo, lista para próxima explosión. */}
      <CubeFaces size={size} mode={cubeMode} />
    </>
  )
}

/* ══════════════════════════════════════════════════
   CubeScene — Canvas exportado
   ══════════════════════════════════════════════════ */
export default function CubeScene({ arista, showParts, cubeMode, waterLevel }) {
  return (
    <Canvas
      shadows
      camera={{ position: [3, 2.5, 4], fov: 50, near: 0.01, far: 120 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'linear-gradient(135deg, #060b18 0%, #0d1424 100%)' }}
    >
      <Suspense fallback={null}>
        <Scene
          arista={arista}
          showParts={showParts}
          cubeMode={cubeMode}
          waterLevel={waterLevel}
        />
      </Suspense>
    </Canvas>
  )
}
