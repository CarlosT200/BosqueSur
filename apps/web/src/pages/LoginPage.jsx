import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBanner } from '../components/ui.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <div className="logo">🌲</div>
          <h1>BosqueSur Maderas</h1>
        </div>
        <p className="login-sub">Sistema de trazabilidad y bodega</p>
        <ErrorBanner error={error} />
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={cargando}>
            {cargando ? <><span className="spinner" /> Ingresando...</> : 'Iniciar sesión'}
          </button>
        </form>
        <div className="demo-creds">
          <strong>Usuarios de demostración:</strong>
          <div><code>bodega@bosquesur.cl</code> / <code>Bodega123*</code></div>
          <div><code>gerencia@bosquesur.cl</code> / <code>Gerencia123*</code></div>
          <div><code>admin@bosquesur.cl</code> / <code>Admin123*</code></div>
        </div>
      </div>
    </div>
  );
}
