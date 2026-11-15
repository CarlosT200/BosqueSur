import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Loading, ErrorBanner, StatCard, fmtNum } from '../components/ui.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const puedeVerResumen = ['ADMIN', 'BODEGA', 'GERENCIA'].includes(user.role);

  useEffect(() => {
    if (!puedeVerResumen) {
      setCargando(false);
      return;
    }
    api
      .getResumen()
      .then((res) => setResumen(res.data.resumen))
      .catch(setError)
      .finally(() => setCargando(false));
  }, [puedeVerResumen]);

  return (
    <div>
      <div className="page-head">
        <h1>Hola, {user.nombre.split(' ')[0]} 👋</h1>
      </div>

      {user.role === 'TERRENO' && (
        <div className="card">
          <h2>Captura en terreno</h2>
          <p className="muted">
            El registro de predios y cosechas se realiza desde la <strong>aplicación móvil</strong> (Expo Go)
            con tu usuario de rol TERRENO. La información queda centralizada en la misma base de datos.
          </p>
        </div>
      )}

      {puedeVerResumen && (
        <>
          <ErrorBanner error={error} />
          {cargando ? (
            <Loading />
          ) : resumen ? (
            <>
              <div className="stat-grid">
                <StatCard label="Despachos pendientes" value={resumen.despachosPendientes} />
                <StatCard label="Recepciones con diferencia" value={resumen.recepcionesConDiferencia} variant="ambar" />
                <StatCard label="Stock total" value={fmtNum(resumen.stockTotalM3)} unit="m³" variant="madera" />
                <StatCard label="Recepciones totales" value={resumen.recepcionesTotales} />
              </div>
              <div className="card">
                <h2>Accesos rápidos</h2>
                <div className="row">
                  {['ADMIN', 'BODEGA'].includes(user.role) && (
                    <Link className="btn btn-primary" to="/despachos">Registrar recepción</Link>
                  )}
                  <Link className="btn btn-secondary" to="/inventario">Ver inventario</Link>
                  <Link className="btn btn-secondary" to="/resumen">Resumen de diferencias</Link>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
