export function MappingCharts() {
  const charts = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="chart-grid">
      {charts.map((n) => (
        <article key={n} className="chart-card" data-testid="chart-card">
          <h2>Gráfico {n}</h2>
        </article>
      ))}
    </div>
  );
}

export default MappingCharts;
