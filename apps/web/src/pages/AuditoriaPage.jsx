import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorBanner, fmtDateTime } from '../components/ui.jsx';

const colorResultado = (r) =>
  r === 'EXITO' ? 'badge-ok' : r === 'DENEGADO' ? 'badge-sobra' : 'badge-falta';

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getAuditoria(100).then((res) => setRegistros(res.data.auditoria)).catch(setError).finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loading />;

  return (
    <div>
      <h1>Auditoría</h1>
      <p className="muted">Registro de accesos y operaciones sensibles (solo ADMIN).</p>
      <ErrorBanner error={error} />
      <div className="card">
        {registros.length === 0 ? (
          <div className="empty">Sin registros de auditoría.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Resultado</th><th>Detalle</th></tr>
              </thead>
              <tbody>
                {registros.map((a) => (
                  <tr key={a.id}>
                    <td>{fmtDateTime(a.fecha)}</td>
                    <td>{a.usuario ? `${a.usuario.nombre} (${a.usuario.role})` : '—'}</td>
                    <td><strong>{a.accion}</strong></td>
                    <td>{a.entidad}</td>
                    <td><span className={`badge ${colorResultado(a.resultado)}`}>{a.resultado}</span></td>
                    <td className="muted" style={{ fontSize: '0.8rem', maxWidth: 280 }}>
                      {a.detalle ? JSON.stringify(a.detalle) : '—'}
                    </td>
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
