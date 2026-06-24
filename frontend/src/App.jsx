import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import RegistroCliente from './pages/auth/RegistroCliente';
import RegistroComercio from './pages/auth/RegistroComercio';

import Catalogo from './pages/cliente/Catalogo';
import MisReservas from './pages/cliente/MisReservas';
import Notificaciones from './pages/cliente/Notificaciones';
import PerfilCliente from './pages/cliente/PerfilCliente';

import MisPacks from './pages/comercio/MisPacks';
import PublicarPack from './pages/comercio/PublicarPack';
import ValidarReserva from './pages/comercio/ValidarReserva';
import Dashboard from './pages/comercio/Dashboard';
import Perfil from './pages/comercio/Perfil';

import Usuarios from './pages/admin/Usuarios';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Auditoria from './pages/admin/Auditoria';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!usuario ? <Login /> : <Navigate to="/" />} />
      <Route path="/registro/cliente" element={<RegistroCliente />} />
      <Route path="/registro/comercio" element={<RegistroComercio />} />

      <Route path="/cliente/catalogo" element={<ProtectedRoute roles={['CLIENTE']}><Catalogo /></ProtectedRoute>} />
      <Route path="/cliente/reservas" element={<ProtectedRoute roles={['CLIENTE']}><MisReservas /></ProtectedRoute>} />
      <Route path="/cliente/notificaciones" element={<ProtectedRoute roles={['CLIENTE']}><Notificaciones /></ProtectedRoute>} />
      <Route path="/cliente/perfil" element={<ProtectedRoute roles={['CLIENTE']}><PerfilCliente /></ProtectedRoute>} />

      <Route path="/comercio/packs" element={<ProtectedRoute roles={['COMERCIO']}><MisPacks /></ProtectedRoute>} />
      <Route path="/comercio/publicar" element={<ProtectedRoute roles={['COMERCIO']}><PublicarPack /></ProtectedRoute>} />
      <Route path="/comercio/validar" element={<ProtectedRoute roles={['COMERCIO']}><ValidarReserva /></ProtectedRoute>} />
      <Route path="/comercio/dashboard" element={<ProtectedRoute roles={['COMERCIO']}><Dashboard /></ProtectedRoute>} />
      <Route path="/comercio/perfil" element={<ProtectedRoute roles={['COMERCIO']}><Perfil /></ProtectedRoute>} />

      <Route path="/admin/usuarios" element={<ProtectedRoute roles={['ADMINISTRADOR']}><Usuarios /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMINISTRADOR']}><DashboardAdmin /></ProtectedRoute>} />
      <Route path="/admin/auditoria" element={<ProtectedRoute roles={['ADMINISTRADOR']}><Auditoria /></ProtectedRoute>} />

      <Route path="/" element={!usuario ? <Landing /> : <Navigate to={
        usuario.rol === 'CLIENTE' ? '/cliente/catalogo' :
        usuario.rol === 'COMERCIO' ? '/comercio/packs' :
        '/admin/usuarios'
      } />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const basename = import.meta.env.BASE_URL;

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { usuario } = useAuth();
  return (
    <>
      {usuario && <Navbar />}
      <AppRoutes />
    </>
  );
}
