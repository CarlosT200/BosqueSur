// Utilidades de formato
export const fmtNum = (v, dec = 3) =>
  Number(v ?? 0).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: dec });

export const fmtM3 = (v) => `${fmtNum(v)} m³`;

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es-CL') : '—');
export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export function Loading({ texto = 'Cargando...' }) {
  return (
    <div className="center" style={{ padding: '2rem' }}>
      <span className="spinner" /> <span className="muted" style={{ marginLeft: 8 }}>{texto}</span>
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="alert alert-error">
      <strong>Error:</strong> {error.message}
      {Array.isArray(error.details) && error.details.length > 0 && (
        <ul style={{ margin: '0.4rem 0 0 1rem' }}>
          {error.details.map((d, i) => (
            <li key={i}>{d.campo ? `${d.campo}: ${d.mensaje ?? ''}` : JSON.stringify(d)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StatCard({ label, value, unit, variant }) {
  return (
    <div className={`stat ${variant ?? ''}`}>
      <div className="label">{label}</div>
      <div className="value">
        {value} {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  );
}

export function DiferenciaBadge({ valor }) {
  const n = Number(valor);
  if (n === 0) return <span className="badge badge-ok">Exacta</span>;
  if (n < 0) return <span className="badge badge-falta">Faltante {fmtNum(n)}</span>;
  return <span className="badge badge-sobra">Sobrante +{fmtNum(n)}</span>;
}

export function EstadoBadge({ estado }) {
  const cls = estado === 'RECIBIDO' ? 'badge-recibido' : 'badge-pendiente';
  return <span className={`badge ${cls}`}>{estado}</span>;
}

export function ResolucionBadge({ resolucion }) {
  if (!resolucion) return <span className="muted">—</span>;
  return <span className="badge badge-neutral">{resolucion.replaceAll('_', ' ')}</span>;
}
