import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorBanner, DiferenciaBadge, ResolucionBadge, fmtM3, fmtDate } from '../components/ui.jsx';

export default function RecepcionesPage() {
  const [recepciones, setRecepciones] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getRecepciones().then((res) => setRecepciones(res.data.recepciones)).catch(setError).finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loading />;

  return (
    <div>
      <h1>Historial de recepciones</h1>
      <ErrorBanner error={error} />
      <div className="card">
        {recepciones.length === 0 ? (
          <div className="empty">Aún no se han registrado recepciones.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Despacho</th>
                  <th>Especie</th>
                  <th className="num">Despachado</th>
                  <th className="num">Recibido</th>
                  <th>Diferencia</th>
                  <th>Resolución</th>
                  <th>Fecha</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {recepciones.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.despacho?.codigo}</strong></td>
                    <td>{r.despacho?.especie}</td>
                    <td className="num">{fmtM3(r.despacho?.volumenDespachadoM3)}</td>
                    <td className="num">{fmtM3(r.volumenRecibidoM3)}</td>
                    <td><DiferenciaBadge valor={r.diferenciaM3} /></td>
                    <td><ResolucionBadge resolucion={r.resolucion} /></td>
                    <td>{fmtDate(r.fechaRecepcion)}</td>
                    <td className="muted">{r.observacion ?? '—'}</td>
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
