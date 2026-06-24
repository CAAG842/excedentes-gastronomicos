import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function MisPacks() {
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    api.get('/comercio/packs').then(setPacks).catch(() => {});
  }, []);

  const colores = { DISPONIBLE: 'bg-green-100 text-green-800', AGOTADO: 'bg-gray-100 text-gray-600', EXPIRADO: 'bg-red-100 text-red-800' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis Packs Sorpresa</h1>
        <Link to="/comercio/publicar" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          + Nuevo Pack
        </Link>
      </div>

      {packs.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No has publicado packs aún</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colores[p.estadoPack]}`}>{p.estadoPack}</span>
                <span className="text-sm text-gray-400">{new Date(p.fechaPublicacion).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 mb-2">{p.descripcion}</p>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 line-through text-sm">Gs. {Number(p.precioOriginal).toLocaleString()}</span>
                <span className="text-xl font-bold text-emerald-700">Gs. {Number(p.precioOferta).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Stock: {p.cantidadDisponible}</span>
                <span>Retiro hasta: {new Date(p.horaLimiteRetiro).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
