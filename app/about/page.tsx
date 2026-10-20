import Link from 'next/link';
import React from 'react';

// Definición de las propiedades (opcional, por si quieres reutilizar el componente)
interface AboutProps {
  companyName?: string;
}

export default function About({ companyName = "Sock Enterprice" }: AboutProps) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Columna de Texto */}
        <div className="space-y-6">
          <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            Sobre Nosotros
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Construyendo el futuro con pasión y tecnología
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            En <strong className="text-gray-900 dark:text-white">{companyName}</strong>, nos dedicamos a ofrecer soluciones innovadoras que transforman la manera en que las personas interactúan con el mundo digital. Nuestro compromiso es la calidad, la transparencia y la excelencia en cada proyecto.
          </p>

          {/* Estadísticas o puntos clave */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+5</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Años de experiencia</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+100</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clientes satisfechos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Soporte dedicado</p>
            </div>
          </div>
        </div>

        {/* Columna de Imagen / Ilustración */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-xl bg-gray-200 dark:bg-gray-800 aspect-4/3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1791395387516-1e7b7d8c4e74?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
              alt="Equipo trabajando"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
    </div>
        <Link href="/" className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>Regresar</Link>
      
    </section>
  );
};


