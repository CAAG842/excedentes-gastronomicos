import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [sinLeer, setSinLeer] = useState(0);

  useEffect(() => {
    if (usuario?.rol === 'CLIENTE') {
      api.get('/notificaciones').then(data => {
        setSinLeer(data.filter(n => !n.leida).length);
      }).catch(() => {});
    }
  }, [usuario]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = {
    CLIENTE: [
      { to: '/cliente/catalogo', label: 'Catálogo' },
      { to: '/cliente/reservas', label: 'Mis Reservas' },
      { to: '/cliente/notificaciones', label: 'Notificaciones', badge: sinLeer },
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
                  className="relative px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600 whitespace-nowrap transition-colors"
                >
                  {link.label}
                  {link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
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
