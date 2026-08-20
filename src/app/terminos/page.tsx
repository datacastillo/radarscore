'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Volver al inicio</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Términos de Servicio</h1>
          <p className="text-xs text-slate-500 font-mono">Última actualización: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed">
          ⚠️ <strong className="text-amber-300">Nota interna:</strong> este es un documento plantilla, no una revisión legal certificada. Antes de publicar tu plataforma, te recomendamos que un profesional del derecho en México revise y adapte este contenido a tu operación específica.
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Aceptación de los Términos</h2>
            <p>
              Al registrarte y utilizar RadarScore ("la Plataforma"), aceptas quedar sujeto a estos Términos de Servicio.
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la Plataforma.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Naturaleza del Servicio</h2>
            <p>
              RadarScore es una plataforma de contenido y comunidad enfocada en análisis deportivo, estadísticas,
              y pronósticos generados por modelos estadísticos y/o inteligencia artificial. <strong className="text-white">RadarScore no opera, facilita, ni procesa apuestas deportivas de ningún tipo.</strong> No manejamos dinero de apuestas, no somos una casa de apuestas, y no garantizamos resultados de ningún pronóstico o análisis publicado en la Plataforma.
            </p>
            <p>
              Todo el contenido de análisis, predicciones y estadísticas se ofrece únicamente con fines
              informativos y de entretenimiento. Ninguna predicción, pick, o análisis constituye asesoría
              financiera, de inversión, ni garantía de resultado alguno.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Elegibilidad y Edad Mínima</h2>
            <p>
              Debes tener al menos 18 años de edad para crear una cuenta y utilizar la Plataforma. Al registrarte,
              declaras y garantizas que cumples con este requisito de edad.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Juego Responsable</h2>
            <p>
              Si decides actuar por tu cuenta y riesgo basándote en el contenido de la Plataforma para realizar
              apuestas en plataformas de terceros, lo haces bajo tu entera responsabilidad. Te recomendamos jugar
              siempre con responsabilidad, dentro de tus posibilidades económicas, y buscar ayuda profesional si
              sientes que el juego se ha convertido en un problema.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">5. Contenido Generado por Usuarios</h2>
            <p>
              Al publicar tickets, comentarios, capturas de pantalla, o cualquier otro contenido en la Plataforma,
              otorgas a RadarScore una licencia no exclusiva para mostrar dicho contenido dentro de la Plataforma.
              Eres el único responsable del contenido que publicas, incluyendo que las capturas de apuestas que
              subas correspondan a apuestas reales que hayas realizado.
            </p>
            <p>
              Nos reservamos el derecho de eliminar cualquier contenido que consideremos inapropiado, falso,
              o que viole estos términos, sin previo aviso.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">6. Cuentas y Seguridad</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra
              bajo tu cuenta. Notifícanos inmediatamente si sospechas de un acceso no autorizado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">7. Limitación de Responsabilidad</h2>
            <p>
              RadarScore se ofrece "tal cual", sin garantías de ningún tipo. No garantizamos la exactitud,
              integridad, o utilidad de ningún análisis, predicción, o estadística mostrada en la Plataforma.
              En ningún caso RadarScore será responsable por pérdidas económicas derivadas de decisiones tomadas
              con base en el contenido de la Plataforma.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">8. Modificaciones</h2>
            <p>
              Podemos actualizar estos Términos de Servicio en cualquier momento. El uso continuado de la
              Plataforma después de cualquier cambio constituye tu aceptación de los términos actualizados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">9. Contacto</h2>
            <p>
              Para preguntas sobre estos Términos de Servicio, contáctanos a través de [agregar correo de contacto].
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}