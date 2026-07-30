# IDh Experience

Showroom digital para IDh Herrajes — VETECO 2026. Aplicación React + Vite + GSAP,
pensada para funcionar tanto en la pantalla táctil del stand como en la web pública
(herrajesidh.com).

Documentación de referencia (visión, UX, dirección de arte, arquitectura técnica,
storyboard y metodología) en los documentos internos del proyecto — no incluidos
en este repositorio.

## Desarrollo

```bash
npm install
npm run dev
```

## Estado actual

- HOME (5 escenas del storyboard): completo, con scroll continuo tipo
  "worldscroll" (pin + solapamiento entre escenas vía GSAP ScrollTrigger).
- Menú principal y fichas de las 5 secciones (Proyectos, Soluciones, Novedades,
  Calidad, IDH): pendiente, placeholder de navegación en `src/sections/MenuPrincipal.jsx`.
- Tipografías (Triplex e Inter) auto-hospedadas — sin dependencias externas,
  válido tanto para la web como para el despliegue offline en el kiosco.
