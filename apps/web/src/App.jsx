import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DespachosPage from './pages/DespachosPage.jsx';
import RecepcionPage from './pages/RecepcionPage.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import RecepcionesPage from './pages/RecepcionesPage.jsx';
import ResumenPage from './pages/ResumenPage.jsx';
import AuditoriaPage from './pages/AuditoriaPage.jsx';

function Private({ roles, children }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Private><DashboardPage /></Private>} />
      <Route path="/despachos" element={<Private roles={['ADMIN', 'BODEGA']}><DespachosPage /></Private>} />
      <Route path="/recepcion/:id" element={<Private roles={['ADMIN', 'BODEGA']}><RecepcionPage /></Private>} />
      <Route path="/inventario" element={<Private roles={['ADMIN', 'BODEGA', 'GERENCIA']}><InventarioPage /></Private>} />
      <Route path="/recepciones" element={<Private roles={['ADMIN', 'BODEGA', 'GERENCIA']}><RecepcionesPage /></Private>} />
      <Route path="/resumen" element={<Private roles={['ADMIN', 'BODEGA', 'GERENCIA']}><ResumenPage /></Private>} />
      <Route path="/auditoria" element={<Private roles={['ADMIN']}><AuditoriaPage /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
