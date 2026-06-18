export default function CubeControls({
  arista, setArista,
  showParts, setShowParts,
  cubeMode, setCubeMode,
  waterLevel, isFillingWater, isDrainingWater, isWaterPaused,
  onFill, onDrain, onPause, onResume, onReset,
}) {
  const cubeBlocked = cubeMode !== 'assembled'

  const modeLabel = {
    assembled: { text: 'Ensamblado', cls: 'assembled' },
    exploded:  { text: 'Desarmado 3D', cls: 'exploded' },
    net:       { text: 'Red plana', cls: 'net' },
  }[cubeMode]

  return (
    <div className="card">
      <div className="card-title">Controles del simulador</div>

      {/* Estado actual */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estado:</span>
        <span className={`state-badge ${modeLabel.cls}`}>
          {modeLabel.text}
        </span>
      </div>

      {/* Slider de arista */}
      <div className="slider-section" style={{ marginBottom: 20 }}>
        <div className="slider-header">
          <span className="slider-label">Arista del cubo</span>
          <span className="slider-value">
            {arista}
            <span className="slider-unit">cm</span>
          </span>
        </div>
        <div className="slider-track">
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={arista}
            onChange={e => setArista(Number(e.target.value))}
            aria-label="Arista del cubo en centímetros"
            style={{
              background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${((arista - 1) / 19) * 100}%, rgba(255,255,255,0.08) ${((arista - 1) / 19) * 100}%, rgba(255,255,255,0.08) 100%)`
            }}
          />
        </div>
        <div className="slider-marks">
          <span>1 cm</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20 cm</span>
        </div>
      </div>

      <div className="controls-groups">

        {/* Partes */}
        <div>
          <div className="control-group-label">🔍 Identificar partes</div>
          <div className="control-buttons">
            <button
              className={`btn btn-blue ${showParts && cubeMode === 'assembled' ? 'active' : ''}`}
              onClick={() => setShowParts(true)}
              disabled={cubeMode !== 'assembled'}
              title={cubeMode !== 'assembled' ? 'Arma el cubo primero' : ''}
            >
              <span className="btn-icon">🏷</span>
              Mostrar partes
            </button>
            <button
              className="btn"
              onClick={() => setShowParts(false)}
              disabled={!showParts}
            >
              <span className="btn-icon">✖</span>
              Ocultar partes
            </button>
          </div>

          {showParts && cubeMode === 'assembled' && (
            <div className="parts-info" style={{ marginTop: 10 }}>
              <div className="parts-info-grid">
                {[
                  { n: 'Cara', d: '6 caras cuadradas iguales' },
                  { n: 'Arista', d: '12 aristas de igual longitud' },
                  { n: 'Vértice', d: '8 puntos donde se unen 3 aristas' },
                  { n: 'Base', d: 'Cara inferior del cubo' },
                  { n: 'Altura', d: `Igual a la arista = ${arista} cm` },
                  { n: 'Diagonal', d: `Mide a√3 ≈ ${(arista * Math.sqrt(3)).toFixed(2)} cm` },
                ].map(p => (
                  <div key={p.n} className="part-info-item">
                    <span className="part-info-name">{p.n}</span>
                    <span className="part-info-desc">{p.d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Animaciones */}
        <div>
          <div className="control-group-label">🎬 Animaciones</div>
          <div className="control-buttons">
            <button
              className={`btn btn-green ${cubeMode === 'assembled' ? 'active' : ''}`}
              onClick={() => setCubeMode('assembled')}
            >
              <span className="btn-icon">🧊</span>
              Armar cubo
            </button>
            <button
              className={`btn btn-yellow ${cubeMode === 'exploded' ? 'active' : ''}`}
              onClick={() => setCubeMode('exploded')}
            >
              <span className="btn-icon">💥</span>
              Desarmar 3D
            </button>
          </div>
          <div className="control-buttons" style={{ marginTop: 8 }}>
            <button
              className={`btn btn-purple ${cubeMode === 'net' ? 'active' : ''}`}
              onClick={() => setCubeMode('net')}
              style={{ gridColumn: '1 / -1' }}
            >
              <span className="btn-icon">📐</span>
              Ver red plana del cubo
            </button>
          </div>
          {cubeMode === 'net' && (
            <div className="water-info" style={{ marginTop: 8 }}>
              <span>📐</span>
              <span>Observa cómo se forman las 6 caras. Rota la vista con el mouse.</span>
            </div>
          )}
        </div>

        {/* Agua */}
        <div>
          <div className="control-group-label">💧 Simulación de llenado</div>

          {cubeBlocked && (
            <div className="water-info" style={{ marginBottom: 8 }}>
              <span>⚠️</span>
              <span>Primero arma el cubo para simular el llenado.</span>
            </div>
          )}

          {/* Botones Llenar / Vaciar */}
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

          {/* Botón Pausar / Continuar — visible solo cuando hay animación activa */}
          {!cubeBlocked && (isFillingWater || isDrainingWater) && (
            <div className="control-buttons single" style={{ marginTop: 8 }}>
              <button
                className={`btn btn-yellow ${isWaterPaused ? '' : 'active'}`}
                onClick={isWaterPaused ? onResume : onPause}
                style={{
                  background: isWaterPaused
                    ? 'rgba(245,158,11,0.18)'
                    : 'rgba(245,158,11,0.08)',
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

          {/* Estado del agua */}
          {!cubeBlocked && waterLevel > 0 && (
            <div className="water-info" style={{ marginTop: 8 }}>
              <span>{isWaterPaused ? '⏸' : '💧'}</span>
              <span>
                {isWaterPaused
                  ? <><strong style={{ color: 'var(--accent-yellow)' }}>Pausado</strong> · {Math.round(waterLevel * 100)}%</>
                  : <>Llenado: <strong style={{ color: 'var(--accent-cyan)' }}>{Math.round(waterLevel * 100)}%</strong></>
                }
              </span>
            </div>
          )}
        </div>

        {/* Reset */}
        <div>
          <div className="control-buttons single">
            <button className="btn btn-reset" onClick={onReset}>
              <span className="btn-icon">🔄</span>
              Reiniciar simulación
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
