export interface BarChartDatum {
  label: string;
  value: number;
}

export interface MetricBarChartProps {
  title: string;
  data: BarChartDatum[];
  note?: string;
}

/** Gráfico de barras horizontais usado pelos indicadores do mapeamento. */
export function MetricBarChart({ title, data, note }: MetricBarChartProps) {
  const max = data.reduce((highest, item) => Math.max(highest, item.value), 0);

  return (
    <article className="chart-card card card--pad" data-testid="chart-card">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p className="chart-note">Sem dados</p>
      ) : (
        <div className="bars">
          {data.map((item) => (
            <div key={item.label}>
              <div className="bar__top">
                <span className="bar__label">{item.label}</span>
                <span className="bar__value">{item.value}</span>
              </div>
              <div className="bar__track">
                <div
                  className="bar__fill"
                  data-testid="chart-bar"
                  style={{
                    width: max > 0 ? `${(item.value / max) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {note ? <p className="chart-note">{note}</p> : null}
    </article>
  );
}

export default MetricBarChart;
