import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Loading, ErrorBanner, EstadoBadge, fmtM3, fmtDate } from '../components/ui.jsx';

export default function DespachosPage() {
  const navigate = useNavigate();
  const [despachos, setDespachos] = useState([]);
  const [estado, setEstado] = useState('PENDIENTE');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = (filtro) => {
    setCargando(true);
    setError(null);
    api
      .getDespachos(filtro || undefined)
      .then((res) => setDespachos(res.data.despachos))
      .catch(setError)
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(estado); }, [estado]);

  return (
    <div>
      <div className="page-head">
        <h1>Despachos</h1>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="PENDIENTE">Pendientes</option>
          <option value="RECIBIDO">Recibidos</option>
          <option value="">Todos</option>
        </select>
      </div>

      <ErrorBanner error={error} />
      <div className="card">
        {cargando ? (
          <Loading />
        ) : despachos.length === 0 ? (
          <div className="empty">No hay despachos para el filtro seleccionado.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Especie</th>
                  <th className="num">Vol. despachado</th>
                  <th>Fecha despacho</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {despachos.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.codigo}</strong></td>
                    <td>{d.especie}</td>
                    <td className="num">{fmtM3(d.volumenDespachadoM3)}</td>
                    <td>{fmtDate(d.fechaDespacho)}</td>
                    <td><EstadoBadge estado={d.estado} /></td>
                    <td>
                      {d.estado === 'PENDIENTE' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/recepcion/${d.id}`)}>
                          Registrar recepción
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
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
