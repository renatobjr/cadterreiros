export function Mapping() {
  const charts = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <main className="mapping">
      <div className="mapping-summary">
        <h1>Mapeamento</h1>
      </div>
      <section className="mapbox" aria-label="Mapa">
        <div className="mapbox__grid" />
      </section>
      <div className="chart-grid">
        {charts.map((n) => (
          <article key={n} className="chart-card" data-testid="chart-card">
            <h2>Gráfico {n}</h2>
            <div className="chart-bar" style={{ width: `${n * 10}%` }} />
          </article>
        ))}
      </div>
    </main>
  );
}

export default Mapping;
