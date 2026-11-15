import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Loading, ErrorBanner, fmtM3, fmtDateTime } from '../components/ui.jsx';

export default function InventarioPage() {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.getInventario(), api.getMovimientos(50)])
      .then(([inv, mov]) => {
        setInventario(inv.data.inventario);
        setMovimientos(mov.data.movimientos);
      })
      .catch(setError)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loading />;

  return (
    <div>
      <h1>Inventario</h1>
      <ErrorBanner error={error} />

      <div className="card">
        <h2>Existencias por especie</h2>
        {inventario.length === 0 ? (
          <div className="empty">Aún no hay existencias registradas.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Especie</th><th className="num">Cantidad disponible</th><th>Última actualización</th></tr>
              </thead>
              <tbody>
                {inventario.map((it) => (
                  <tr key={it.id}>
                    <td><strong>{it.especie}</strong></td>
                    <td className="num">{fmtM3(it.cantidadM3)}</td>
                    <td>{fmtDateTime(it.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Últimos movimientos</h2>
        {movimientos.length === 0 ? (
          <div className="empty">Sin movimientos registrados.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Especie</th>
                  <th>Tipo</th>
                  <th className="num">Cantidad</th>
                  <th className="num">Saldo anterior</th>
                  <th className="num">Saldo posterior</th>
                  <th>Despacho</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td>{fmtDateTime(m.createdAt)}</td>
                    <td>{m.inventoryItem?.especie}</td>
                    <td><span className="badge badge-ok">{m.tipo.replaceAll('_', ' ')}</span></td>
                    <td className="num">+{fmtM3(m.cantidadM3)}</td>
                    <td className="num">{fmtM3(m.saldoAnteriorM3)}</td>
                    <td className="num"><strong>{fmtM3(m.saldoPosteriorM3)}</strong></td>
                    <td>{m.recepcion?.despacho?.codigo ?? '—'}</td>
                    <td>{m.usuario?.nombre ?? '—'}</td>
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
