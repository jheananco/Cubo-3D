export default function HeroSection() {
  return (
    <header className="hero">
      <div className="hero-bg" />
      <div className="hero-grid-lines" />
      <div className="hero-content">
        <div className="hero-badge">Laboratorio Virtual 3D</div>
        <h1 className="hero-title">
          Aprende el{' '}
          <span className="highlight">Volumen del Cubo</span>
        </h1>
        <p className="hero-subtitle">
          Explora, manipula y comprende la geometría tridimensional.
          Desármalo, lléname con agua y domina la fórmula V&nbsp;=&nbsp;a³.
        </p>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">6</span>
            <span className="stat-label">Caras</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">12</span>
            <span className="stat-label">Aristas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">8</span>
            <span className="stat-label">Vértices</span>
          </div>
          <div className="stat-card">
            <span className="stat-number" style={{ fontSize: '1.2rem' }}>V=a³</span>
            <span className="stat-label">Volumen</span>
          </div>
          <div className="stat-card">
            <span className="stat-number" style={{ fontSize: '1.2rem' }}>A=6a²</span>
            <span className="stat-label">Área total</span>
          </div>
        </div>
      </div>
    </header>
  )
}
