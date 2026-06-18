import { useState, useEffect, useRef } from 'react'
import HeroSection from './components/HeroSection'
import CubeScene from './components/CubeScene'
import CubeControls from './components/CubeControls'
import FormulaPanel from './components/FormulaPanel'
import TheorySection from './components/TheorySection'
import StepByStep from './components/StepByStep'
import InstructionsSection from './components/InstructionsSection'

export default function App() {
  const [arista, setArista] = useState(5)
  const [showParts, setShowParts] = useState(false)
  const [cubeMode, setCubeMode] = useState('assembled')
  const [waterLevel, setWaterLevel] = useState(0)
  const [isFillingWater, setIsFillingWater] = useState(false)
  const [isDrainingWater, setIsDrainingWater] = useState(false)
  const [isWaterPaused, setIsWaterPaused] = useState(false)
  const intervalRef = useRef(null)

  const volume = Math.pow(arista, 3)
  const areaTotal = 6 * Math.pow(arista, 2)

  const stopWaterAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsFillingWater(false)
    setIsDrainingWater(false)
    setIsWaterPaused(false)
  }

  const startFilling = () => {
    if (cubeMode !== 'assembled') return
    if (waterLevel >= 1) return
    stopWaterAnimation()
    setIsFillingWater(true)
    intervalRef.current = setInterval(() => {
      setWaterLevel(prev => {
        if (prev >= 1) {
          stopWaterAnimation()
          return 1
        }
        return Math.min(prev + 0.005, 1)
      })
    }, 30)
  }

  const startDraining = () => {
    if (waterLevel <= 0) return
    stopWaterAnimation()
    setIsDrainingWater(true)
    intervalRef.current = setInterval(() => {
      setWaterLevel(prev => {
        if (prev <= 0) {
          stopWaterAnimation()
          return 0
        }
        return Math.max(prev - 0.005, 0)
      })
    }, 30)
  }

  const pauseWater = () => {
    if ((!isFillingWater && !isDrainingWater) || isWaterPaused) return
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsWaterPaused(true)
  }

  const resumeWater = () => {
    if (!isWaterPaused) return
    setIsWaterPaused(false)
    if (isFillingWater) {
      intervalRef.current = setInterval(() => {
        setWaterLevel(prev => {
          if (prev >= 1) { stopWaterAnimation(); return 1 }
          return Math.min(prev + 0.005, 1)
        })
      }, 30)
    } else if (isDrainingWater) {
      intervalRef.current = setInterval(() => {
        setWaterLevel(prev => {
          if (prev <= 0) { stopWaterAnimation(); return 0 }
          return Math.max(prev - 0.005, 0)
        })
      }, 30)
    }
  }

  const handleSetCubeMode = (mode) => {
    if (mode !== 'assembled' && (waterLevel > 0 || isFillingWater)) {
      stopWaterAnimation()
      setWaterLevel(0)
    }
    setCubeMode(mode)
  }

  const resetSimulation = () => {
    stopWaterAnimation()
    setArista(5)
    setShowParts(false)
    setCubeMode('assembled')
    setWaterLevel(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (waterLevel >= 1) stopWaterAnimation()
    if (waterLevel <= 0 && isDrainingWater) stopWaterAnimation()
  }, [waterLevel])

  return (
    <div className="app">
      <HeroSection />

      <div className="simulation-area">
        <div className="simulation-grid">
          <div className="canvas-panel">
            <span className="canvas-label">Laboratorio 3D</span>
            <CubeScene
              arista={arista}
              showParts={showParts}
              cubeMode={cubeMode}
              waterLevel={waterLevel}
            />
            <span className="canvas-hint">
              🖱 Arrastra para rotar · Rueda para zoom
            </span>
            {waterLevel > 0 && (
              <div className="water-progress-bar">
                <div
                  className="water-progress-fill"
                  style={{ width: `${waterLevel * 100}%` }}
                />
              </div>
            )}
          </div>

          <div className="side-panel">
            <CubeControls
              arista={arista}
              setArista={setArista}
              showParts={showParts}
              setShowParts={setShowParts}
              cubeMode={cubeMode}
              setCubeMode={handleSetCubeMode}
              waterLevel={waterLevel}
              isFillingWater={isFillingWater}
              isDrainingWater={isDrainingWater}
              isWaterPaused={isWaterPaused}
              onFill={startFilling}
              onDrain={startDraining}
              onPause={pauseWater}
              onResume={resumeWater}
              onReset={resetSimulation}
            />
            <FormulaPanel
              arista={arista}
              volume={volume}
              areaTotal={areaTotal}
              waterLevel={waterLevel}
            />
          </div>
        </div>
      </div>

      <div className="theory-divider" />
      <TheorySection arista={arista} volume={volume} areaTotal={areaTotal} />

      <div className="steps-bg">
        <StepByStep arista={arista} volume={volume} />
      </div>

      <InstructionsSection />

      <footer className="footer">
        <p>Laboratorio Virtual · Geometría 3D · Volumen del Cubo</p>
        <p style={{ marginTop: 6, opacity: 0.6 }}>
          Herramienta educativa interactiva para estudiantes de secundaria
        </p>
      </footer>
    </div>
  )
}
