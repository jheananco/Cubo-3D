export default function TheorySection({ arista, volume, areaTotal }) {
  const cards = [
    {
      icon: '🧊',
      title: '¿Qué es un cubo?',
      accent: '#3b82f6',
      content: (
        <>
          <p>
            Un cubo es un sólido geométrico tridimensional formado por
            <strong style={{ color: '#60a5fa' }}> 6 caras cuadradas iguales</strong>.
            Es un caso especial del paralelepípedo donde todos sus lados son iguales.
          </p>
          <ul style={{ marginTop: 12 }}>
            <li>6 caras cuadradas congruentes</li>
            <li>12 aristas de igual longitud</li>
            <li>8 vértices donde se unen 3 aristas</li>
            <li>Todos los ángulos son de 90°</li>
          </ul>
        </>
      )
    },
    {
      icon: '📐',
      title: 'La arista (a)',
      accent: '#06b6d4',
      content: (
        <>
          <p>
            La <strong style={{ color: '#06b6d4' }}>arista</strong> es la medida del lado de
            cada cara cuadrada del cubo. Como todas las caras son iguales, basta
            conocer una sola arista para describir completamente el cubo.
          </p>
          <div className="theory-formula" style={{ color: '#06b6d4', borderColor: 'rgba(6,182,212,0.2)' }}>
            Arista actual: <span style={{ color: '#fff' }}>{arista} cm</span>
          </div>
          <div className="theory-note">
            En un cubo, la altura = la profundidad = la anchura = la arista.
          </div>
        </>
      )
    },
    {
      icon: '📦',
      title: 'Volumen del cubo',
      accent: '#8b5cf6',
      content: (
        <>
          <p>
            El <strong style={{ color: '#a78bfa' }}>volumen</strong> es la cantidad de espacio
            tridimensional que ocupa el cubo. Se calcula multiplicando la arista
            por sí misma tres veces.
          </p>
          <div className="theory-formula" style={{ color: '#a78bfa', borderColor: 'rgba(139,92,246,0.2)' }}>
            V = a³ = a × a × a
          </div>
          <div className="theory-formula" style={{ color: '#fff', fontSize: '1.2rem', marginTop: 8 }}>
            V = {arista}³ = {volume.toLocaleString()} cm³
          </div>
        </>
      )
    },
    {
      icon: '🔲',
      title: 'Área total',
      accent: '#10b981',
      content: (
        <>
          <p>
            El <strong style={{ color: '#34d399' }}>área total</strong> es la suma del área de las
            seis caras del cubo. Cada cara es un cuadrado de lado {arista} cm,
            con área a².
          </p>
          <div className="theory-formula" style={{ color: '#34d399', borderColor: 'rgba(16,185,129,0.2)' }}>
            A = 6 × a² = 6a²
          </div>
          <div className="theory-formula" style={{ color: '#fff', fontSize: '1.2rem', marginTop: 8 }}>
            A = 6 × {arista}² = {areaTotal.toLocaleString()} cm²
          </div>
        </>
      )
    },
    {
      icon: '📈',
      title: 'Crecimiento cúbico',
      accent: '#f59e0b',
      content: (
        <>
          <p>
            El volumen crece de forma <strong style={{ color: '#fbbf24' }}>cúbica</strong>:
            duplicar la arista multiplica el volumen por <strong style={{ color: '#fbbf24' }}>8</strong>.
          </p>
          <div className="growth-section" style={{ marginTop: 12 }}>
            <div className="growth-comparison">
              <div className="growth-item">
                <div className="a-val">a = {arista} cm</div>
                <div className="v-val">{volume.toLocaleString()}</div>
                <div className="label">cm³</div>
              </div>
              <div className="growth-arrow">→</div>
              <div className="growth-item">
                <div className="a-val">a = {arista * 2} cm</div>
                <div className="v-val">{Math.pow(arista * 2, 3).toLocaleString()}</div>
                <div className="label">cm³</div>
              </div>
              <div className="growth-arrow">→</div>
              <div className="growth-item" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <div className="a-val" style={{ color: '#fbbf24', fontSize: '1.2rem' }}>×8</div>
                <div className="label" style={{ color: 'rgba(245,158,11,0.7)' }}>veces más</div>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      icon: '🌐',
      title: 'Red plana del cubo',
      accent: '#ec4899',
      content: (
        <>
          <p>
            La <strong style={{ color: '#f472b6' }}>red plana</strong> es el desarrollo del cubo:
            sus 6 caras extendidas sobre un plano. Al doblarlas correctamente
            vuelven a formar el cubo.
          </p>
          <ul style={{ marginTop: 12 }}>
            <li>Existen 11 redes distintas para el cubo</li>
            <li>La más común tiene forma de cruz</li>
            <li>Usa el botón "Ver red plana" para visualizarla</li>
          </ul>
          <div className="theory-note">
            💡 Presiona "Ver red plana" arriba para ver el cubo desplegarse.
          </div>
        </>
      )
    },
  ]

  return (
    <section className="section">
      <div className="section-header">
        <div className="section-tag">Teoría</div>
        <h2 className="section-title">El cubo y su volumen</h2>
        <p className="section-desc">
          Conceptos fundamentales de geometría para comprender el cubo tridimensional.
        </p>
      </div>

      <div className="theory-grid">
        {cards.map((card, i) => (
          <div
            key={i}
            className="theory-card"
            style={{ '--card-accent': card.accent }}
          >
            <span className="theory-icon">{card.icon}</span>
            <h3>{card.title}</h3>
            <div>{card.content}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
