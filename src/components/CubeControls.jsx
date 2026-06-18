const PARTS = [
  { key: 'cara',     label: 'Cara',     color: '#60a5fa', sub: '6 cuadradas' },
  { key: 'arista',   label: 'Arista',   color: '#34d399', sub: '12 iguales'  },
  { key: 'vertice',  label: 'Vértice',  color: '#f472b6', sub: '8 puntos'    },
  { key: 'base',     label: 'Base',     color: '#a78bfa', sub: 'Cara inf.'   },
  { key: 'altura',   label: 'Altura',   color: '#fb923c', sub: 'Igual a a'   },
  { key: 'diagonal', label: 'Diagonal', color: '#fbbf24', sub: 'Mide a√3'   },
]

export default function CubeControls({
  arista, setArista,
  activeParts, togglePart,
  cubeMode, setCubeMode,
  waterLevel, isFillingWater, isDrainingWater, isWaterPaused,
  onFill, onDrain, onPause, onResume, onReset,
}) {
  const cubeBlocked   = cubeMode !== 'assembled'
  const anyPartActive = Object.values(activeParts).some(Boolean)

  const modeLabel = {
    assembled: { text: 'Ensamblado',   cls: 'assembled' },
    exploded:  { text: 'Desarmado 3D', cls: 'exploded'  },
    net:       { text: 'Red plana',    cls: 'net'        },
  }[cubeMode]

  const showAll = () => PARTS.forEach(p => { if (!activeParts[p.key]) togglePart(p.key) })
  const hideAll = () => PARTS.forEach(p => { if ( activeParts[p.key]) togglePart(p.key) })

  return (
    <div className="card">
      <div className="card-title">Controles del simulador</div>

      {/* Estado */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estado:</span>
        <span className={`state-badge ${modeLabel.cls}`}>{modeLabel.text}</span>
      </div>

      {/* Slider arista */}
      <div className="slider-section" style={{ marginBottom: 20 }}>
        <div className="slider-header">
          <span className="slider-label">Arista del cubo</span>
          <span className="slider-value">{arista}<span className="slider-unit">cm</span></span>
        </div>
        <div className="slider-track">
          <input
            type="range" min="1" max="20" step="0.5" value={arista}
            onChange={e => setArista(Number(e.target.value))}
            aria-label="Arista del cubo en centímetros"
            style={{
              background: `linear-gradient(to right,var(--accent-blue) 0%,var(--accent-blue) ${((arista-1)/19)*100}%,rgba(255,255,255,0.08) ${((arista-1)/19)*100}%,rgba(255,255,255,0.08) 100%)`
            }}
          />
        </div>
        <div className="slider-marks">
          <span>1 cm</span><span>5</span><span>10</span><span>15</span><span>20 cm</span>
        </div>
      </div>

      <div className="controls-groups">

        {/* ── Partes individuales ── */}
        <div>
          <div className="control-group-label">🔍 Identificar partes</div>

          {cubeBlocked && (
            <div className="water-info" style={{ marginBottom: 8 }}>
              <span>⚠️</span>
              <span>Arma el cubo primero para ver las partes.</span>
            </div>
          )}

          {/* Grid de toggles — uno por parte */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            opacity: cubeBlocked ? 0.4 : 1,
            pointerEvents: cubeBlocked ? 'none' : 'auto',
          }}>
            {PARTS.map(p => {
              const on = activeParts[p.key]
              return (
                <button
                  key={p.key}
                  onClick={() => togglePart(p.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1.5px solid ${on ? p.color : 'rgba(255,255,255,0.10)'}`,
                    background: on ? `${p.color}1a` : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'border-color 0.18s, background 0.18s',
                    textAlign: 'left',
                  }}
                >
                  {/* Punto indicador */}
                  <span style={{
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: on ? p.color : 'rgba(255,255,255,0.15)',
                    boxShadow: on ? `0 0 7px ${p.color}99` : 'none',
                    transition: 'background 0.18s, box-shadow 0.18s',
                  }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: on ? p.color : 'var(--text-secondary)',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.18s',
                    }}>{p.label}</div>
                    <div style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontFamily: 'Inter, sans-serif',
                    }}>{p.sub}</div>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mostrar todo / Ocultar todo */}
          {!cubeBlocked && (
            <div className="control-buttons" style={{ marginTop: 8 }}>
              <button
                className="btn btn-blue"
                onClick={showAll}
                disabled={PARTS.every(p => activeParts[p.key])}
              >
                <span className="btn-icon">👁</span> Mostrar todo
              </button>
              <button
                className="btn"
                onClick={hideAll}
                disabled={!anyPartActive}
              >
                <span className="btn-icon">✖</span> Ocultar todo
              </button>
            </div>
          )}
        </div>

        {/* ── Animaciones ── */}
        <div>
          <div className="control-group-label">🎬 Animaciones</div>
          <div className="control-buttons">
            <button
              className={`btn btn-green ${cubeMode === 'assembled' ? 'active' : ''}`}
              onClick={() => setCubeMode('assembled')}
            >
              <span className="btn-icon">🧊</span> Armar cubo
            </button>
            <button
              className={`btn btn-yellow ${cubeMode === 'exploded' ? 'active' : ''}`}
              onClick={() => setCubeMode('exploded')}
            >
              <span className="btn-icon">💥</span> Desarmar 3D
            </button>
          </div>
          <div className="control-buttons" style={{ marginTop: 8 }}>
            <button
              className={`btn btn-purple ${cubeMode === 'net' ? 'active' : ''}`}
              onClick={() => setCubeMode('net')}
              style={{ gridColumn: '1 / -1' }}
            >
              <span className="btn-icon">📐</span> Ver red plana del cubo
            </button>
          </div>
          {cubeMode === 'net' && (
            <div className="water-info" style={{ marginTop: 8 }}>
              <span>📐</span>
              <span>Observa cómo se forman las 6 caras. Rota la vista con el mouse.</span>
            </div>
          )}
        </div>

        {/* ── Agua ── */}
        <div>
          <div className="control-group-label">💧 Simulación de llenado</div>

          {cubeBlocked && (
            <div className="water-info" style={{ marginBottom: 8 }}>
              <span>⚠️</span>
              <span>Primero arma el cubo para simular el llenado.</span>
            </div>
          )}

          <div className="control-buttons">
            <button
              className={`btn btn-cyan ${isFillingWater && !isWaterPaused ? 'active' : ''}`}
              onClick={onFill}
              disabled={cubeBlocked || waterLevel >= 1 || (isFillingWater && !isWaterPaused)}
            >
              <span className="btn-icon">🌊</span>
              {isFillingWater && !isWaterPaused ? 'Llenando…' : 'Llenar agua'}
            </button>
            <button
              className={`btn btn-red ${isDrainingWater && !isWaterPaused ? 'active' : ''}`}
              onClick={onDrain}
              disabled={cubeBlocked || waterLevel <= 0 || (isDrainingWater && !isWaterPaused)}
            >
              <span className="btn-icon">🔽</span>
              {isDrainingWater && !isWaterPaused ? 'Vaciando…' : 'Vaciar agua'}
            </button>
          </div>

          {!cubeBlocked && (isFillingWater || isDrainingWater) && (
            <div className="control-buttons single" style={{ marginTop: 8 }}>
              <button
                className={`btn btn-yellow ${isWaterPaused ? '' : 'active'}`}
                onClick={isWaterPaused ? onResume : onPause}
                style={{
                  background: isWaterPaused ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.08)',
                  borderColor: 'rgba(245,158,11,0.5)',
                }}
              >
                <span className="btn-icon">{isWaterPaused ? '▶' : '⏸'}</span>
                {isWaterPaused
                  ? `Continuar ${isFillingWater ? 'llenado' : 'vaciado'}`
                  : `Pausar ${isFillingWater ? 'llenado' : 'vaciado'}`}
              </button>
            </div>
          )}

          {!cubeBlocked && waterLevel > 0 && (
            <div className="water-info" style={{ marginTop: 8 }}>
              <span>{isWaterPaused ? '⏸' : '💧'}</span>
              <span>
                {isWaterPaused
                  ? <><strong style={{ color: 'var(--accent-yellow)' }}>Pausado</strong> · {Math.round(waterLevel*100)}%</>
                  : <>Llenado: <strong style={{ color: 'var(--accent-cyan)' }}>{Math.round(waterLevel*100)}%</>
                }
              </span>
            </div>
          )}
        </div>

        {/* ── Reset ── */}
        <div>
          <div className="control-buttons single">
            <button className="btn btn-reset" onClick={onReset}>
              <span className="btn-icon">🔄</span> Reiniciar simulación
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
