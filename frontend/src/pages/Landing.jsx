import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold text-emerald-700">GastroRescue</span>
          <Link to="/login" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Rescata comida, <span className="text-emerald-600">genera ingresos</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Conectamos comercios gastronómicos con clientes que quieren aprovechar excedentes
          de comida a precios accesibles. Menos desperdicio, más oportunidades.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/registro/cliente"
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
            Quiero comprar packs
          </Link>
          <Link to="/registro/comercio"
            className="px-8 py-4 bg-white text-emerald-700 border-2 border-emerald-600 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors">
            Registrar mi comercio
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Packs Sorpresa</h3>
            <p className="text-gray-600">Los comercios publican packs de comida excedente a precios con más del 50% de descuento.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cerca de ti</h3>
            <p className="text-gray-600">Filtra por zona y recibe notificaciones cuando hay ofertas en tu barrio.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Impacto ambiental</h3>
            <p className="text-gray-600">Cada pack rescatado son ~0.8 kg de comida que no terminan en la basura.</p>
          </div>
        </div>
      </section>

      <section className="bg-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
            {[
              { paso: '1', titulo: 'Registrate', desc: 'Creá tu cuenta como cliente o comercio en segundos.' },
              { paso: '2', titulo: 'Explorá', desc: 'Buscá packs sorpresa disponibles cerca de tu zona.' },
              { paso: '3', titulo: 'Reservá', desc: 'Elegí un pack, obtené tu código y acercate al local.' },
              { paso: '4', titulo: 'Retirá', desc: 'Mostrá tu código, pagá en el local y disfrutá.' },
            ].map(item => (
              <div key={item.paso}>
                <div className="w-10 h-10 bg-white text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  {item.paso}
                </div>
                <h3 className="font-bold text-lg mb-1">{item.titulo}</h3>
                <p className="text-emerald-100 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        <p>GastroRescue - Plataforma de gestión de excedentes gastronómicos</p>
        <p className="mt-1">Proyecto UNIDA 2026</p>
      </footer>
    </div>
  );
}
