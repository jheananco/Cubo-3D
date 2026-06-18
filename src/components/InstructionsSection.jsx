const INSTRUCTIONS = [
  {
    icon: '🖱',
    title: 'Rota el cubo',
    text: 'Haz clic y arrastra sobre el cubo 3D para girarlo. En celular usa el dedo.',
    colors: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  },
  {
    icon: '📏',
    title: 'Cambia la arista',
    text: 'Usa el slider para ajustar la arista de 1 a 20 cm. Observa cómo cambia el cubo y las fórmulas.',
    colors: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
  },
  {
    icon: '📐',
    title: 'Verifica las fórmulas',
    text: 'El panel de fórmulas muestra V = a³ y A = 6a² actualizadas en tiempo real.',
    colors: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
  },
  {
    icon: '🏷',
    title: 'Identifica las partes',
    text: 'Presiona "Mostrar partes" para ver las etiquetas: cara, arista, vértice, base, diagonal.',
    colors: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  },
  {
    icon: '💥',
    title: 'Desarma el cubo',
    text: 'Pulsa "Desarmar 3D" para separar las 6 caras y ver cómo está compuesto el cubo.',
    colors: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  },
  {
    icon: '📐',
    title: 'Ve la red plana',
    text: 'Activa "Red plana" para ver el cubo desplegado en 2D. Rota la cámara para verlo desde arriba.',
    colors: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
  },
  {
    icon: '🌊',
    title: 'Llena con agua',
    text: 'Arma el cubo y usa "Llenar agua" para simular el volumen visualmente con agua animada.',
    colors: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  },
  {
    icon: '🔄',
    title: 'Reinicia cuando quieras',
    text: 'El botón "Reiniciar simulación" devuelve todo al estado inicial con arista = 5 cm.',
    colors: { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)' },
  },
]

export default function InstructionsSection() {
  return (
    <section className="section">
      <div className="section-header">
        <div className="section-tag">Guía de uso</div>
        <h2 className="section-title">Cómo usar el simulador</h2>
        <p className="section-desc">
          Sigue estos pasos para aprovechar al máximo el laboratorio 3D.
        </p>
      </div>

      <div className="instructions-grid">
        {INSTRUCTIONS.map((inst, i) => (
          <div
            key={i}
            className="instruction-item"
            style={{ '--accent-icon-bg': inst.colors.bg, '--accent-icon-border': inst.colors.border }}
          >
            <div className="instruction-num">
              {inst.icon}
            </div>
            <div className="instruction-text">
              <strong>{inst.title}</strong>
              {inst.text}
            </div>
          </div>
        ))}
      </div>

      {/* Extra tip */}
      <div style={{
        marginTop: 32,
        padding: '20px 24px',
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: 'var(--radius)',
        textAlign: 'center',
        maxWidth: 700,
        margin: '32px auto 0',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>💡</div>
        <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
          Consejo para aprender
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Mueve el slider de arista y observa cómo el volumen cambia mucho más rápido que la
          arista. Si la arista se duplica, el volumen se multiplica por 8. Esto es el
          crecimiento <strong style={{ color: 'var(--accent-blue-light)' }}>cúbico</strong>.
        </p>
      </div>
    </section>
  )
}
