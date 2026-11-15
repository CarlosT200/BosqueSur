import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorBanner, StatCard, fmtNum } from '../components/ui.jsx';

export default function ResumenPage() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getResumen().then((res) => setResumen(res.data.resumen)).catch(setError).finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loading />;
  if (error) return <ErrorBanner error={error} />;
  if (!resumen) return null;

  return (
    <div>
      <h1>Resumen de diferencias</h1>
      <div className="stat-grid">
        <StatCard label="Despachos pendientes" value={resumen.despachosPendientes} />
        <StatCard label="Despachos recibidos" value={resumen.despachosRecibidos} />
        <StatCard label="Recepciones con diferencia" value={resumen.recepcionesConDiferencia} variant="ambar" />
        <StatCard label="Stock total" value={fmtNum(resumen.stockTotalM3)} unit="m³" variant="madera" />
      </div>

      <div className="card">
        <h2>Diferencias por resolución</h2>
        {resumen.diferenciasPorResolucion.length === 0 ? (
          <div className="empty">No hay recepciones con diferencias registradas.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Resolución</th><th className="num">Cantidad</th></tr>
              </thead>
              <tbody>
                {resumen.diferenciasPorResolucion.map((d) => (
                  <tr key={d.resolucion}>
                    <td>{(d.resolucion ?? '—').replaceAll('_', ' ')}</td>
                    <td className="num">{d.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
