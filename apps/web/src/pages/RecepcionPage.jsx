import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Loading, ErrorBanner, DiferenciaBadge, fmtM3, fmtDate } from '../components/ui.jsx';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function RecepcionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [despacho, setDespacho] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [volumenRecibido, setVolumenRecibido] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState(hoy());
  const [resolucion, setResolucion] = useState('');
  const [observacion, setObservacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(null);

  useEffect(() => {
    api
      .getDespacho(id)
      .then((res) => setDespacho(res.data.despacho))
      .catch(setError)
      .finally(() => setCargando(false));
  }, [id]);

  const diferencia = useMemo(() => {
    if (volumenRecibido === '' || !despacho) return null;
    const d = Number(volumenRecibido) - Number(despacho.volumenDespachadoM3);
    return Math.round((d + Number.EPSILON) * 1000) / 1000;
  }, [volumenRecibido, despacho]);

  const hayDiferencia = diferencia !== null && diferencia !== 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (volumenRecibido === '' || Number(volumenRecibido) < 0) {
      setError({ message: 'Ingrese un volumen recibido válido (no negativo).' });
      return;
    }
    if (hayDiferencia && !resolucion) {
      setError({ message: 'Existe una diferencia: debe seleccionar una resolución.' });
      return;
    }
    if (hayDiferencia && !observacion.trim()) {
      setError({ message: 'Existe una diferencia: la observación es obligatoria.' });
      return;
    }

    const texto = hayDiferencia
      ? `Hay una diferencia de ${diferencia} m³. ¿Confirmar la recepción y actualizar el inventario?`
      : 'La recepción es exacta. ¿Confirmar y actualizar el inventario?';
    if (!window.confirm(texto)) return;

    setEnviando(true);
    try {
      const res = await api.registrarRecepcion(id, {
        volumenRecibidoM3: Number(volumenRecibido),
        fechaRecepcion,
        resolucion: hayDiferencia ? resolucion : undefined,
        observacion: observacion.trim() || undefined,
      });
      setOk(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <Loading />;
  if (error && !despacho) return <ErrorBanner error={error} />;
  if (!despacho) return <div className="empty">Despacho no encontrado.</div>;

  if (ok) {
    return (
      <div>
        <div className="card">
          <div className="alert alert-ok">
            ✅ Recepción registrada e inventario actualizado correctamente.
          </div>
          <table>
            <tbody>
              <tr><th>Despacho</th><td>{despacho.codigo} · {despacho.especie}</td></tr>
              <tr><th>Volumen recibido</th><td>{fmtM3(ok.recepcion.volumenRecibidoM3)}</td></tr>
              <tr><th>Diferencia</th><td><DiferenciaBadge valor={ok.recepcion.diferenciaM3} /></td></tr>
              <tr><th>Inventario {ok.inventario.especie}</th><td>{fmtM3(ok.inventario.cantidadM3)}</td></tr>
              <tr><th>Saldo anterior → posterior</th><td>{fmtM3(ok.movimiento.saldoAnteriorM3)} → <strong>{fmtM3(ok.movimiento.saldoPosteriorM3)}</strong></td></tr>
            </tbody>
          </table>
          <div className="row" style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/inventario')}>Ver inventario</button>
            <button className="btn btn-secondary" onClick={() => navigate('/despachos')}>Volver a despachos</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h1>Recepción de despacho</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/despachos')}>← Volver</button>
      </div>

      <div className="card">
        <h2>Detalle del despacho</h2>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr><th>Código</th><td><strong>{despacho.codigo}</strong></td></tr>
              <tr><th>Especie</th><td>{despacho.especie}</td></tr>
              <tr><th>Fecha de despacho</th><td>{fmtDate(despacho.fechaDespacho)}</td></tr>
              <tr><th>Volumen despachado</th><td>{fmtM3(despacho.volumenDespachadoM3)}</td></tr>
              {despacho.cosecha?.predio && (
                <tr><th>Origen</th><td>{despacho.cosecha.predio.nombre} ({despacho.cosecha.predio.ubicacion})</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Registrar recepción</h2>
        <ErrorBanner error={error} />
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="form-group">
              <label htmlFor="fecha">Fecha de recepción</label>
              <input id="fecha" type="date" value={fechaRecepcion} onChange={(e) => setFechaRecepcion(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="vol">Volumen recibido (m³)</label>
              <input id="vol" type="number" step="0.001" min="0" value={volumenRecibido} onChange={(e) => setVolumenRecibido(e.target.value)} required />
            </div>
          </div>

          {diferencia !== null && (
            <div className={`alert ${diferencia === 0 ? 'alert-ok' : diferencia < 0 ? 'alert-error' : 'alert-warn'}`}>
              Diferencia calculada: <strong>{diferencia} m³</strong>{' '}
              {diferencia === 0 ? '· Recepción exacta' : diferencia < 0 ? '· Faltante' : '· Sobrante'}
            </div>
          )}

          {hayDiferencia && (
            <>
              <div className="form-group">
                <label htmlFor="res">Resolución (obligatoria por diferencia)</label>
                <select id="res" value={resolucion} onChange={(e) => setResolucion(e.target.value)} required>
                  <option value="">Seleccione...</option>
                  <option value="INCIDENCIA_ABIERTA">Incidencia abierta</option>
                  <option value="AJUSTE_ACEPTADO">Ajuste aceptado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="obs">Observación (obligatoria por diferencia)</label>
                <textarea id="obs" value={observacion} onChange={(e) => setObservacion(e.target.value)} required />
              </div>
            </>
          )}

          {!hayDiferencia && (
            <div className="form-group">
              <label htmlFor="obs2">Observación (opcional)</label>
              <textarea id="obs2" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? <><span className="spinner" /> Registrando...</> : 'Confirmar recepción'}
          </button>
        </form>
      </div>
    </div>
  );
}
