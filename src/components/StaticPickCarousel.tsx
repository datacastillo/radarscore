import React, { useRef, useState, useEffect } from 'react';

// ==========================================
// 1. DEFINICIÓN DE TIPOS
// ==========================================
export interface PickItem {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  image: string;
  url: string;
  badge?: string;
  target?: '_blank' | '_self';
}

interface StaticPickCarouselProps {
  picks: PickItem[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================
export const StaticPickCarousel: React.FC<StaticPickCarouselProps> = ({
  picks,
  sectionTitle = "Nuestros Picks Destacados",
  sectionSubtitle = "Selección exclusiva curada por nuestro equipo"
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Evalúa si se puede scrollear a la izquierda o derecha para habilitar/deshabilitar botones
  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [picks]);

  // Navegación suave por desplazamiento de ancho visible
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.8; // Desplaza el 80% de la vista actual
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!picks || picks.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ---------------------------------- */}
      // ENCABEZADO Y CONTROLES ESTÁTICOS
      {/* ---------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Botones de navegación (solo si hay contenido para scrollear) */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className={`p-2.5 rounded-full border transition-all duration-200 ${
              canScrollLeft
                ? 'border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-400 active:scale-95'
                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Siguiente"
            className={`p-2.5 rounded-full border transition-all duration-200 ${
              canScrollRight
                ? 'border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-400 active:scale-95'
                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------------------------------- */}
      // CARRUSEL SCROLL SNAP (ESTÁTICO)
      {/* ---------------------------------- */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none py-2 px-1 -mx-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {picks.map((pick) => (
          <div
            key={pick.id}
            className="snap-start flex-none w-[85%] sm:w-[45%] lg:w-[31%] xl:w-[23.5%]"
          >
            {/* Tarjeta de Solo Lectura con CTA */}
            <a
              href={pick.url}
              target={pick.target || '_self'}
              rel={pick.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative"
            >
              {/* Badge visual (Opcional) */}
              {pick.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900/90 text-white backdrop-blur-md shadow-sm">
                    {pick.badge}
                  </span>
                </div>
              )}

              {/* Contenedor de Imagen */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                  src={pick.image}
                  alt={pick.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Información y Contenido */}
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  {pick.category && (
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                      {pick.category}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {pick.title}
                  </h3>
                  {pick.description && (
                    <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {pick.description}
                    </p>
                  )}
                </div>

                {/* Flecha de Acción / CTA Estático */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  <span>Ver detalle</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};