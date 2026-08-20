'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Aviso de Privacidad</h1>
          <p className="text-xs text-slate-500 font-mono">Última actualización: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed">
          ⚠️ <strong className="text-amber-300">Nota interna:</strong> este es un documento plantilla basado en la estructura general que exige la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México. Antes de publicar, te recomendamos que un profesional del derecho lo revise y lo adapte a tu operación específica (identidad del responsable, domicilio fiscal, mecanismos reales de ejercicio de derechos ARCO, etc.).
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-sm text-slate-300 leading-relaxed">

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Responsable del Tratamiento de tus Datos</h2>
            <p>
              RadarScore ("nosotros") es responsable del tratamiento de tus datos personales conforme a lo
              dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
              [Agregar razón social / nombre del responsable y domicilio].
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Datos que Recopilamos</h2>
            <p>Recopilamos los siguientes datos personales cuando usas la Plataforma:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Correo electrónico y contraseña (al registrarte)</li>
              <li>Nombre de usuario y nombre completo (opcional)</li>
              <li>Fotografía de perfil (si la subes, o generada automáticamente)</li>
              <li>Capturas de pantalla de boletos de apuestas que decidas subir a tus publicaciones</li>
              <li>Datos de uso de la Plataforma (picks publicados, comentarios, reacciones)</li>
              <li>Si inicias sesión con Google, tu nombre y correo asociado a esa cuenta</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Finalidad del Tratamiento</h2>
            <p>Usamos tus datos personales para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Crear y administrar tu cuenta de usuario</li>
              <li>Mostrar tu perfil público, estadísticas, y contenido publicado a otros usuarios de la comunidad</li>
              <li>Calcular y mostrar tus métricas de rendimiento (yield, win rate) con base en los tickets que publiques</li>
              <li>Comunicarnos contigo sobre tu cuenta (verificación de correo, notificaciones del servicio)</li>
              <li>Mejorar la Plataforma y prevenir uso indebido o fraudulento</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Datos Compartidos con Terceros</h2>
            <p>Utilizamos los siguientes proveedores de servicio, que pueden procesar datos en nuestro nombre:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Supabase</strong> — almacenamiento de base de datos, autenticación, y almacenamiento de imágenes</li>
              <li><strong className="text-white">Google</strong> — si eliges iniciar sesión con tu cuenta de Google</li>
              <li><strong className="text-white">Vercel</strong> — hospedaje de la aplicación</li>
              <li><strong className="text-white">Google Gemini (IA)</strong> — para generar análisis de texto de partidos (no procesa datos personales tuyos, solo información deportiva pública)</li>
            </ul>
            <p>No vendemos ni compartimos tus datos personales con terceros para fines de mercadotecnia.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">5. Contenido Público</h2>
            <p>
              Ten en cuenta que tu nombre de usuario, foto de perfil, tickets publicados, comentarios, y
              estadísticas de rendimiento son <strong className="text-white">visibles públicamente</strong> para
              cualquier visitante de la Plataforma, incluso sin necesidad de tener una cuenta.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">6. Derechos ARCO</h2>
            <p>
              Tienes derecho a Acceder, Rectificar, Cancelar, u Oponerte (derechos ARCO) al tratamiento de tus
              datos personales, así como a revocar tu consentimiento. Para ejercer estos derechos, contáctanos
              en [agregar correo de contacto para privacidad].
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">7. Seguridad de tus Datos</h2>
            <p>
              Implementamos medidas técnicas y administrativas razonables para proteger tus datos personales
              contra pérdida, uso indebido, o acceso no autorizado, incluyendo controles de acceso a nivel de
              base de datos (Row Level Security) y cifrado de contraseñas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">8. Cambios a este Aviso</h2>
            <p>
              Podemos actualizar este Aviso de Privacidad periódicamente. Te notificaremos de cambios
              significativos a través de la Plataforma.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">9. Contacto</h2>
            <p>
              Para preguntas sobre este Aviso de Privacidad o para ejercer tus derechos ARCO, contáctanos a
              través de [agregar correo de contacto].
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}