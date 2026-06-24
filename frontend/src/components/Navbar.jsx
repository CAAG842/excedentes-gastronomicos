import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = {
    CLIENTE: [
      { to: '/cliente/catalogo', label: 'Catálogo' },
      { to: '/cliente/reservas', label: 'Mis Reservas' },
      { to: '/cliente/notificaciones', label: 'Notificaciones' },
      { to: '/cliente/perfil', label: 'Perfil' },
    ],
    COMERCIO: [
      { to: '/comercio/packs', label: 'Mis Packs' },
      { to: '/comercio/publicar', label: 'Publicar Pack' },
      { to: '/comercio/validar', label: 'Validar Reserva' },
      { to: '/comercio/dashboard', label: 'Dashboard' },
      { to: '/comercio/perfil', label: 'Perfil' },
    ],
    ADMINISTRADOR: [
      { to: '/admin/usuarios', label: 'Usuarios' },
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/auditoria', label: 'Auditoría' },
    ],
  };

  return (
    <nav className="bg-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            GastroRescue
          </Link>

          {usuario && (
            <div className="flex items-center gap-1 md:gap-4 overflow-x-auto">
              {links[usuario.rol]?.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 whitespace-nowrap transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
