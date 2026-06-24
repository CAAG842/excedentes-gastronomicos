import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-emerald-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-2">Página no encontrada</p>
        <p className="text-gray-500 mb-8">La página que buscas no existe o fue movida.</p>
        <Link to="/" className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
