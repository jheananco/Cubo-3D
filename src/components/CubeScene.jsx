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
   Rotaciones FIJAS por cara (patrón CSS):
     .frente   { transform: translateZ(s/2) }
     .atras    { transform: rotateY(180deg) translateZ(s/2) }
     ...
   Los grupos THREE tienen estas rotaciones; la explosión
   solo anima el Z del mesh hijo (igual que CSS translateZ).
   ══════════════════════════════════════════════════ */
const FACE_ROTATIONS = [
  [0,              0, 0], // 0 Frente
  [0,    Math.PI,   0], // 1 Atrás
  [0, -Math.PI / 2,  0], // 2 Derecha
  [0,  Math.PI / 2,  0], // 3 Izquierda
  [-Math.PI / 2,    0, 0], // 4 Superior
  [ Math.PI / 2,    0, 0], // 5 Inferior
]

/* ══════════════════════════════════════════════════
   targetData — posición del grupo y translateZ del mesh

   ASSEMBLED / EXPLODED:
     groupPos = [0,0,0]   (grupo siempre en el origen)
     groupRot = FACE_ROTATIONS[i]   (nunca cambia)
     meshZ    = s/2 ó s*2.8   (solo esto cambia — idéntico a CSS)

   NET (desarme tipo "caja que se abre"):
     La cara INFERIOR es el ancla central en y = -s/2.
     Las otras 4 caras laterales se giran 90° alrededor
     de la arista que comparten con la Inferior.
     El resultado visual coincide con la imagen:

           [Sup(0,-s/2,-s)]
     [Izq] [Inf(0,-s/2, 0)] [Der] [Atr(2s)]
           [Fre(0,-s/2, s)]

     Todas las caras quedan planas a y = -s/2.
   ══════════════════════════════════════════════════ */
function targetData(mode, size) {
  const s = size

  if (mode === 'assembled') {
    return FACE_ROTATIONS.map(rot => ({
      groupPos: [0, 0, 0],
      groupRot: rot,
      meshZ: s / 2,
    }))
  }

  if (mode === 'exploded') {
    /* CSS: misma rotación, solo translateZ aumenta → caras vuelan en dirección de su normal */
    return FACE_ROTATIONS.map(rot => ({
      groupPos: [0, 0, 0],
      groupRot: rot,
      meshZ: s * 2.8,
    }))
  }

  if (mode === 'net') {
    /* Caja abriéndose: Inferior como ancla, caras giradas 90° sobre sus aristas.
       Todas en Y = -s/2 (nivel del suelo del cubo). */
    const flat = [-Math.PI / 2, 0, 0]
    const y    = -s / 2
    return [
      { groupPos: [0,      y,  s   ], groupRot: flat, meshZ: 0 }, // 0 Frente → delante de Inf
      { groupPos: [2 * s,  y,  0   ], groupRot: flat, meshZ: 0 }, // 1 Atrás  → derecha de Der
      { groupPos: [s,      y,  0   ], groupRot: flat, meshZ: 0 }, // 2 Derecha → derecha de Inf
      { groupPos: [-s,     y,  0   ], groupRot: flat, meshZ: 0 }, // 3 Izquierda → izq de Inf
      { groupPos: [0,      y, -s   ], groupRot: flat, meshZ: 0 }, // 4 Superior → arriba de Inf
      { groupPos: [0,      y,  0   ], groupRot: flat, meshZ: 0 }, // 5 Inferior → ANCLA
    ]
  }

  return targetData('assembled', size)
}

/* ══════════════════════════════════════════════════
   Hinge math para el modo NET.
   Cada cara lateral gira 90° alrededor de la arista
   que comparte con la Inferior (igual que una caja
   que se abre). Esto produce trayectoria en arco,
   no en línea recta — coincide con la imagen.

   Hinge pos: borde de la Inferior en la dirección
              donde va cada cara.
   Hinge axis: dirección del borde (X o Z).
   Angle: PI/2 (caen hacia afuera).
   ══════════════════════════════════════════════════ */
function getHinge(idx, size) {
  const s  = size
  const y  = -s / 2
  switch (idx) {
    case 0: return { pos: new THREE.Vector3(0,  y,  s/2), axis: new THREE.Vector3(1, 0, 0), angle:  Math.PI/2 } // Frente
    case 1: return null // Atrás — posición directa (segundo nivel)
    case 2: return { pos: new THREE.Vector3( s/2, y, 0), axis: new THREE.Vector3(0, 0, 1), angle: -Math.PI/2 } // Derecha
    case 3: return { pos: new THREE.Vector3(-s/2, y, 0), axis: new THREE.Vector3(0, 0, 1), angle:  Math.PI/2 } // Izquierda
    case 4: return { pos: new THREE.Vector3(0,  y, -s/2), axis: new THREE.Vector3(1, 0, 0), angle: -Math.PI/2 } // Superior
    case 5: return null // Inferior — ancla, no se mueve
    default: return null
  }
}

/* ══════════════════════════════════════════════════
   Easing
   ══════════════════════════════════════════════════ */
const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2
const easeOutBack    = t => { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2) }
const easeOutCubic   = t => 1 - Math.pow(1-t, 3)

/* ══════════════════════════════════════════════════
   Delays y duraciones por modo.
   [0=Fren, 1=Atrás, 2=Der, 3=Izq, 4=Sup, 5=Inf]

   EXPLOSIÓN: Frente primero, Atrás al final.
   NET (caja abriéndose):
     0) Inferior queda fija (delay 0)
     1) Frente y Superior caen (delay 0.10)
     2) Derecha e Izquierda caen (delay 0.30)
     3) Atrás se desliza al final (delay 0.55)
   ARMADO: regreso rápido simultáneo.
   ══════════════════════════════════════════════════ */
const DELAY_EXPLODED  = [0.00, 0.50, 0.10, 0.20, 0.30, 0.40]
const DUR_EXPLODED    = 0.62

const DELAY_NET       = [0.10, 0.55, 0.30, 0.30, 0.10, 0.00]
const DUR_NET         = 0.58

const DELAY_ASSEMBLED = [0.00, 0.00, 0.05, 0.05, 0.10, 0.10]
const DUR_ASSEMBLED   = 0.52

/* ══════════════════════════════════════════════════
   CubeFaces — 6 caras animadas (SIEMPRE MONTADO)

   Jerarquía:
     <group ref={faceGroupRefs[i]}>   ← pos + rot animados
       <mesh ref={meshRefs[i]}>        ← position.z = translateZ CSS
         <Html>                         ← sigue al mesh automáticamente

   EXPLOSIÓN: solo meshZ cambia (grupos en origen, rot fija).
   NET: grupos se reposicionan con trayectoria en arco
        (hinge math) + meshZ → 0.
   ARMADO: todo regresa rápidamente.
   ══════════════════════════════════════════════════ */
function CubeFaces({ size, mode }) {
  const active        = mode !== 'assembled'
  const faceGroupRefs = useRef([])
  const meshRefs      = useRef([])

  const animStart      = useRef(null)
  const startGroupPos  = useRef(Array.from({length:6}, () => new THREE.Vector3()))
  const startGroupQuat = useRef(Array.from({length:6}, () => new THREE.Quaternion()))
  const startMeshZ     = useRef(new Float32Array(6))
  const targetGroupPos = useRef(Array.from({length:6}, () => new THREE.Vector3()))
  const targetGroupQuat= useRef(Array.from({length:6}, () => new THREE.Quaternion()))
  const targetMeshZ    = useRef(new Float32Array(6))

  /* Posición correcta antes del primer rAF → sin flash en origen */
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

  /* Al cambiar modo o arista */
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
      if (startGroupQuat.current[i].dot(q) < 0) q.negate()
      targetGroupQuat.current[i].copy(q)
      targetMeshZ.current[i] = d.meshZ
    })
    animStart.current = performance.now()
  }, [mode, size])

  /* Animación por frame */
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
      if (!fg || !m) continue

      /* ── Modo NET: trayectoria en arco sobre la arista (hinge) ── */
      if (mode === 'net') {
        const hinge = getHinge(i, size)
        if (hinge) {
          /* Calcula posición en arco: la cara gira alrededor de la arista
             de la Inferior como una tapa de caja abriéndose. */
          const angle = hinge.angle * eased
          const q     = new THREE.Quaternion().setFromAxisAngle(hinge.axis, angle)

          /* Posición inicial de la cara en el espacio del hinge */
          const relStart = startGroupPos.current[i].clone().sub(hinge.pos)
          relStart.applyQuaternion(q)
          fg.position.copy(hinge.pos).add(relStart)

          /* Rotación: assembled rot + rotación del hinge */
          fg.quaternion.copy(q).multiply(startGroupQuat.current[i])
        } else {
          /* Inferior (ancla) y Atrás: posición directa (lerp normal) */
          fg.position.lerpVectors(startGroupPos.current[i], targetGroupPos.current[i], eased)
          fg.quaternion.slerpQuaternions(startGroupQuat.current[i], targetGroupQuat.current[i], eased)
        }
        /* meshZ → 0 durante el desplegado */
        m.position.z = startMeshZ.current[i] * (1 - eased)
      } else {
        /* ── EXPLOSIÓN / ARMADO: CSS mirror (solo Z cambia) ── */
        fg.position.lerpVectors(startGroupPos.current[i], targetGroupPos.current[i], eased)
        fg.quaternion.slerpQuaternions(startGroupQuat.current[i], targetGroupQuat.current[i], eased)
        m.position.z = startMeshZ.current[i] + (targetMeshZ.current[i] - startMeshZ.current[i]) * eased
      }
    }
  })

  return (
    <group visible={active}>
      {FACE_ROTATIONS.map((_, i) => (
        <group key={i} ref={el => { faceGroupRefs.current[i] = el }}>
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
   AssembledCube
   ══════════════════════════════════════════════════ */
function AssembledCube({ size, waterLevel, activeParts, visible }) {
  const hasWater     = waterLevel > 0.001
  const anyPartActive = activeParts && Object.values(activeParts).some(Boolean)
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
      {anyPartActive && <PartsLabels size={size} activeParts={activeParts} />}
    </group>
  )
}

/* ══════════════════════════════════════════════════
   WaterMesh
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
          color="#1d4ed8" emissive="#0ea5e9" emissiveIntensity={0.13}
          transparent opacity={0.65} roughness={0.05} metalness={0.15}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, scaleY / 2 + 0.001, 0]}
        scale={[size * 0.985, size * 0.985, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.3}
          transparent opacity={0.6} roughness={0} metalness={0.2}
        />
      </mesh>
    </group>
  )
}

/* ══════════════════════════════════════════════════
   PartsLabels
   ══════════════════════════════════════════════════ */
function PartsLabels({ size, activeParts }) {
  const s = size
  const ALL_LABELS = [
    { key: 'cara',     pos: [0,       0,       s*0.72], text: 'Cara',       color: '#60a5fa', sub: '6 caras iguales'  },
    { key: 'arista',   pos: [s*0.70,  s*0.55,  0     ], text: 'Arista',     color: '#34d399', sub: '12 aristas'       },
    { key: 'vertice',  pos: [s*0.62,  s*0.62,  s*0.62], text: 'Vértice',   color: '#f472b6', sub: '8 vértices'       },
    { key: 'base',     pos: [0,      -s*0.74,  0     ], text: 'Base',       color: '#a78bfa', sub: 'Cara inferior'    },
    { key: 'altura',   pos: [s*0.74,  0,       0     ], text: 'Altura = a', color: '#fb923c', sub: `${(s*5).toFixed(1)} cm` },
    { key: 'diagonal', pos: [-s*0.55, s*0.55, -s*0.55], text: 'Diagonal',  color: '#fbbf24', sub: 'a√3'             },
  ]
  const visible = ALL_LABELS.filter(l => activeParts[l.key])
  return (
    <>
      {visible.map(l => (
        <Html key={l.key} position={l.pos} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(6,11,24,0.92)',
            border: `1.5px solid ${l.color}77`,
            borderRadius: 6,
            padding: '4px 11px',
            textAlign: 'center',
            backdropFilter: 'blur(6px)',
            whiteSpace: 'nowrap',
            boxShadow: `0 2px 12px ${l.color}22`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: l.color, fontFamily: 'Inter, sans-serif' }}>{l.text}</div>
            <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.85)', fontFamily: 'Inter, sans-serif' }}>{l.sub}</div>
          </div>
        </Html>
      ))}
    </>
  )
}

/* ══════════════════════════════════════════════════
   CameraController
   ══════════════════════════════════════════════════ */
function CameraController({ cubeMode, size }) {
  const { camera } = useThree()
  const prevMode   = useRef(cubeMode)

  useEffect(() => {
    if (prevMode.current === cubeMode) return
    if (cubeMode === 'net') {
      /* Vista desde arriba y al frente para ver la cruz completa.
         La cruz se extiende de x=-s a x=2s, z=-s a z=s, centrada en (0.5s, -s/2, 0) */
      camera.position.set(size * 0.5, size * 9, size * 4)
      camera.lookAt(size * 0.5, -size / 2, 0)
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
   Scene
   ══════════════════════════════════════════════════ */
function Scene({ arista, activeParts, cubeMode, waterLevel }) {
  const size        = toScene(arista)
  const isAssembled = cubeMode === 'assembled'

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 12, 6]} intensity={1.8} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-6, -6, -4]} intensity={0.7} color="#818cf8" />
      <pointLight position={[6,  -4,  6]} intensity={0.4} color="#06b6d4" />

      <gridHelper
        args={[28, 28, 'rgba(59,130,246,0.07)', 'rgba(59,130,246,0.03)']}
        position={[0, -size * 0.5 - 0.01, 0]}
      />

      <OrbitControls makeDefault enablePan={false} minDistance={0.5} maxDistance={28}
        enableDamping dampingFactor={0.07} />

      <CameraController cubeMode={cubeMode} size={size} />

      <AssembledCube size={size} waterLevel={waterLevel} activeParts={activeParts} visible={isAssembled} />

      {/* SIEMPRE montado: oculto en modo armado, visible en exploded/net */}
      <CubeFaces size={size} mode={cubeMode} />
    </>
  )
}

/* ══════════════════════════════════════════════════
   CubeScene — Canvas exportado
   ══════════════════════════════════════════════════ */
export default function CubeScene({ arista, activeParts, cubeMode, waterLevel }) {
  return (
    <Canvas
      shadows
      camera={{ position: [3, 2.5, 4], fov: 50, near: 0.01, far: 140 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'linear-gradient(135deg, #060b18 0%, #0d1424 100%)' }}
    >
      <Suspense fallback={null}>
        <Scene arista={arista} activeParts={activeParts} cubeMode={cubeMode} waterLevel={waterLevel} />
      </Suspense>
    </Canvas>
  )
}
