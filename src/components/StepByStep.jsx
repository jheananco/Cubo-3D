export default function StepByStep({ arista, volume }) {
  const a   = arista
  const a2  = a * a
  const a3  = volume

  const steps = [
    {
      n: '01',
      title: 'Identificar la arista',
      text: `El cubo tiene una arista de ${a} cm. Esta medida es la misma en los tres lados: ancho, alto y profundidad.`,
    },
    {
      n: '02',
      title: 'Escribir la fórmula',
      text: 'El volumen de un cubo se obtiene elevando la arista al cubo (a la tercera potencia).',
    },
    {
      n: '03',
      title: 'Sustituir el valor',
      text: `Reemplazamos la variable "a" por el valor ${a} cm en la fórmula.`,
    },
    {
      n: '04',
      title: 'Desarrollar la potencia',
      text: `Calculamos ${a}³ = ${a} × ${a} × ${a} = ${a3.toLocaleString()}.`,
    },
    {
      n: '05',
      title: 'Escribir el resultado con unidades',
      text: `El resultado se expresa en centímetros cúbicos (cm³), que son unidades de volumen.`,
    },
  ]

  return (
    <section className="section steps-bg" style={{ background: 'none', border: 'none' }}>
      <div className="section-header">
        <div className="section-tag">Paso a paso</div>
        <h2 className="section-title">Cómo calcular el volumen</h2>
        <p className="section-desc">
          Sigue este proceso con la arista actual (<strong style={{ color: 'var(--accent-blue-light)' }}>{a} cm</strong>).
          Cambia el slider para ver cómo se actualiza.
        </p>
      </div>

      <div className="steps-layout">
        {/* Steps list */}
        <div className="steps-list">
          {steps.map(s => (
            <div key={s.n} className="step-item">
              <div className="step-number">{s.n}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <div className="step-text">{s.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Formula card */}
        <div>
          <div className="formula-card">
            <div className="formula-card-title">Resolución matemática</div>

            <div className="formula-step">
              <div className="formula-step-label">Dato</div>
              <div className="formula-step-eq">
                <span className="em">a</span> = <span className="big">{a}</span> cm
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Fórmula</div>
              <div className="formula-step-eq">
                <span className="em">V</span> = <span className="em">a</span>³
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Sustitución</div>
              <div className="formula-step-eq">
                <span className="em">V</span> = <span className="big">{a}</span>³
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Desarrollo</div>
              <div className="formula-step-eq">
                <span className="em">V</span> = {a} × {a} × {a}
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Resultado</div>
              <div className="formula-step-eq">
                <span className="em">V</span> = <span className="big" style={{ color: 'var(--accent-blue-light)', fontSize: '1.6rem' }}>{a3.toLocaleString()}</span>
                <span style={{ marginLeft: 6, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>cm³</span>
              </div>
            </div>

            <div className="formula-conclusion">
              ✅ Un cubo de arista <strong>{a} cm</strong> tiene un volumen de{' '}
              <strong>{a3.toLocaleString()} cm³</strong> — equivale al espacio que
              ocuparía si lo llenáramos con {a3.toLocaleString()} cubitos de 1 cm de lado.
            </div>
          </div>

          {/* Área total card */}
          <div className="formula-card" style={{ marginTop: 14 }}>
            <div className="formula-card-title">Área total de las 6 caras</div>

            <div className="formula-step">
              <div className="formula-step-label">Fórmula</div>
              <div className="formula-step-eq">
                <span className="em">A</span> = 6 × <span className="em">a</span>²
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Sustitución</div>
              <div className="formula-step-eq">
                <span className="em">A</span> = 6 × <span className="big">{a}</span>²
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Desarrollo</div>
              <div className="formula-step-eq">
                <span className="em">A</span> = 6 × {a2.toLocaleString()}
              </div>
            </div>

            <div className="formula-step">
              <div className="formula-step-label">Resultado</div>
              <div className="formula-step-eq">
                <span className="em">A</span> = <span className="big" style={{ color: 'var(--accent-green)', fontSize: '1.6rem' }}>{(6 * a2).toLocaleString()}</span>
                <span style={{ marginLeft: 6, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>cm²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
