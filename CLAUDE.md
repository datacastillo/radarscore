# Proyecto: RadarScore

## Tecnologías Principales
- Framework: Next.js (App Router)
- Lenguaje: TypeScript
- Base de Datos: Supabase (Backend en tiempo real)
- Estilos: Tailwind CSS

## ⚠️ Reglas OBLIGATORIAS para la IA (Instrucciones de Comportamiento)

1. **NO MOCKS / NO DATOS FALSOS:** 
   - Queda estrictamente prohibido reemplazar consultas dinámicas a Supabase con arreglos u objetos de datos estáticos ("mockData", "fakeMatches", etc.).
   - Todo flujo de partidos, rankings y tipsters debe alimentarse directamente de la base de datos de Supabase.

2. **PRESERVAR LÓGICA EXISTENTE:** 
   - No elimines ni sobreescribas funciones que ya estén funcionando correctamente (filtros, conexiones a Supabase, estados de React).
   - Haz cambios quirúrgicos: solo modifica las líneas o componentes solicitados por el usuario.

3. **VERIFICACIÓN:** 
   - Asegúrate de que las interfaces e imports de TypeScript coincidan exactamente con la estructura actual de Supabase.

## Comandos del Proyecto
- Servidor de desarrollo: `npm run dev`
- Compilación de producción: `npm run build`