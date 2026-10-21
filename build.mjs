// Generador estático de la web de Centro Deportivo Tenisur.
// Uso: node build.mjs  →  crea /dist con una carpeta por ruta (URLs limpias,
// las mismas rutas que la web anterior en Duda).
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const DIST = "dist";
const SITE = "https://www.centrodeportivotenisur.es";

/* ---------------- Datos reales del negocio ---------------- */
const NEGOCIO = {
  nombre: "Centro Deportivo Tenisur",
  telefono: "675 021 499",
  telHref: "tel:+34675021499",
  whatsapp: "34675021499",
  direccion: "Avenida Austria 9",
  cp: "38660",
  localidad: "Adeje",
  provincia: "Santa Cruz de Tenerife",
  zona: "Costa Adeje",
  reservas: "https://tenisur.taykus.com/", // sistema de reservas actual (Taykus) — NO cambiar
  mapsComoLlegar: "https://maps.google.com/maps?q=Avenida+Austria+9%2C+Adeje%2C+Santa+Cruz+de+Tenerife+38660%2C+ESP(Centro+Deportivo+Tenisur)&sll=28.078072251906,-16.72765015026",
  mapsEmbed: "https://maps.google.com/maps?q=Centro%20Deportivo%20Tenisur%2C%20Avenida%20Austria%209%2C%2038660%20Adeje&z=16&output=embed",
  instagram: "https://www.instagram.com/centrodeportivotenisur/",
  facebook: "https://www.facebook.com/tenisur/",
  opinionGoogle: "https://www.google.com/maps/search/?api=1&query=Centro+Deportivo+Tenisur+Avenida+Austria+9+Adeje",
  opinionFacebook: "https://www.facebook.com/tenisur/reviews",
  lat: 28.078072251906,
  lng: -16.72765015026,
};

/* Imágenes propias del club (alojadas hoy en el CDN de Duda). */
const D = "https://storage.googleapis.com/d_images/";
const IMG = {
  logo: "https://le-de.cdn-website.com/eeb689378b084f728cc500adbd72729f/dms3rep/multi/opt/TENISUR-web-1920w.png",
  og: "https://le-de.cdn-website.com/eeb689378b084f728cc500adbd72729f/dms3rep/multi/opt/TENISUR-pres-1920w.png",
  tenisPano: { src: D + "Image/11600/204/Image/11600/469/02d772d9cdfd471ab776a712393de74c.webp", alt: "Vista panorámica de las pistas de tenis de Tenisur" },
  padel1: { src: D + "Image/11600/481/Image/11600/506/dbbfd913e66c4776a3d05290ff770010.webp", alt: "Pistas de pádel acristaladas en Costa Adeje" },
  tenis1: { src: D + "Image/11600/008/Image/11600/890/5031693b71b94090a58657421901f757.webp", alt: "Pistas de tenis en Costa Adeje" },
  restaurante: { src: D + "Image/11600/320/Image/11600/079/e9d4877887e54e27a5717c8be1c2b132.webp", alt: "Restaurante del centro deportivo" },
  parque: { src: D + "Image/11600/500/Image/11600/941/70731ae307b04bf8b189aec5e5cecab8.webp", alt: "Parque infantil del centro" },
  centro: { src: D + "Image/11600/633/Image/11600/398/97eba81d0f734e05af1b72e176dbea4e.webp", alt: "Instalaciones del Centro Deportivo Tenisur" },
  bar: { src: D + "Image/11600/924/Image/11600/849/58da454415194a7f8a08938132096b6c.webp", alt: "Bar del centro deportivo" },
  tenis2: { src: D + "Image/11600/327/Image/11600/775/67bb4dc054fa4b648b3e89f7e80cad84.webp", alt: "Pista de tenis descubierta" },
  padel2: { src: D + "Image/11600/400/Image/11600/875/baf9579cc23248c1bdf571589797850e.webp", alt: "Pista de pádel del club" },
  instalaciones: { src: D + "ProductImage/11600/908/ProductImage/11600/732/1d4409c051ca4854ac23edd1a7f9a7d5.webp", alt: "Instalaciones deportivas de Tenisur" },
  restauranteP: { src: D + "ProductImage/11600/994/ProductImage/11600/595/777bf686c8904944b5f95e0cd296da12.webp", alt: "Terraza del restaurante" },
  kiosco: { src: D + "ProductImage/11600/430/ProductImage/11600/933/60daf367c0b847a4bc8c1577a1f6ab11.webp", alt: "Kiosco al aire libre" },
};
const VIDEO = D + "SEOPage/11600/273/5d66bd1b-52eb-5e59-904e-3c35628aa148.mp4";
const GALERIA = [IMG.tenisPano, IMG.padel1, IMG.tenis1, IMG.restaurante, IMG.parque, IMG.centro, IMG.bar, IMG.tenis2, IMG.padel2, IMG.instalaciones, IMG.restauranteP, IMG.kiosco];

/* ---------------- Iconos (trazo 1.75, coherentes) ---------------- */
const I = {
  tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  ruta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  izq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  der: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14.1 2C10.9 2 10.2 4.4 10.2 6v2.5H8V12h2.2v10H14V12h2.7l.4-3.5z"/></svg>',
  pesa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  circuito: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14.9-4M20 12a8 8 0 0 1-14.9 4"/><path d="M19 3v5h-5M5 21v-5h5"/></svg>',
  pingpong: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9.5" cy="9.5" r="6"/><path d="M13.7 13.7l6 6"/><circle cx="19" cy="5" r="1.6"/></svg>',
  artes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h16M7 9l-2 12M17 9l2 12M9 9v4a3 3 0 0 0 6 0V9M12 3v6"/></svg>',
  ninos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6M4 13h16"/></svg>',
  tienda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
};

/* Líneas de pista (SVG decorativo; viewBox estirado) */
const LINEAS_PISTA = `<svg class="lineas" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
  <rect x="80" y="70" width="840" height="460"/><line x1="80" y1="130" x2="920" y2="130"/><line x1="80" y1="470" x2="920" y2="470"/>
  <line x1="500" y1="70" x2="500" y2="530"/><line x1="290" y1="130" x2="290" y2="470"/><line x1="710" y1="130" x2="710" y2="470"/><line x1="290" y1="300" x2="710" y2="300"/></svg>`;

/* ---------------- Navegación ---------------- */
const NAV = [
  { href: "/", txt: "Inicio" },
  { href: "/producto/instalaciones-deportivas", txt: "Instalaciones" },
  { href: "/producto/restaurante", txt: "Restaurante" },
  { href: "/galeria", txt: "Galería" },
  { href: "/saber-mas", txt: "Conócenos" },
  { href: "/contacto", txt: "Contacto" },
];
const NAV_MOVIL = [
  { href: "/", txt: "Inicio" },
  { href: "/servicios", txt: "Servicios", sub: [
    { href: "/es/pistas-de-padel-costa-adeje", txt: "Pádel" },
    { href: "/es/pista-de-tenis-costa-adeje", txt: "Tenis" },
    { href: "/es/pistas-squash-costa-adeje", txt: "Squash y racquetball" },
    { href: "/es/ofertas-de-gimnasios-costa-adeje", txt: "Gimnasio y crossfit" },
    { href: "/producto/restaurante", txt: "Restaurante" },
    { href: "/producto/kiosco-y-barbacoa", txt: "Kiosco y barbacoa" },
  ] },
  { href: "/galeria", txt: "Galería", sub: [{ href: "/videos", txt: "Vídeos" }] },
  { href: "/saber-mas", txt: "Conócenos" },
  { href: "/contacto", txt: "Contacto" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const actual = (ruta, href) => (ruta === href || (href !== "/" && ruta.startsWith(href + "/")) ? ' aria-current="page"' : "");
const extReserva = `href="${NEGOCIO.reservas}" target="_blank" rel="noopener"`;

const img = (o, { cls = "", eager = false, sizes = "100vw" } = {}) =>
  `<img src="${o.src}" alt="${esc(o.alt)}"${cls ? ` class="${cls}"` : ""} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}">`;

function cabecera(ruta) {
  return `<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera">
  <div class="contenedor cabecera__in">
    <a class="marca" href="/" aria-label="${NEGOCIO.nombre}, inicio">
      <img src="${IMG.logo}" alt="${NEGOCIO.nombre}" width="160" height="44">
    </a>
    <nav class="nav" aria-label="Principal">
      <ul>${NAV.map((n) => `<li><a href="${n.href}"${actual(ruta, n.href)}>${n.txt}</a></li>`).join("")}</ul>
    </nav>
    <a class="btn btn--reserva cabecera__reserva" ${extReserva}>${I.cal}Reservar pista<span class="sr-only"> (se abre en una pestaña nueva)</span></a>
    <button class="menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="panel" data-abrir-menu>${I.menu}</button>
  </div>
</header>
<div class="panel" id="panel" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Menú">
  <div class="panel__top"><span>Tenisur</span><button class="panel__cerrar" type="button" aria-label="Cerrar menú" data-cerrar-menu>${I.x}</button></div>
  <nav aria-label="Menú móvil">
    <ul>${NAV_MOVIL.map((n) => `<li><a href="${n.href}"${actual(ruta, n.href)}>${n.txt}</a>${n.sub ? `<ul class="sub">${n.sub.map((s) => `<li><a href="${s.href}"${actual(ruta, s.href)}>${s.txt}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul>
  </nav>
  <div class="panel__acciones">
    <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}Reservar pista online</a>
    <a class="btn btn--borde btn--grande" href="${NEGOCIO.telHref}">${I.tel}Llamar al ${NEGOCIO.telefono}</a>
  </div>
</div>`;
}

function pie() {
  return `<footer class="pie">
  <div class="contenedor">
    <div class="pie__grid">
      <div>
        <p class="pie__nombre">${NEGOCIO.nombre}</p>
        <p>Tenis, pádel, squash, gimnasio y restaurante en ${NEGOCIO.zona}, Tenerife.</p>
        <div class="redes">
          <a href="${NEGOCIO.instagram}" target="_blank" rel="noopener" aria-label="Instagram de Tenisur">${I.ig}</a>
          <a href="${NEGOCIO.facebook}" target="_blank" rel="noopener" aria-label="Facebook de Tenisur">${I.fb}</a>
          <a href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp de Tenisur">${I.wa}</a>
        </div>
      </div>
      <div>
        <h2>Deportes</h2>
        <ul>
          <li><a href="/es/pistas-de-padel-costa-adeje">Pistas de pádel en Costa Adeje</a></li>
          <li><a href="/es/pista-de-tenis-costa-adeje">Pistas de tenis en Costa Adeje</a></li>
          <li><a href="/es/pistas-squash-costa-adeje">Pistas de squash en Costa Adeje</a></li>
          <li><a href="/es/ofertas-de-gimnasios-costa-adeje">Gimnasio en Costa Adeje</a></li>
        </ul>
      </div>
      <div>
        <h2>El club</h2>
        <ul>
          <li><a href="/servicios">Servicios</a></li>
          <li><a href="/producto/restaurante">Restaurante</a></li>
          <li><a href="/producto/kiosco-y-barbacoa">Kiosco y barbacoa</a></li>
          <li><a href="/galeria">Galería</a> · <a href="/videos">Vídeos</a></li>
          <li><a href="/saber-mas">Conócenos</a></li>
        </ul>
      </div>
      <div>
        <h2>Visítanos</h2>
        <address>${NEGOCIO.direccion}<br>${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.provincia}</address>
        <p style="margin-top:10px"><a href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a></p>
        <p>L–V 08:30–22:30<br>S–D 08:30–15:30</p>
      </div>
    </div>
    <div class="pie__base">
      <span>© <span data-anio>2026</span> ${NEGOCIO.nombre}</span>
      <ul>
        <li><a href="/aviso-legal">Aviso legal</a></li>
        <li><a href="/politica-de-privacidad">Política de privacidad</a></li>
        <li><a href="/politica-de-cookies">Política de cookies</a></li>
        <li><a href="/declaracion-de-accesibilidad">Declaración de accesibilidad</a></li>
      </ul>
    </div>
  </div>
</footer>
<nav class="barra-movil" aria-label="Accesos rápidos">
  <a href="${NEGOCIO.telHref}">${I.tel}Llamar</a>
  <a href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>
  <a class="reserva" ${extReserva}>${I.cal}Reservar</a>
</nav>
<dialog class="visor" id="visor" aria-label="Visor de imágenes">
  <div class="visor__in">
    <figure style="margin:0"><img src="" alt=""><figcaption></figcaption></figure>
    <button class="visor__btn visor__cerrar" type="button" aria-label="Cerrar" data-visor-cerrar>${I.x}</button>
    <button class="visor__btn visor__ant" type="button" aria-label="Imagen anterior" data-visor-ant>${I.izq}</button>
    <button class="visor__btn visor__sig" type="button" aria-label="Imagen siguiente" data-visor-sig>${I.der}</button>
  </div>
</dialog>`;
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: NEGOCIO.nombre,
  url: SITE + "/",
  image: IMG.og,
  logo: IMG.logo,
  telephone: "+34 675 021 499",
  address: { "@type": "PostalAddress", streetAddress: NEGOCIO.direccion, postalCode: NEGOCIO.cp, addressLocality: NEGOCIO.localidad, addressRegion: NEGOCIO.provincia, addressCountry: "ES" },
  geo: { "@type": "GeoCoordinates", latitude: NEGOCIO.lat, longitude: NEGOCIO.lng },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "22:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "08:30", closes: "15:30" },
  ],
  sameAs: [NEGOCIO.instagram, NEGOCIO.facebook],
};

function pagina({ ruta, titulo, desc, cuerpo, imagenOg = IMG.og, migas = null, noindex = false }) {
  const canon = SITE + (ruta === "/" ? "/" : ruta);
  const migasLd = migas
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [{ name: "Inicio", href: "/" }, ...migas].map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.name, item: SITE + (m.href || ruta) })),
      })}</script>`
    : "";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
${noindex ? '<meta name="robots" content="noindex, follow">' : ""}
<meta name="theme-color" content="#0b4a40">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${NEGOCIO.nombre}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${imagenOg}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://storage.googleapis.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&display=swap">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(SCHEMA)}</script>
${migasLd}
</head>
<body>
${cabecera(ruta)}
<main id="contenido" tabindex="-1">
${cuerpo}
</main>
${pie()}
<script src="/main.js" defer></script>
</body>
</html>
`;
}

/* ---------------- Bloques reutilizables ---------------- */
const estadoChip = `<p class="estado" data-estado hidden><span class="estado__punto" aria-hidden="true"></span><span data-estado-texto></span></p>`;

function cabPagina({ h1, sub, foto, migas }) {
  const m = migas
    ? `<nav class="migas" aria-label="Ruta de navegación"><ol><li><a href="/">Inicio</a></li>${migas.map((x) => (x.href ? `<li><a href="${x.href}">${x.name}</a></li>` : `<li aria-current="page">${x.name}</li>`)).join("")}</ol></nav>`
    : "";
  return `<section class="cab-pagina${foto ? "" : " sin-foto"}">
  ${foto ? `<div class="cab-pagina__foto">${img(foto, { eager: true })}</div>` : ""}
  <div class="contenedor">${m}<h1>${h1}</h1>${sub ? `<p>${sub}</p>` : ""}</div>
</section>`;
}

const bloqueReserva = (titulo = "Reserva tu pista online", texto = "Elige día, hora y pista en nuestro sistema de reservas. Si prefieres, llámanos y te la reservamos.") => `
<section class="seccion" aria-labelledby="t-reserva">
  <div class="contenedor">
    <div class="reserva-bloque">
      ${LINEAS_PISTA}
      <div>
        <h2 id="t-reserva">${titulo}</h2>
        <p>${texto}</p>
      </div>
      <div class="reserva-bloque__acc">
        <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}Ir a reservas<span class="sr-only"> (se abre en una pestaña nueva)</span></a>
        <a class="btn btn--borde" href="${NEGOCIO.telHref}">${I.tel}${NEGOCIO.telefono}</a>
        <span class="reserva-bloque__nota">Reservas gestionadas en tenisur.taykus.com</span>
      </div>
    </div>
  </div>
</section>`;

const horarioTabla = `<table class="horario">
  <caption class="sr-only">Horario de apertura</caption>
  <tr data-fila="semana"><th scope="row">Lunes a viernes</th><td>08:30 – 22:30</td></tr>
  <tr data-fila="finde"><th scope="row">Sábado y domingo</th><td>08:30 – 15:30</td></tr>
</table>`;

const visita = (oscura = false) => `
<section class="seccion ${oscura ? "seccion--oscura" : "seccion--blanca"}" aria-labelledby="t-visita">
  <div class="contenedor">
    <div class="seccion__cab"><h2 id="t-visita">Dónde estamos</h2><p>En Avenida Austria, en pleno ${NEGOCIO.zona}.</p></div>
    <div class="visita">
      <div class="datos">
        <div class="dato"><h3>Dirección</h3><address>${NEGOCIO.direccion}<br>${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.provincia}</address></div>
        <div class="dato"><h3>Teléfono</h3><p><a href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a></p></div>
        <div class="dato"><h3>Horario</h3>${horarioTabla}</div>
        <div class="datos__acc">
          <a class="btn ${oscura ? "btn--reserva" : "btn--pista"}" href="${NEGOCIO.mapsComoLlegar}" target="_blank" rel="noopener">${I.ruta}Cómo llegar</a>
          <a class="btn btn--borde" href="/escribenos">Te llamamos nosotros</a>
        </div>
      </div>
      <div class="mapa" data-src="${NEGOCIO.mapsEmbed}">
        <div class="mapa__aviso">
          ${LINEAS_PISTA}
          <button class="btn btn--reserva" type="button" data-cargar-mapa>${I.ruta}Ver mapa</button>
          <p>El mapa se carga desde Google Maps al pulsar el botón.</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

const tira = (lista, grupo = "tira") => `<div class="tira" role="list">${lista.map((o) => `<button type="button" role="listitem" data-visor="${grupo}" aria-label="Ampliar: ${esc(o.alt)}">${img(o, { sizes: "(max-width:720px) 78vw, 30vw" })}</button>`).join("")}</div>`;

/* ---------------- Páginas ---------------- */
const P = {};

/* INICIO */
P["/"] = pagina({
  ruta: "/",
  titulo: "Centro Deportivo Tenisur | Tenis, pádel y squash en Costa Adeje",
  desc: "Centro Deportivo Tenisur en Costa Adeje: pistas de tenis, pádel y squash, gimnasio, crossfit, restaurante y parque infantil. Reserva tu pista online.",
  cuerpo: `
<section class="hero" aria-labelledby="t-hero">
  <div class="hero__foto">${img(IMG.tenisPano, { eager: true })}</div>
  <svg class="hero__lineas" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
    <line class="trazo" pathLength="1" x1="0" y1="430" x2="1000" y2="430"/>
    <line class="trazo t2" pathLength="1" x1="620" y1="0" x2="620" y2="600"/>
    <line class="trazo t3" pathLength="1" x1="620" y1="215" x2="1000" y2="215"/>
    <line class="trazo t4" pathLength="1" x1="810" y1="215" x2="810" y2="430"/>
  </svg>
  <div class="contenedor hero__in">
    ${estadoChip}
    <h1 id="t-hero">Tenis, pádel y squash en Costa Adeje</h1>
    <p class="hero__sub">Pistas, gimnasio, restaurante y parque infantil en un mismo club, en el sur de Tenerife.</p>
    <div class="hero__acciones">
      <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}Reservar pista<span class="sr-only"> (se abre en una pestaña nueva)</span></a>
      <a class="btn btn--borde btn--grande" href="${NEGOCIO.telHref}">${I.tel}Llamar</a>
    </div>
  </div>
</section>

<section class="seccion seccion--blanca" aria-labelledby="t-deportes">
  <div class="contenedor">
    <div class="seccion__cab"><h2 id="t-deportes">Pistas para cada raqueta</h2><p>Juega solo, en pareja o con el grupo de siempre. Todas se reservan online.</p></div>
    <div class="deportes">
      <a class="deporte" href="/es/pista-de-tenis-costa-adeje">
        <span class="deporte__num" aria-hidden="true">3</span>
        <div class="deporte__txt"><h3>Pistas de tenis</h3><p>Pistas descubiertas para individuales o dobles.</p><span class="deporte__ir">Ver tenis</span></div>
        <div class="deporte__foto">${img(IMG.tenis1, { sizes: "(max-width:760px) 100vw, 34vw" })}</div>
      </a>
      <a class="deporte" href="/es/pistas-de-padel-costa-adeje">
        <span class="deporte__num" aria-hidden="true">3</span>
        <div class="deporte__txt"><h3>Pistas de pádel</h3><p>Pistas descubiertas y acristaladas.</p><span class="deporte__ir">Ver pádel</span></div>
        <div class="deporte__foto">${img(IMG.padel1, { sizes: "(max-width:760px) 100vw, 34vw" })}</div>
      </a>
      <a class="deporte" href="/es/pistas-squash-costa-adeje">
        <span class="deporte__num" aria-hidden="true">2</span>
        <div class="deporte__txt"><h3>Pistas de squash y racquetball</h3><p>Para partidos rápidos e intensos, también con ping pong.</p><span class="deporte__ir">Ver squash</span></div>
        <div class="deporte__foto">${img(IMG.centro, { sizes: "(max-width:760px) 100vw, 34vw" })}</div>
      </a>
    </div>
  </div>
</section>

<section class="seccion" aria-labelledby="t-mas">
  <div class="contenedor">
    <div class="seccion__cab"><h2 id="t-mas">Y además</h2><p>Todo lo que necesitas para entrenar y pasar el día.</p></div>
    <div class="extras">
      <div class="extra"><a href="/es/ofertas-de-gimnasios-costa-adeje">${I.pesa}<h3>Gimnasio y crossfit</h3></a><p>Zona de cardio y pesas, y entrenamientos de crossfit en grupo.</p></div>
      <div class="extra">${I.circuito}<h3>Circuito</h3><p>Circuito de entrenamiento dentro de las instalaciones.</p></div>
      <div class="extra">${I.artes}<h3>Club de artes marciales</h3><p>El club de artes marciales entrena en el centro.</p></div>
      <div class="extra">${I.pingpong}<h3>Ping pong</h3><p>Mesas para una partida entre turno y turno.</p></div>
      <div class="extra">${I.ninos}<h3>Parque infantil</h3><p>Los peques juegan mientras los mayores entrenan.</p></div>
      <div class="extra">${I.tienda}<h3>Artículos para gym</h3><p>Material deportivo disponible en el centro.</p></div>
    </div>
  </div>
</section>

<section class="seccion seccion--oscura" aria-labelledby="t-comer">
  <div class="contenedor">
    <div class="duo">
      <div class="duo__foto">${img(IMG.restaurante, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
      <div class="duo__txt">
        <h2 id="t-comer">Restaurante abierto todos los días</h2>
        <p>Amplia carta de especialidades, menús y platos combinados, elaborados con productos frescos y de primera calidad. Con terrazas y espacios abiertos.</p>
        <a class="btn btn--reserva" href="/producto/restaurante">Ver el restaurante</a>
      </div>
    </div>
    <div class="duo duo--inv">
      <div class="duo__foto">${img(IMG.kiosco, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
      <div class="duo__txt">
        <h2>Kiosco y barbacoa al aire libre</h2>
        <p>Comida a precios económicos para aprovechar las tardes y noches de verano con amigos y familia.</p>
        <ul><li>Terraza y terraza cubierta</li><li>Zona chill out</li><li>Parque infantil al lado</li></ul>
        <a class="btn btn--borde" href="/producto/kiosco-y-barbacoa">Ver el kiosco</a>
      </div>
    </div>
  </div>
</section>

<section class="seccion" aria-labelledby="t-galeria">
  <div class="contenedor">
    <div class="seccion__cab seccion__cab--fila"><div><h2 id="t-galeria">Así es Tenisur</h2></div><a class="enlace" href="/galeria">Ver toda la galería</a></div>
    ${tira([IMG.padel2, IMG.tenis2, IMG.bar, IMG.parque, IMG.instalaciones, IMG.restauranteP], "inicio")}
  </div>
</section>

${bloqueReserva()}

<section class="seccion seccion--blanca" aria-labelledby="t-opiniones" style="padding-bottom:0">
  <div class="contenedor">
    <div class="seccion__cab seccion__cab--fila">
      <div><h2 id="t-opiniones">¿Ya nos conoces?</h2><p style="margin-top:12px">Cuéntanos qué tal tu experiencia. Tu opinión ayuda a otros jugadores.</p></div>
      <div class="opiniones">
        <a class="btn btn--pista" href="${NEGOCIO.opinionGoogle}" target="_blank" rel="noopener">Opinar en Google</a>
        <a class="btn btn--borde" href="${NEGOCIO.opinionFacebook}" target="_blank" rel="noopener">${I.fb}Opinar en Facebook</a>
      </div>
    </div>
  </div>
</section>
${visita()}
`,
});

/* INSTALACIONES */
const migInst = [{ name: "Servicios", href: "/servicios" }, { name: "Instalaciones deportivas" }];
P["/producto/instalaciones-deportivas"] = pagina({
  ruta: "/producto/instalaciones-deportivas",
  titulo: "Instalaciones deportivas | Centro Deportivo Tenisur, Costa Adeje",
  desc: "Tres pistas de tenis, tres de pádel, dos de squash y racquetball, circuito, crossfit y gimnasio en Costa Adeje.",
  migas: migInst,
  cuerpo: `${cabPagina({ h1: "Instalaciones deportivas", sub: "Unas instalaciones donde todo el mundo encuentra su manera de hacer deporte.", foto: IMG.instalaciones, migas: migInst })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="deportes">
    <a class="deporte" href="/es/pista-de-tenis-costa-adeje"><span class="deporte__num" aria-hidden="true">3</span><div class="deporte__txt"><h3>Pistas de tenis</h3><p>Descubiertas, para individuales o dobles.</p><span class="deporte__ir">Ver tenis</span></div><div class="deporte__foto">${img(IMG.tenis2, { sizes: "34vw" })}</div></a>
    <a class="deporte" href="/es/pistas-de-padel-costa-adeje"><span class="deporte__num" aria-hidden="true">3</span><div class="deporte__txt"><h3>Pistas de pádel</h3><p>Descubiertas y acristaladas.</p><span class="deporte__ir">Ver pádel</span></div><div class="deporte__foto">${img(IMG.padel2, { sizes: "34vw" })}</div></a>
    <a class="deporte" href="/es/pistas-squash-costa-adeje"><span class="deporte__num" aria-hidden="true">2</span><div class="deporte__txt"><h3>Pistas de squash y racquetball</h3><p>Partidos cortos e intensos.</p><span class="deporte__ir">Ver squash</span></div><div class="deporte__foto">${img(IMG.centro, { sizes: "34vw" })}</div></a>
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab"><h2>Entrenar fuera de la pista</h2></div>
  <div class="extras">
    <div class="extra"><a href="/es/ofertas-de-gimnasios-costa-adeje">${I.pesa}<h3>Gimnasio y crossfit</h3></a><p>Cardio, pesas y entrenamiento de alta intensidad en grupo.</p></div>
    <div class="extra">${I.circuito}<h3>Circuito</h3><p>Circuito de entrenamiento en el propio centro.</p></div>
    <div class="extra">${I.artes}<h3>Club de artes marciales</h3><p>El club de artes marciales de Centro Deportivo Tenisur.</p></div>
    <div class="extra">${I.tienda}<h3>Artículos para gym</h3><p>Material para tus entrenamientos.</p></div>
  </div>
  <p style="margin-top:32px;font-size:var(--t-l)">Ven y conoce nuestras instalaciones.</p>
</div></section>
${bloqueReserva()}
${visita(true)}`,
});

/* RESTAURANTE */
const migRest = [{ name: "Servicios", href: "/servicios" }, { name: "Restaurante" }];
P["/producto/restaurante"] = pagina({
  ruta: "/producto/restaurante",
  titulo: "Restaurante en Costa Adeje | Centro Deportivo Tenisur",
  desc: "Restaurante abierto todos los días en Costa Adeje: especialidades, menús y platos combinados con productos frescos, con terrazas y espacios abiertos.",
  migas: migRest,
  cuerpo: `${cabPagina({ h1: "Restaurante", sub: "Abierto todos los días, con terrazas y espacios abiertos.", foto: IMG.restaurante, migas: migRest })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__foto">${img(IMG.restauranteP, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
    <div class="duo__txt">
      <h2>Cocina después del partido</h2>
      <p>Nuestro restaurante abre todos los días y ofrece una amplia carta de especialidades, menús y platos combinados.</p>
      <p>Todos nuestros platos están elaborados con productos frescos y de primera calidad.</p>
      <ul><li>Terraza</li><li>Terraza cubierta</li><li>Zona chill out</li></ul>
      <p><strong>¡Ven a conocernos!</strong></p>
      <a class="btn btn--pista" href="${NEGOCIO.telHref}">${I.tel}Llamar al ${NEGOCIO.telefono}</a>
    </div>
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab"><h2>El ambiente</h2></div>
  ${tira([IMG.restaurante, IMG.bar, IMG.restauranteP, IMG.kiosco, IMG.parque], "restaurante")}
</div></section>
${visita(true)}`,
});

/* KIOSCO */
const migKio = [{ name: "Servicios", href: "/servicios" }, { name: "Kiosco y barbacoa" }];
P["/producto/kiosco-y-barbacoa"] = pagina({
  ruta: "/producto/kiosco-y-barbacoa",
  titulo: "Kiosco y barbacoa | Centro Deportivo Tenisur, Costa Adeje",
  desc: "Kiosco al aire libre con comida a precios económicos, terraza, terraza cubierta y chill out. Ideal para tardes de verano en familia.",
  migas: migKio,
  cuerpo: `${cabPagina({ h1: "Kiosco y barbacoa", sub: "Comida a precios económicos al aire libre.", foto: IMG.kiosco, migas: migKio })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__foto">${img(IMG.parque, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
    <div class="duo__txt">
      <h2>Tardes de verano en familia</h2>
      <p>Tenisur cuenta con un kiosco al aire libre donde ofrecemos comida a precios económicos.</p>
      <p>En el kiosco los peques podrán comer mientras los mayores disfrutan de una velada tranquila. Un lugar fantástico para aprovechar las tardes y noches de verano con los amigos y la familia.</p>
      <ul><li>Terraza</li><li>Terraza cubierta</li><li>Chill out</li></ul>
      <a class="btn btn--pista" href="${NEGOCIO.telHref}">${I.tel}Consultar por teléfono</a>
    </div>
  </div>
</div></section>
${visita(true)}`,
});

/* SERVICIOS (y /productos, misma información; la web antigua tenía ambas rutas) */
const listaServicios = (ruta, h1) => {
  const mig = [{ name: h1 }];
  return pagina({
    ruta,
    titulo: `${h1} | Centro Deportivo Tenisur, Costa Adeje`,
    desc: "Instalaciones deportivas (tenis, pádel, squash, gimnasio y crossfit), restaurante y kiosco con barbacoa en Costa Adeje.",
    migas: mig,
    cuerpo: `${cabPagina({ h1, sub: "Deporte, comida y un sitio para quedarse toda la tarde.", foto: IMG.centro, migas: mig })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__foto">${img(IMG.instalaciones, { sizes: "50vw" })}</div>
    <div class="duo__txt"><h2>Instalaciones deportivas</h2><p>Tenis, pádel, squash y racquetball, circuito, crossfit y gimnasio.</p><a class="btn btn--pista" href="/producto/instalaciones-deportivas">Ver instalaciones</a></div>
  </div>
  <div class="duo duo--inv">
    <div class="duo__foto">${img(IMG.restauranteP, { sizes: "50vw" })}</div>
    <div class="duo__txt"><h2>Restaurante</h2><p>Especialidades, menús y platos combinados, todos los días.</p><a class="btn btn--pista" href="/producto/restaurante">Ver restaurante</a></div>
  </div>
  <div class="duo">
    <div class="duo__foto">${img(IMG.kiosco, { sizes: "50vw" })}</div>
    <div class="duo__txt"><h2>Kiosco y barbacoa</h2><p>Comida económica al aire libre, terrazas y chill out.</p><a class="btn btn--pista" href="/producto/kiosco-y-barbacoa">Ver kiosco</a></div>
  </div>
</div></section>
${bloqueReserva()}`,
  });
};
P["/servicios"] = listaServicios("/servicios", "Productos y servicios");
P["/productos"] = listaServicios("/productos", "Servicios");

/* Páginas SEO por deporte (mismas URLs que la web anterior) */
function paginaDeporte({ ruta, h1, titulo, desc, sub, foto, intro, puntos, fotos, video = false, cta = "Reservar pista" }) {
  const mig = [{ name: "Instalaciones", href: "/producto/instalaciones-deportivas" }, { name: h1 }];
  return pagina({
    ruta, titulo, desc, migas: mig,
    cuerpo: `${cabPagina({ h1, sub, foto, migas: mig })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__txt">
      <h2>${intro.h}</h2>
      ${intro.p.map((t) => `<p>${t}</p>`).join("")}
      <ul>${puntos.map((t) => `<li>${t}</li>`).join("")}</ul>
      <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}${cta}<span class="sr-only"> (se abre en una pestaña nueva)</span></a>
    </div>
    ${video
      ? `<div class="video"><video controls playsinline preload="none" poster="${foto.src}" aria-label="Vídeo de las instalaciones de Tenisur"><source src="${VIDEO}" type="video/mp4"></video></div>`
      : `<div class="duo__foto">${img(fotos[0], { sizes: "(max-width:820px) 100vw, 50vw" })}</div>`}
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab"><h2>Fotos</h2></div>
  ${tira(fotos, ruta)}
</div></section>
<section class="seccion seccion--blanca" style="padding-top:0"><div class="contenedor">
  <div class="seccion__cab" style="margin-bottom:24px"><h2 style="font-size:var(--t-xl)">Otros deportes en Tenisur</h2></div>
  <p>${[
    ["/es/pistas-de-padel-costa-adeje", "Pistas de pádel"],
    ["/es/pista-de-tenis-costa-adeje", "Pistas de tenis"],
    ["/es/pistas-squash-costa-adeje", "Pistas de squash"],
    ["/es/ofertas-de-gimnasios-costa-adeje", "Gimnasio y crossfit"],
  ].filter(([h]) => h !== ruta).map(([h, t]) => `<a class="enlace" href="${h}">${t}</a>`).join(" &nbsp;·&nbsp; ")}</p>
</div></section>
${bloqueReserva()}
${visita(true)}`,
  });
}

P["/es/pistas-de-padel-costa-adeje"] = paginaDeporte({
  ruta: "/es/pistas-de-padel-costa-adeje",
  h1: "Pistas de pádel en Costa Adeje",
  titulo: "Pistas de pádel en Costa Adeje | Centro Deportivo Tenisur",
  desc: "Tres pistas de pádel descubiertas y acristaladas en Costa Adeje. Reserva online en Centro Deportivo Tenisur.",
  sub: "Tres pistas descubiertas y acristaladas.",
  foto: IMG.padel1,
  intro: { h: "Juega al pádel en el sur de Tenerife", p: ["En Centro Deportivo Tenisur tienes tres pistas de pádel descubiertas y acristaladas para jugar con tus amigos.", "Después del partido, el restaurante, la barbacoa y la zona infantil están a unos pasos."] },
  puntos: ["3 pistas descubiertas y acristaladas", "Reserva online o por teléfono", "Restaurante, barbacoa y zona infantil"],
  fotos: [IMG.padel1, IMG.padel2, IMG.centro, IMG.bar],
  video: true,
  cta: "Reservar pista de pádel",
});
P["/es/pista-de-tenis-costa-adeje"] = paginaDeporte({
  ruta: "/es/pista-de-tenis-costa-adeje",
  h1: "Pistas de tenis en Costa Adeje",
  titulo: "Pistas de tenis en Costa Adeje | Centro Deportivo Tenisur",
  desc: "Tres pistas de tenis descubiertas en Costa Adeje para individuales o dobles. Reserva online en Centro Deportivo Tenisur.",
  sub: "Tres pistas descubiertas para individuales o dobles.",
  foto: IMG.tenisPano,
  intro: { h: "Tenis al aire libre", p: ["Nuestras pistas de tenis descubiertas están preparadas para partidos individuales o de dobles.", "Reserva tu turno online y ven a jugar con el clima del sur de Tenerife."] },
  puntos: ["3 pistas descubiertas", "Individuales o dobles", "Reserva online o por teléfono"],
  fotos: [IMG.tenisPano, IMG.tenis1, IMG.tenis2, IMG.centro],
  cta: "Reservar pista de tenis",
});
P["/es/pistas-squash-costa-adeje"] = paginaDeporte({
  ruta: "/es/pistas-squash-costa-adeje",
  h1: "Pistas de squash en Costa Adeje",
  titulo: "Pistas de squash en Costa Adeje | Centro Deportivo Tenisur",
  desc: "Dos pistas de squash y racquetball en Costa Adeje, además de ping pong. Reserva en Centro Deportivo Tenisur.",
  sub: "Dos pistas de squash y racquetball, y ping pong.",
  foto: IMG.centro,
  intro: { h: "Squash y racquetball", p: ["En Tenisur tienes dos pistas de squash y racquetball para partidos rápidos e intensos.", "También puedes echar una partida de ping pong."] },
  puntos: ["2 pistas de squash y racquetball", "Ping pong", "Reserva online o por teléfono"],
  fotos: [IMG.centro, IMG.instalaciones, IMG.bar, IMG.parque],
  cta: "Reservar pista de squash",
});
P["/es/ofertas-de-gimnasios-costa-adeje"] = paginaDeporte({
  ruta: "/es/ofertas-de-gimnasios-costa-adeje",
  h1: "Gimnasio y crossfit en Costa Adeje",
  titulo: "Gimnasio y crossfit en Costa Adeje | Centro Deportivo Tenisur",
  desc: "Gimnasio con zona de cardio y pesas y crossfit en comunidad en Costa Adeje. Amplio espacio, parque infantil y bar.",
  sub: "Cardio, pesas y crossfit en un espacio amplio.",
  foto: IMG.instalaciones,
  intro: { h: "Entrena a tu manera", p: ["Crossfit: entrenamiento de alta intensidad en comunidad, con objetivos personales y compitiendo contigo mismo o con tus compañeros.", "Gimnasio tradicional: zona de cardio y pesas para ganar masa muscular o perder peso. Una amplia superficie para entrenar con menos aglomeraciones."] },
  puntos: ["Crossfit en grupo", "Zona de cardio y pesas", "Parque infantil y bar en el centro"],
  fotos: [IMG.instalaciones, IMG.centro, IMG.parque, IMG.bar],
  cta: "Consultar en reservas",
});

/* GALERÍA */
const migGal = [{ name: "Galería" }];
P["/galeria"] = pagina({
  ruta: "/galeria",
  titulo: "Galería de imágenes | Centro Deportivo Tenisur, Costa Adeje",
  desc: "Fotos de las pistas de tenis, pádel y squash, el restaurante, el kiosco y el parque infantil de Centro Deportivo Tenisur.",
  migas: migGal,
  cuerpo: `${cabPagina({ h1: "Galería", sub: "Pistas, restaurante y zonas comunes del club.", migas: migGal })}
<section class="seccion"><div class="contenedor">
  <div class="galeria">${GALERIA.map((o) => `<button type="button" data-visor="galeria" aria-label="Ampliar: ${esc(o.alt)}">${img(o, { sizes: "(max-width:720px) 50vw, 33vw" })}</button>`).join("")}</div>
  <p style="margin-top:32px"><a class="enlace" href="/videos">Ver los vídeos</a></p>
</div></section>
${bloqueReserva()}`,
});

/* VÍDEOS */
const migVid = [{ name: "Galería", href: "/galeria" }, { name: "Vídeos" }];
P["/videos"] = pagina({
  ruta: "/videos",
  titulo: "Vídeos | Centro Deportivo Tenisur, Costa Adeje",
  desc: "Vídeo de las instalaciones de Centro Deportivo Tenisur en Costa Adeje.",
  migas: migVid,
  cuerpo: `${cabPagina({ h1: "Vídeos", sub: "Un vistazo a las instalaciones.", migas: migVid })}
<section class="seccion"><div class="contenedor">
  <div class="video" style="max-width:960px"><video controls playsinline preload="metadata" poster="${IMG.padel1.src}" aria-label="Vídeo de las instalaciones de Tenisur"><source src="${VIDEO}" type="video/mp4">Tu navegador no puede reproducir este vídeo. <a href="${VIDEO}">Descárgalo aquí</a>.</video></div>
  <p style="margin-top:24px">Más vídeos en nuestro <a class="enlace" href="${NEGOCIO.instagram}" target="_blank" rel="noopener">Instagram</a>.</p>
</div></section>`,
});

/* SABER MÁS / CONÓCENOS */
const migSab = [{ name: "Conócenos" }];
P["/saber-mas"] = pagina({
  ruta: "/saber-mas",
  titulo: "Conócenos | Centro Deportivo Tenisur, Costa Adeje",
  desc: "Centro Deportivo Tenisur, en Costa Adeje (Tenerife): tenis, pádel, squash, crossfit, gimnasio, restaurante y zona infantil.",
  migas: migSab,
  cuerpo: `${cabPagina({ h1: "Conócenos", sub: "Un club de barrio en Costa Adeje para hacer deporte y quedarse.", foto: IMG.tenisPano, migas: migSab })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__txt">
      <h2>Qué es Tenisur</h2>
      <p>Centro Deportivo Tenisur está en Costa Adeje, en el sur de Tenerife. Tiene instalaciones para tenis, pádel, squash, racquetball y crossfit, gimnasio, circuito y ping pong.</p>
      <p>Fuera de la pista, el restaurante abre todos los días, y el kiosco con barbacoa, las terrazas y el parque infantil hacen que muchas familias pasen aquí la tarde.</p>
      <a class="btn btn--pista" href="/producto/instalaciones-deportivas">Ver instalaciones</a>
    </div>
    <div class="duo__foto">${img(IMG.centro, { sizes: "50vw" })}</div>
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab seccion__cab--fila"><div><h2>Fotos del club</h2></div><a class="enlace" href="/galeria">Ver galería</a></div>
  ${tira([IMG.padel1, IMG.tenis1, IMG.restaurante, IMG.parque, IMG.bar], "saber")}
</div></section>
${visita(true)}`,
});

/* CONTACTO */
const migCon = [{ name: "Contacto" }];
P["/contacto"] = pagina({
  ruta: "/contacto",
  titulo: "Contacto | Centro Deportivo Tenisur, Costa Adeje",
  desc: "Llama al 675 021 499 o visítanos en Avenida Austria 9, Adeje. Horario: L-V 08:30-22:30, S-D 08:30-15:30.",
  migas: migCon,
  cuerpo: `${cabPagina({ h1: "Contacto", sub: "Llámanos, escríbenos por WhatsApp o ven a vernos.", migas: migCon })}
<section class="seccion seccion--blanca"><div class="contenedor">
  ${estadoChip.replace('class="estado"', 'class="estado" style="background:var(--cal);color:var(--texto)"')}
  <div class="extras" style="margin-top:8px">
    <div class="extra">${I.tel}<h3>Teléfono</h3><p><a class="enlace" href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a></p></div>
    <div class="extra">${I.wa}<h3>WhatsApp</h3><p><a class="enlace" href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener">Enviar mensaje</a></p></div>
    <div class="extra">${I.cal}<h3>Reservas de pista</h3><p><a class="enlace" ${extReserva}>tenisur.taykus.com</a></p></div>
    <div class="extra">${I.tel}<h3>¿Prefieres que te llamemos?</h3><p><a class="enlace" href="/escribenos">Déjanos tu teléfono</a></p></div>
  </div>
</div></section>
${visita()}`,
});

/* ESCRÍBENOS / TE LLAMAMOS */
const migEsc = [{ name: "Contacto", href: "/contacto" }, { name: "Te llamamos" }];
P["/escribenos"] = pagina({
  ruta: "/escribenos",
  titulo: "Te llamamos | Centro Deportivo Tenisur",
  desc: "Déjanos tu nombre y teléfono y te llamamos.",
  migas: migEsc,
  cuerpo: `${cabPagina({ h1: "Te llamamos nosotros", sub: "Déjanos tu nombre y teléfono. Se abrirá WhatsApp con el mensaje listo para enviar.", migas: migEsc })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <form class="form" id="form-llamada" novalidate data-whatsapp="${NEGOCIO.whatsapp}">
    <div class="aviso aviso--error" id="form-ko" role="alert"></div>
    <div class="dos-col">
      <div class="campo" data-campo="nombre"><label for="nombre">Nombre</label><input id="nombre" name="nombre" autocomplete="name" required><span class="campo__error"></span></div>
      <div class="campo" data-campo="telefono"><label for="telefono">Teléfono</label><input id="telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required><span class="campo__error"></span></div>
    </div>
    <div class="dos-col">
      <div class="campo"><label for="motivo">Motivo</label>
        <select id="motivo" name="motivo"><option value="">Elige una opción</option><option>Reserva de pista</option><option>Gimnasio o crossfit</option><option>Restaurante</option><option>Kiosco y barbacoa</option><option>Otro</option></select></div>
      <div class="campo"><label for="franja">Mejor momento para llamarte</label>
        <select id="franja" name="franja"><option value="">Cualquier momento</option><option>Por la mañana</option><option>Por la tarde</option><option>Por la noche</option></select></div>
    </div>
    <div class="campo"><label for="mensaje">Mensaje <span class="ayuda">(opcional)</span></label><textarea id="mensaje" name="mensaje" maxlength="600"></textarea></div>
    <label class="check"><input type="checkbox" id="privacidad" name="privacidad" required><span>He leído y acepto la <a class="enlace" href="/politica-de-privacidad">política de privacidad</a>.</span></label>
    <div><button class="btn btn--pista btn--grande" type="submit">${I.wa}Enviar por WhatsApp</button></div>
    <div class="aviso" id="form-ok" role="status" tabindex="-1">Abriendo WhatsApp con tu mensaje. Si no se abre, llámanos al <a class="enlace" href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a>.</div>
  </form>
</div></section>`,
});

/* LEGALES — estructura lista; faltan datos del titular */
const legal = (ruta, h1, secciones) => {
  const mig = [{ name: h1 }];
  return pagina({
    ruta, titulo: `${h1} | Centro Deportivo Tenisur`, desc: `${h1} de ${NEGOCIO.nombre}.`, migas: mig, noindex: true,
    cuerpo: `${cabPagina({ h1, migas: mig })}
<section class="seccion seccion--blanca"><div class="contenedor prosa">
  <p class="pendiente">Pendiente: el titular de la web debe completar los datos marcados entre corchetes antes de publicar.</p>
  ${secciones}
</div></section>`,
  });
};
const TITULAR = `<ul><li>Titular: [razón social]</li><li>NIF/CIF: [NIF/CIF]</li><li>Domicilio: ${NEGOCIO.direccion}, ${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.provincia}</li><li>Teléfono: ${NEGOCIO.telefono}</li><li>Correo electrónico: [email de contacto]</li></ul>`;
P["/aviso-legal"] = legal("/aviso-legal", "Aviso legal", `
<h2>Datos identificativos</h2><p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se informa:</p>${TITULAR}
<h2>Uso del sitio</h2><p>El acceso a esta web es gratuito y atribuye la condición de usuario, que se compromete a hacer un uso adecuado de sus contenidos.</p>
<h2>Propiedad intelectual</h2><p>Los textos, imágenes y logotipos de esta web pertenecen a su titular o se usan con autorización.</p>
<h2>Enlaces externos</h2><p>Las reservas se gestionan en una plataforma externa (tenisur.taykus.com), sujeta a sus propias condiciones.</p>`);
P["/politica-de-privacidad"] = legal("/politica-de-privacidad", "Política de privacidad", `
<h2>Responsable del tratamiento</h2>${TITULAR}
<h2>Qué datos tratamos y para qué</h2><p>Si usas el formulario «Te llamamos», tus datos (nombre, teléfono y mensaje) se envían a través de WhatsApp para atender tu solicitud y llamarte. No se almacenan en esta web.</p>
<h2>Base legal</h2><p>Tu consentimiento al enviar la solicitud.</p>
<h2>Conservación</h2><p>[Plazo de conservación]</p>
<h2>Tus derechos</h2><p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a [email de contacto]. También puedes reclamar ante la Agencia Española de Protección de Datos.</p>
<h2>Reservas</h2><p>Los datos que facilitas al reservar se tratan en la plataforma de reservas externa según su propia política.</p>`);
P["/politica-de-cookies"] = legal("/politica-de-cookies", "Política de cookies", `
<h2>Cookies propias</h2><p>Esta web no instala cookies propias de seguimiento ni de publicidad.</p>
<h2>Servicios de terceros</h2><ul><li>Google Fonts: sirve la tipografía de la web.</li><li>Google Maps: solo se carga si pulsas «Ver mapa», y entonces Google puede instalar sus cookies.</li><li>Vídeo e imágenes: se sirven desde almacenamiento externo.</li></ul>
<h2>Cómo gestionarlas</h2><p>Puedes bloquear o borrar cookies desde la configuración de tu navegador.</p>`);
P["/declaracion-de-accesibilidad"] = legal("/declaracion-de-accesibilidad", "Declaración de accesibilidad", `
<h2>Compromiso</h2><p>${NEGOCIO.nombre} quiere que su web sea accesible para todas las personas, siguiendo las pautas WCAG 2.1 nivel AA.</p>
<h2>Medidas aplicadas</h2><ul><li>Navegación completa con teclado y foco visible.</li><li>Textos alternativos en las imágenes.</li><li>Contraste de color suficiente.</li><li>Respeto a la preferencia de movimiento reducido.</li></ul>
<h2>Limitaciones conocidas</h2><p>El sistema de reservas es una plataforma externa y su accesibilidad depende de su proveedor.</p>
<h2>Contacto</h2><p>Si encuentras alguna barrera, llámanos al ${NEGOCIO.telefono}.</p>`);

/* 404 */
P["/404"] = pagina({
  ruta: "/404", titulo: "Página no encontrada | Centro Deportivo Tenisur", desc: "La página que buscas no existe.", noindex: true,
  cuerpo: `${cabPagina({ h1: "Esta página no existe", sub: "Puede que la dirección haya cambiado con la nueva web." })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <p>Prueba desde el inicio o ve directamente a reservar tu pista.</p>
  <div class="hero__acciones"><a class="btn btn--pista" href="/">Ir al inicio</a><a class="btn btn--reserva" ${extReserva}>${I.cal}Reservar pista</a></div>
</div></section>`,
});

/* ---------------- Escritura ---------------- */
rmSync(DIST, { recursive: true, force: true });
for (const [ruta, html] of Object.entries(P)) {
  const file = ruta === "/" ? join(DIST, "index.html") : ruta === "/404" ? join(DIST, "404.html") : join(DIST, ruta, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
copyFileSync("src/styles.css", join(DIST, "styles.css"));
copyFileSync("src/main.js", join(DIST, "main.js"));
writeFileSync(join(DIST, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#ddf247"/><path d="M5 7c6 4 6 14 0 18M27 7c-6 4-6 14 0 18" fill="none" stroke="#0f5e52" stroke-width="2.4"/></svg>`);
const rutas = Object.keys(P).filter((r) => r !== "/404");
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rutas.filter((r) => !["/aviso-legal", "/politica-de-privacidad", "/politica-de-cookies", "/declaracion-de-accesibilidad"].includes(r)).map((r) => `  <url><loc>${SITE}${r === "/" ? "/" : r}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Generadas ${Object.keys(P).length} páginas en /${DIST}`);
