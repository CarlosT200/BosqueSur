import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_POR_ROL = {
  ADMIN: [
    ['/', 'Inicio'],
    ['/despachos', 'Despachos'],
    ['/inventario', 'Inventario'],
    ['/recepciones', 'Recepciones'],
    ['/resumen', 'Resumen'],
    ['/auditoria', 'Auditoría'],
  ],
  BODEGA: [
    ['/', 'Inicio'],
    ['/despachos', 'Despachos'],
    ['/inventario', 'Inventario'],
    ['/recepciones', 'Recepciones'],
    ['/resumen', 'Resumen'],
  ],
  GERENCIA: [
    ['/', 'Inicio'],
    ['/inventario', 'Inventario'],
    ['/recepciones', 'Recepciones'],
    ['/resumen', 'Resumen'],
  ],
  TERRENO: [['/', 'Inicio']],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_POR_ROL[user?.role] ?? [['/', 'Inicio']];

  const salir = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="logo">🌲</span>
          <span>BosqueSur · Bodega</span>
        </div>
        <nav className="nav">
          {items.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="user-box">
          <span>{user?.nombre}</span>
          <span className="rol">{user?.role}</span>
          <button className="btn btn-sm btn-secondary" onClick={salir}>
            Salir
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
