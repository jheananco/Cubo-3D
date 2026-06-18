export default function FormulaPanel({ arista, volume, areaTotal, waterLevel }) {
  const waterVol = (volume * waterLevel).toFixed(2)
  const pct = Math.round(waterLevel * 100)

  return (
    <div className="card formula-panel">
      <div className="card-title">Cálculos en tiempo real</div>

      {/* Arista */}
      <div className="formula-arista">
        <div className="formula-arista-label">Arista</div>
        <div>
          <span className="formula-arista-value">{arista}</span>
          <span className="formula-arista-unit">cm</span>
        </div>
      </div>

      {/* Volumen + Área */}
      <div className="formula-row">
        <div className="formula-box">
          <div className="formula-box-title">📦 Volumen</div>
          <div className="formula-main">
            <span className="formula-line">
              <span className="var">V</span> = <span className="var">a</span>³
            </span>
            <span className="formula-line">
              <span className="var">V</span> = {arista}³
            </span>
            <span className="formula-line">
              <span className="var">V</span> = <span className="result">{volume.toLocaleString()}</span>
            </span>
            <span className="formula-line" style={{ marginTop: 2 }}>
              <span className="unit">cm³</span>
            </span>
          </div>
        </div>

        <div className="formula-box">
          <div className="formula-box-title">📏 Área total</div>
          <div className="formula-main">
            <span className="formula-line">
              <span className="var">A</span> = 6<span className="var">a</span>²
            </span>
            <span className="formula-line">
              <span className="var">A</span> = 6·{arista}²
            </span>
            <span className="formula-line">
              <span className="var">A</span> = <span className="result">{areaTotal.toLocaleString()}</span>
            </span>
            <span className="formula-line" style={{ marginTop: 2 }}>
              <span className="unit">cm²</span>
            </span>
          </div>
        </div>
      </div>

      {/* Extra props */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 10,
      }}>
        <div style={{
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Diagonal
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem', color: 'var(--accent-yellow)', fontWeight: 700 }}>
            {(arista * Math.sqrt(3)).toFixed(2)}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 3 }}>cm</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>a√3</div>
        </div>
        <div style={{
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cara (área)
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem', color: 'var(--accent-green)', fontWeight: 700 }}>
            {(arista * arista).toFixed(arista % 1 === 0 ? 0 : 2)}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 3 }}>cm²</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>a²</div>
        </div>
      </div>

      {/* Agua */}
      <div className="water-formula">
        <div className="water-formula-header">💧 Simulación de agua</div>
        <div className="water-bar-container">
          <div className="water-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="water-stats">
          <span className="water-pct">{pct}% lleno</span>
          <span className="water-vol">
            {waterVol} / {volume.toLocaleString()} cm³
          </span>
        </div>
        {waterLevel > 0 && (
          <div style={{
            marginTop: 8,
            fontSize: '0.78rem',
            color: 'rgba(148,163,184,0.8)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            V<sub>agua</sub> = {pct}% × {volume} = {waterVol} cm³
          </div>
        )}
      </div>

      {/* Nota crecimiento cúbico */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'rgba(139,92,246,0.07)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 8,
        fontSize: '0.78rem',
        color: 'rgba(167,139,250,0.9)',
        lineHeight: 1.5,
      }}>
        <strong style={{ display: 'block', marginBottom: 3, color: 'var(--accent-purple)' }}>
          📈 Crecimiento cúbico
        </strong>
        Si duplicas la arista ({arista}→{arista * 2} cm), el volumen aumenta
        ×8: {volume} → {Math.pow(arista * 2, 3).toLocaleString()} cm³
      </div>
    </div>
  )
}
