// Generador estático de la web de Centro Deportivo Tenisur (español + inglés).
// Uso: node build.mjs  →  crea /dist con una carpeta por ruta (URLs limpias).
// Español: mismas rutas que la web anterior en Duda. Inglés: las mismas bajo /en.
import { mkdirSync, writeFileSync, copyFileSync, rmSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";

const DIST = "dist";
const SITE = "https://www.centrodeportivotenisur.es";

/* ---------------- Idioma ---------------- */
let LANG = "es";
const L = (es, en) => (LANG === "en" ? en : es);
const u = (p) => (LANG === "en" ? (p === "/" ? "/en" : "/en" + p) : p);
const enRuta = (lang, p) => (lang === "en" ? (p === "/" ? "/en" : "/en" + p) : p);

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

/* Imágenes propias del club (alojadas hoy en el CDN de Duda). alt: [es, en] */
const D = "https://storage.googleapis.com/d_images/";
const IMG_RAW = {
  tenisPano: [D + "Image/11600/204/Image/11600/469/02d772d9cdfd471ab776a712393de74c.webp", "Vista panorámica de las pistas de tenis de Tenisur", "Panoramic view of the Tenisur tennis courts"],
  padel1: [D + "Image/11600/481/Image/11600/506/dbbfd913e66c4776a3d05290ff770010.webp", "Pistas de pádel acristaladas en Costa Adeje", "Glass-walled padel courts in Costa Adeje"],
  tenis1: [D + "Image/11600/008/Image/11600/890/5031693b71b94090a58657421901f757.webp", "Pistas de tenis en Costa Adeje", "Tennis courts in Costa Adeje"],
  restaurante: [D + "Image/11600/320/Image/11600/079/e9d4877887e54e27a5717c8be1c2b132.webp", "Restaurante del centro deportivo", "The sports centre restaurant"],
  parque: [D + "Image/11600/500/Image/11600/941/70731ae307b04bf8b189aec5e5cecab8.webp", "Parque infantil del centro", "Children's playground at the centre"],
  centro: [D + "Image/11600/633/Image/11600/398/97eba81d0f734e05af1b72e176dbea4e.webp", "Instalaciones del Centro Deportivo Tenisur", "Centro Deportivo Tenisur facilities"],
  bar: [D + "Image/11600/924/Image/11600/849/58da454415194a7f8a08938132096b6c.webp", "Bar del centro deportivo", "The sports centre bar"],
  tenis2: [D + "Image/11600/327/Image/11600/775/67bb4dc054fa4b648b3e89f7e80cad84.webp", "Pista de tenis descubierta", "Outdoor tennis court"],
  padel2: [D + "Image/11600/400/Image/11600/875/baf9579cc23248c1bdf571589797850e.webp", "Pista de pádel del club", "One of the club's padel courts"],
  instalaciones: [D + "ProductImage/11600/908/ProductImage/11600/732/1d4409c051ca4854ac23edd1a7f9a7d5.webp", "Instalaciones deportivas de Tenisur", "Tenisur sports facilities"],
  restauranteP: [D + "ProductImage/11600/994/ProductImage/11600/595/777bf686c8904944b5f95e0cd296da12.webp", "Terraza del restaurante", "Restaurant terrace"],
  kiosco: [D + "ProductImage/11600/430/ProductImage/11600/933/60daf367c0b847a4bc8c1577a1f6ab11.webp", "Kiosco al aire libre", "Open-air kiosk"],
};
const LOGO = "https://le-de.cdn-website.com/eeb689378b084f728cc500adbd72729f/dms3rep/multi/opt/TENISUR-web-1920w.png";
const OG = "https://le-de.cdn-website.com/eeb689378b084f728cc500adbd72729f/dms3rep/multi/opt/TENISUR-pres-1920w.png";
const VIDEO = D + "SEOPage/11600/273/5d66bd1b-52eb-5e59-904e-3c35628aa148.mp4";
// IMG se resuelve en el idioma actual cada vez que se usa
const IMG = new Proxy({}, { get: (_, k) => { const r = IMG_RAW[k]; return { src: r[0], alt: L(r[1], r[2]) }; } });
const GALERIA = () => ["tenisPano", "padel1", "tenis1", "restaurante", "parque", "centro", "bar", "tenis2", "padel2", "instalaciones", "restauranteP", "kiosco"].map((k) => IMG[k]);

/* ---------------- Iconos ---------------- */
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
  artes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h16M7 9l-2 12M17 9l2 12M9 9v4a3 3 0 0 0 6 0V9M12 3v6"/></svg>',
  ninos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6M4 13h16"/></svg>',
  tienda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
};

const LINEAS_PISTA = `<svg class="lineas" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
  <rect x="80" y="70" width="840" height="460"/><line x1="80" y1="130" x2="920" y2="130"/><line x1="80" y1="470" x2="920" y2="470"/>
  <line x1="500" y1="70" x2="500" y2="530"/><line x1="290" y1="130" x2="290" y2="470"/><line x1="710" y1="130" x2="710" y2="470"/><line x1="290" y1="300" x2="710" y2="300"/></svg>`;

/* ---------------- Navegación ---------------- */
const NAV = () => [
  { href: "/", txt: L("Inicio", "Home") },
  { href: "/producto/instalaciones-deportivas", txt: L("Instalaciones", "Facilities") },
  { href: "/producto/restaurante", txt: L("Restaurante", "Restaurant") },
  { href: "/galeria", txt: L("Galería", "Gallery") },
  { href: "/saber-mas", txt: L("Conócenos", "About us") },
  { href: "/contacto", txt: L("Contacto", "Contact") },
];
const NAV_MOVIL = () => [
  { href: "/", txt: L("Inicio", "Home") },
  { href: "/servicios", txt: L("Servicios", "Services"), sub: [
    { href: "/es/pistas-de-padel-costa-adeje", txt: L("Pádel", "Padel") },
    { href: "/es/pista-de-tenis-costa-adeje", txt: L("Tenis", "Tennis") },
    { href: "/es/pistas-squash-costa-adeje", txt: L("Squash y racquetball", "Squash and racquetball") },
    { href: "/es/ofertas-de-gimnasios-costa-adeje", txt: L("Gimnasio y crossfit", "Gym and CrossFit") },
    { href: "/producto/restaurante", txt: L("Restaurante", "Restaurant") },
    { href: "/producto/kiosco-y-barbacoa", txt: L("Kiosco y barbacoa", "Kiosk and barbecue") },
  ] },
  { href: "/galeria", txt: L("Galería", "Gallery"), sub: [{ href: "/videos", txt: L("Vídeos", "Videos") }] },
  { href: "/saber-mas", txt: L("Conócenos", "About us") },
  { href: "/contacto", txt: L("Contacto", "Contact") },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const actual = (ruta, href) => (ruta === href || (href !== "/" && ruta.startsWith(href + "/")) ? ' aria-current="page"' : "");
const extReserva = `href="${NEGOCIO.reservas}" target="_blank" rel="noopener"`;
const nuevaPestana = () => `<span class="sr-only"> ${L("(se abre en una pestaña nueva)", "(opens in a new tab)")}</span>`;

const img = (o, { eager = false, sizes = "100vw" } = {}) =>
  `<img src="${o.src}" alt="${esc(o.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}">`;

function selectorIdioma(ruta, cls = "") {
  return `<div class="idioma ${cls}" role="group" aria-label="${L("Idioma", "Language")}">
    <a href="${enRuta("es", ruta)}" lang="es" hreflang="es"${LANG === "es" ? ' aria-current="true"' : ""}><span aria-hidden="true">ES</span><span class="sr-only">Español</span></a>
    <a href="${enRuta("en", ruta)}" lang="en" hreflang="en"${LANG === "en" ? ' aria-current="true"' : ""}><span aria-hidden="true">EN</span><span class="sr-only">English</span></a>
  </div>`;
}

function cabecera(ruta) {
  return `<a class="saltar" href="#contenido">${L("Saltar al contenido", "Skip to content")}</a>
<header class="cabecera">
  <div class="contenedor cabecera__in">
    <a class="marca" href="${u("/")}" aria-label="${NEGOCIO.nombre}, ${L("inicio", "home")}">
      <img src="${LOGO}" alt="${NEGOCIO.nombre}" width="160" height="44">
    </a>
    <nav class="nav" aria-label="${L("Principal", "Main")}">
      <ul>${NAV().map((n) => `<li><a href="${u(n.href)}"${actual(ruta, n.href)}>${n.txt}</a></li>`).join("")}</ul>
    </nav>
    ${selectorIdioma(ruta)}
    <a class="btn btn--reserva cabecera__reserva" ${extReserva}>${I.cal}${L("Reservar pista", "Book a court")}${nuevaPestana()}</a>
    <button class="menu-btn" type="button" aria-label="${L("Abrir menú", "Open menu")}" aria-expanded="false" aria-controls="panel" data-abrir-menu>${I.menu}</button>
  </div>
</header>
<div class="panel" id="panel" aria-hidden="true" role="dialog" aria-modal="true" aria-label="${L("Menú", "Menu")}">
  <div class="panel__top"><span>Tenisur</span><button class="panel__cerrar" type="button" aria-label="${L("Cerrar menú", "Close menu")}" data-cerrar-menu>${I.x}</button></div>
  <nav aria-label="${L("Menú móvil", "Mobile menu")}">
    <ul>${NAV_MOVIL().map((n) => `<li><a href="${u(n.href)}"${actual(ruta, n.href)}>${n.txt}</a>${n.sub ? `<ul class="sub">${n.sub.map((s) => `<li><a href="${u(s.href)}"${actual(ruta, s.href)}>${s.txt}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul>
  </nav>
  <div class="panel__acciones">
    <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}${L("Reservar pista online", "Book a court online")}</a>
    <a class="btn btn--borde btn--grande" href="${NEGOCIO.telHref}">${I.tel}${L("Llamar al", "Call")} ${NEGOCIO.telefono}</a>
  </div>
</div>`;
}

function pie() {
  return `<footer class="pie">
  <div class="contenedor">
    <div class="pie__grid">
      <div>
        <p class="pie__nombre">${NEGOCIO.nombre}</p>
        <p>${L(`Tenis, pádel, squash, gimnasio y restaurante en ${NEGOCIO.zona}, Tenerife.`, `Tennis, padel, squash, gym and restaurant in ${NEGOCIO.zona}, Tenerife.`)}</p>
        <div class="redes">
          <a href="${NEGOCIO.instagram}" target="_blank" rel="noopener" aria-label="${L("Instagram de Tenisur", "Tenisur on Instagram")}">${I.ig}</a>
          <a href="${NEGOCIO.facebook}" target="_blank" rel="noopener" aria-label="${L("Facebook de Tenisur", "Tenisur on Facebook")}">${I.fb}</a>
          <a href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener" aria-label="${L("WhatsApp de Tenisur", "Tenisur on WhatsApp")}">${I.wa}</a>
        </div>
      </div>
      <div>
        <h2>${L("Deportes", "Sports")}</h2>
        <ul>
          <li><a href="${u("/es/pistas-de-padel-costa-adeje")}">${L("Pistas de pádel en Costa Adeje", "Padel courts in Costa Adeje")}</a></li>
          <li><a href="${u("/es/pista-de-tenis-costa-adeje")}">${L("Pistas de tenis en Costa Adeje", "Tennis courts in Costa Adeje")}</a></li>
          <li><a href="${u("/es/pistas-squash-costa-adeje")}">${L("Pistas de squash en Costa Adeje", "Squash courts in Costa Adeje")}</a></li>
          <li><a href="${u("/es/ofertas-de-gimnasios-costa-adeje")}">${L("Gimnasio en Costa Adeje", "Gym in Costa Adeje")}</a></li>
        </ul>
      </div>
      <div>
        <h2>${L("El club", "The club")}</h2>
        <ul>
          <li><a href="${u("/servicios")}">${L("Servicios", "Services")}</a></li>
          <li><a href="${u("/producto/restaurante")}">${L("Restaurante", "Restaurant")}</a></li>
          <li><a href="${u("/producto/kiosco-y-barbacoa")}">${L("Kiosco y barbacoa", "Kiosk and barbecue")}</a></li>
          <li><a href="${u("/galeria")}">${L("Galería", "Gallery")}</a> · <a href="${u("/videos")}">${L("Vídeos", "Videos")}</a></li>
          <li><a href="${u("/saber-mas")}">${L("Conócenos", "About us")}</a></li>
        </ul>
      </div>
      <div>
        <h2>${L("Visítanos", "Visit us")}</h2>
        <address>${NEGOCIO.direccion}<br>${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.provincia}</address>
        <p style="margin-top:10px"><a href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a></p>
        <p>${L("L–V 08:30–22:30<br>S–D 08:30–15:30", "Mon–Fri 08:30–22:30<br>Sat–Sun 08:30–15:30")}</p>
      </div>
    </div>
    <div class="pie__base">
      <span>© <span data-anio>2026</span> ${NEGOCIO.nombre}</span>
      <ul>
        <li><a href="${u("/aviso-legal")}">${L("Aviso legal", "Legal notice")}</a></li>
        <li><a href="${u("/politica-de-privacidad")}">${L("Política de privacidad", "Privacy policy")}</a></li>
        <li><a href="${u("/politica-de-cookies")}">${L("Política de cookies", "Cookie policy")}</a></li>
        <li><a href="${u("/declaracion-de-accesibilidad")}">${L("Declaración de accesibilidad", "Accessibility statement")}</a></li>
      </ul>
    </div>
  </div>
</footer>
<nav class="barra-movil" aria-label="${L("Accesos rápidos", "Quick actions")}">
  <a href="${NEGOCIO.telHref}">${I.tel}${L("Llamar", "Call")}</a>
  <a href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>
  <a class="reserva" ${extReserva}>${I.cal}${L("Reservar", "Book")}</a>
</nav>
<dialog class="visor" id="visor" aria-label="${L("Visor de imágenes", "Image viewer")}">
  <div class="visor__in">
    <figure style="margin:0"><img src="" alt=""><figcaption></figcaption></figure>
    <button class="visor__btn visor__cerrar" type="button" aria-label="${L("Cerrar", "Close")}" data-visor-cerrar>${I.x}</button>
    <button class="visor__btn visor__ant" type="button" aria-label="${L("Imagen anterior", "Previous image")}" data-visor-ant>${I.izq}</button>
    <button class="visor__btn visor__sig" type="button" aria-label="${L("Imagen siguiente", "Next image")}" data-visor-sig>${I.der}</button>
  </div>
</dialog>`;
}

const SCHEMA = () => ({
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: NEGOCIO.nombre,
  url: SITE + u("/"),
  image: OG,
  logo: LOGO,
  telephone: "+34 675 021 499",
  address: { "@type": "PostalAddress", streetAddress: NEGOCIO.direccion, postalCode: NEGOCIO.cp, addressLocality: NEGOCIO.localidad, addressRegion: NEGOCIO.provincia, addressCountry: "ES" },
  geo: { "@type": "GeoCoordinates", latitude: NEGOCIO.lat, longitude: NEGOCIO.lng },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "22:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "08:30", closes: "15:30" },
  ],
  sameAs: [NEGOCIO.instagram, NEGOCIO.facebook],
});

function pagina({ ruta, titulo, desc, cuerpo, migas = null, noindex = false }) {
  const canon = SITE + u(ruta);
  const alt = (lang) => SITE + enRuta(lang, ruta);
  const migasLd = migas
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [{ name: L("Inicio", "Home"), href: "/" }, ...migas].map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.name, item: SITE + u(m.href || ruta) })),
      })}</script>`
    : "";
  return `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<link rel="alternate" hreflang="es" href="${alt("es")}">
<link rel="alternate" hreflang="en" href="${alt("en")}">
<link rel="alternate" hreflang="x-default" href="${alt("es")}">
${noindex ? '<meta name="robots" content="noindex, follow">' : ""}
<meta name="theme-color" content="#0b4a40">
<meta property="og:type" content="website">
<meta property="og:locale" content="${L("es_ES", "en_GB")}">
<meta property="og:locale:alternate" content="${L("en_GB", "es_ES")}">
<meta property="og:site_name" content="${NEGOCIO.nombre}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://storage.googleapis.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&display=swap">
${ruta === "/" ? '<link rel="preload" as="image" href="/img/hero-atardecer.webp" type="image/webp">' : ""}
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(SCHEMA())}</script>
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
const estadoChip = (estilo = "") => `<p class="estado" data-estado hidden${estilo ? ` style="${estilo}"` : ""}><span class="estado__punto" aria-hidden="true"></span><span data-estado-texto></span></p>`;

function cabPagina({ h1, sub, foto, migas }) {
  const m = migas
    ? `<nav class="migas" aria-label="${L("Ruta de navegación", "Breadcrumb")}"><ol><li><a href="${u("/")}">${L("Inicio", "Home")}</a></li>${migas.map((x) => (x.href ? `<li><a href="${u(x.href)}">${x.name}</a></li>` : `<li aria-current="page">${x.name}</li>`)).join("")}</ol></nav>`
    : "";
  return `<section class="cab-pagina${foto ? "" : " sin-foto"}">
  ${foto ? `<div class="cab-pagina__foto">${img(foto, { eager: true })}</div>` : ""}
  <div class="contenedor">${m}<h1>${h1}</h1>${sub ? `<p>${sub}</p>` : ""}</div>
</section>`;
}

const bloqueReserva = () => `
<section class="seccion" aria-labelledby="t-reserva">
  <div class="contenedor">
    <div class="reserva-bloque">
      ${LINEAS_PISTA}
      <div>
        <h2 id="t-reserva">${L("Reserva tu pista online", "Book your court online")}</h2>
        <p>${L("Elige día, hora y pista en nuestro sistema de reservas. Si prefieres, llámanos y te la reservamos.", "Choose the day, time and court in our booking system. Or call us and we'll book it for you.")}</p>
      </div>
      <div class="reserva-bloque__acc">
        <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}${L("Ir a reservas", "Go to bookings")}${nuevaPestana()}</a>
        <a class="btn btn--borde" href="${NEGOCIO.telHref}">${I.tel}${NEGOCIO.telefono}</a>
        <span class="reserva-bloque__nota">${L("Reservas gestionadas en tenisur.taykus.com", "Bookings handled at tenisur.taykus.com")}</span>
      </div>
    </div>
  </div>
</section>`;

const horarioTabla = () => `<table class="horario">
  <caption class="sr-only">${L("Horario de apertura", "Opening hours")}</caption>
  <tr data-fila="semana"><th scope="row">${L("Lunes a viernes", "Monday to Friday")}</th><td>08:30 – 22:30</td></tr>
  <tr data-fila="finde"><th scope="row">${L("Sábado y domingo", "Saturday and Sunday")}</th><td>08:30 – 15:30</td></tr>
</table>`;

const visita = (oscura = false) => `
<section class="seccion ${oscura ? "seccion--oscura" : "seccion--blanca"}" aria-labelledby="t-visita">
  <div class="contenedor">
    <div class="seccion__cab"><h2 id="t-visita">${L("Dónde estamos", "Find us")}</h2><p>${L(`En Avenida Austria, en pleno ${NEGOCIO.zona}.`, `On Avenida Austria, in the heart of ${NEGOCIO.zona}.`)}</p></div>
    <div class="visita">
      <div class="datos">
        <div class="dato"><h3>${L("Dirección", "Address")}</h3><address>${NEGOCIO.direccion}<br>${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.provincia}</address></div>
        <div class="dato"><h3>${L("Teléfono", "Phone")}</h3><p><a href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a></p></div>
        <div class="dato"><h3>${L("Horario", "Opening hours")}</h3>${horarioTabla()}</div>
        <div class="datos__acc">
          <a class="btn ${oscura ? "btn--reserva" : "btn--pista"}" href="${NEGOCIO.mapsComoLlegar}" target="_blank" rel="noopener">${I.ruta}${L("Cómo llegar", "Get directions")}</a>
          <a class="btn btn--borde" href="${u("/escribenos")}">${L("Te llamamos nosotros", "We'll call you")}</a>
        </div>
      </div>
      <div class="mapa" data-src="${NEGOCIO.mapsEmbed}">
        <div class="mapa__aviso">
          ${LINEAS_PISTA}
          <button class="btn btn--reserva" type="button" data-cargar-mapa>${I.ruta}${L("Ver mapa", "Show map")}</button>
          <p>${L("El mapa se carga desde Google Maps al pulsar el botón.", "The map loads from Google Maps when you tap the button.")}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

const tira = (lista, grupo = "tira") => `<div class="tira" role="list">${lista.map((o) => `<button type="button" role="listitem" data-visor="${grupo}" aria-label="${L("Ampliar", "Enlarge")}: ${esc(o.alt)}">${img(o, { sizes: "(max-width:720px) 78vw, 30vw" })}</button>`).join("")}</div>`;

const filaDeporte = (href, num, h, p, ir, foto) =>
  `<a class="deporte" href="${u(href)}"><span class="deporte__num" aria-hidden="true">${num}</span><div class="deporte__txt"><h3>${h}</h3><p>${p}</p><span class="deporte__ir">${ir}</span></div><div class="deporte__foto">${img(foto, { sizes: "(max-width:760px) 100vw, 34vw" })}</div></a>`;

const deportes = (fotos) => `<div class="deportes">
  ${filaDeporte("/es/pista-de-tenis-costa-adeje", 3, L("Pistas de tenis", "Tennis courts"), L("Pistas descubiertas para individuales o dobles.", "Outdoor courts for singles or doubles."), L("Ver tenis", "See tennis"), fotos[0])}
  ${filaDeporte("/es/pistas-de-padel-costa-adeje", 3, L("Pistas de pádel", "Padel courts"), L("Pistas descubiertas y acristaladas.", "Outdoor glass-walled courts."), L("Ver pádel", "See padel"), fotos[1])}
  ${filaDeporte("/es/pistas-squash-costa-adeje", 2, L("Pistas de squash y racquetball", "Squash and racquetball courts"), L("Para partidos rápidos e intensos.", "For fast, intense matches."), L("Ver squash", "See squash"), fotos[2])}
</div>`;

const extrasLista = () => ({
  gym: `<div class="extra"><a href="${u("/es/ofertas-de-gimnasios-costa-adeje")}">${I.pesa}<h3>${L("Gimnasio y crossfit", "Gym and CrossFit")}</h3></a><p>${L("Zona de cardio y pesas, y entrenamientos de crossfit en grupo.", "Cardio and weights area, plus group CrossFit sessions.")}</p></div>`,
  circuito: `<div class="extra">${I.circuito}<h3>${L("Circuito", "Circuit")}</h3><p>${L("Circuito de entrenamiento dentro de las instalaciones.", "A training circuit inside the centre.")}</p></div>`,
  artes: `<div class="extra">${I.artes}<h3>${L("Club de artes marciales", "Martial arts club")}</h3><p>${L("El club de artes marciales entrena en el centro.", "The martial arts club trains at the centre.")}</p></div>`,
  ninos: `<div class="extra">${I.ninos}<h3>${L("Parque infantil", "Children's playground")}</h3><p>${L("Los peques juegan mientras los mayores entrenan.", "Kids play while the grown-ups train.")}</p></div>`,
  tienda: `<div class="extra">${I.tienda}<h3>${L("Artículos para gym", "Gym equipment")}</h3><p>${L("Material deportivo disponible en el centro.", "Sports gear available at the centre.")}</p></div>`,
});

/* ---------------- Páginas (se generan una vez por idioma) ---------------- */
function construir() {
  const P = {};

  /* INICIO */
  P["/"] = pagina({
    ruta: "/",
    titulo: L("Centro Deportivo Tenisur | Tenis, pádel y squash en Costa Adeje", "Centro Deportivo Tenisur | Tennis, padel and squash in Costa Adeje"),
    desc: L("Centro Deportivo Tenisur en Costa Adeje: pistas de tenis, pádel y squash, gimnasio, crossfit, restaurante y parque infantil. Reserva tu pista online.", "Centro Deportivo Tenisur in Costa Adeje: tennis, padel and squash courts, gym, CrossFit, restaurant and playground. Book your court online."),
    cuerpo: `
<section class="hero" aria-labelledby="t-hero">
  <div class="hero__foto"><picture><source srcset="/img/hero-atardecer.webp" type="image/webp"><img src="/img/hero-atardecer.jpg" alt="${L("Pistas de tenis y pádel de Tenisur al atardecer", "Tenisur tennis and padel courts at sunset")}" width="1127" height="1396" fetchpriority="high" decoding="async"></picture></div>
  <svg class="hero__lineas" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
    <line class="trazo" pathLength="1" x1="0" y1="430" x2="1000" y2="430"/>
    <line class="trazo t2" pathLength="1" x1="620" y1="0" x2="620" y2="600"/>
    <line class="trazo t3" pathLength="1" x1="620" y1="215" x2="1000" y2="215"/>
    <line class="trazo t4" pathLength="1" x1="810" y1="215" x2="810" y2="430"/>
  </svg>
  <div class="contenedor hero__in">
    ${estadoChip()}
    <h1 id="t-hero">${L("Tenis, pádel y squash en Costa Adeje", "Tennis, padel and squash in Costa Adeje")}</h1>
    <p class="hero__sub">${L("Pistas, gimnasio, restaurante y parque infantil en un mismo club, en el sur de Tenerife.", "Courts, gym, restaurant and playground in one club in the south of Tenerife.")}</p>
    <div class="hero__acciones">
      <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}${L("Reservar pista", "Book a court")}${nuevaPestana()}</a>
      <a class="btn btn--borde btn--grande" href="${NEGOCIO.telHref}">${I.tel}${L("Llamar", "Call")}</a>
    </div>
  </div>
</section>

<section class="seccion seccion--blanca" aria-labelledby="t-deportes">
  <div class="contenedor">
    <div class="seccion__cab"><h2 id="t-deportes">${L("Pistas para cada raqueta", "A court for every racket")}</h2><p>${L("Juega solo, en pareja o con el grupo de siempre. Todas se reservan online.", "Play singles, doubles or with your usual group. Every court can be booked online.")}</p></div>
    ${deportes([IMG.tenis1, IMG.padel1, IMG.centro])}
  </div>
</section>

<section class="seccion" aria-labelledby="t-mas">
  <div class="contenedor">
    <div class="seccion__cab"><h2 id="t-mas">${L("Y además", "And more")}</h2><p>${L("Todo lo que necesitas para entrenar y pasar el día.", "Everything you need to train and spend the day.")}</p></div>
    <div class="extras">${Object.values(extrasLista()).join("")}</div>
  </div>
</section>

<section class="seccion seccion--oscura" aria-labelledby="t-comer">
  <div class="contenedor">
    <div class="duo">
      <div class="duo__foto">${img(IMG.restaurante, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
      <div class="duo__txt">
        <h2 id="t-comer">${L("Restaurante abierto todos los días", "Restaurant open every day")}</h2>
        <p>${L("Amplia carta de especialidades, menús y platos combinados, elaborados con productos frescos y de primera calidad. Con terrazas y espacios abiertos.", "A wide menu of specialities, set menus and combo plates, made with fresh, top-quality produce. With terraces and open-air spaces.")}</p>
        <a class="btn btn--reserva" href="${u("/producto/restaurante")}">${L("Ver el restaurante", "See the restaurant")}</a>
      </div>
    </div>
    <div class="duo duo--inv">
      <div class="duo__foto">${img(IMG.kiosco, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
      <div class="duo__txt">
        <h2>${L("Kiosco y barbacoa al aire libre", "Open-air kiosk and barbecue")}</h2>
        <p>${L("Comida a precios económicos para aprovechar las tardes y noches de verano con amigos y familia.", "Affordable food to enjoy summer afternoons and evenings with friends and family.")}</p>
        <ul><li>${L("Terraza y terraza cubierta", "Terrace and covered terrace")}</li><li>${L("Zona chill out", "Chill-out area")}</li><li>${L("Parque infantil al lado", "Playground right next to it")}</li></ul>
        <a class="btn btn--borde" href="${u("/producto/kiosco-y-barbacoa")}">${L("Ver el kiosco", "See the kiosk")}</a>
      </div>
    </div>
  </div>
</section>

<section class="seccion" aria-labelledby="t-galeria">
  <div class="contenedor">
    <div class="seccion__cab seccion__cab--fila"><div><h2 id="t-galeria">${L("Así es Tenisur", "Inside Tenisur")}</h2></div><a class="enlace" href="${u("/galeria")}">${L("Ver toda la galería", "See the full gallery")}</a></div>
    ${tira([IMG.padel2, IMG.tenis2, IMG.bar, IMG.parque, IMG.instalaciones, IMG.restauranteP], "inicio")}
  </div>
</section>

${bloqueReserva()}

<section class="seccion seccion--blanca" aria-labelledby="t-opiniones" style="padding-bottom:0">
  <div class="contenedor">
    <div class="seccion__cab seccion__cab--fila">
      <div><h2 id="t-opiniones">${L("¿Ya nos conoces?", "Been here before?")}</h2><p style="margin-top:12px">${L("Cuéntanos qué tal tu experiencia. Tu opinión ayuda a otros jugadores.", "Tell us how it went. Your review helps other players.")}</p></div>
      <div class="opiniones">
        <a class="btn btn--pista" href="${NEGOCIO.opinionGoogle}" target="_blank" rel="noopener">${L("Opinar en Google", "Review us on Google")}</a>
        <a class="btn btn--borde" href="${NEGOCIO.opinionFacebook}" target="_blank" rel="noopener">${I.fb}${L("Opinar en Facebook", "Review us on Facebook")}</a>
      </div>
    </div>
  </div>
</section>
${visita()}
`,
  });

  /* INSTALACIONES */
  const migInst = [{ name: L("Servicios", "Services"), href: "/servicios" }, { name: L("Instalaciones deportivas", "Sports facilities") }];
  const ex = extrasLista();
  P["/producto/instalaciones-deportivas"] = pagina({
    ruta: "/producto/instalaciones-deportivas",
    titulo: L("Instalaciones deportivas | Centro Deportivo Tenisur, Costa Adeje", "Sports facilities | Centro Deportivo Tenisur, Costa Adeje"),
    desc: L("Tres pistas de tenis, tres de pádel, dos de squash y racquetball, circuito, crossfit y gimnasio en Costa Adeje.", "Three tennis courts, three padel courts, two squash and racquetball courts, circuit, CrossFit and gym in Costa Adeje."),
    migas: migInst,
    cuerpo: `${cabPagina({ h1: L("Instalaciones deportivas", "Sports facilities"), sub: L("Unas instalaciones donde todo el mundo encuentra su manera de hacer deporte.", "Facilities where everyone finds their own way to play sport."), foto: IMG.instalaciones, migas: migInst })}
<section class="seccion seccion--blanca"><div class="contenedor">${deportes([IMG.tenis2, IMG.padel2, IMG.centro])}</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab"><h2>${L("Entrenar fuera de la pista", "Training off the court")}</h2></div>
  <div class="extras">${ex.gym}${ex.circuito}${ex.artes}${ex.tienda}</div>
  <p style="margin-top:32px;font-size:var(--t-l)">${L("Ven y conoce nuestras instalaciones.", "Come and see our facilities.")}</p>
</div></section>
${bloqueReserva()}
${visita(true)}`,
  });

  /* RESTAURANTE */
  const migRest = [{ name: L("Servicios", "Services"), href: "/servicios" }, { name: L("Restaurante", "Restaurant") }];
  P["/producto/restaurante"] = pagina({
    ruta: "/producto/restaurante",
    titulo: L("Restaurante en Costa Adeje | Centro Deportivo Tenisur", "Restaurant in Costa Adeje | Centro Deportivo Tenisur"),
    desc: L("Restaurante abierto todos los días en Costa Adeje: especialidades, menús y platos combinados con productos frescos, con terrazas y espacios abiertos.", "Restaurant open every day in Costa Adeje: specialities, set menus and combo plates with fresh produce, plus terraces and open-air spaces."),
    migas: migRest,
    cuerpo: `${cabPagina({ h1: L("Restaurante", "Restaurant"), sub: L("Abierto todos los días, con terrazas y espacios abiertos.", "Open every day, with terraces and open-air spaces."), foto: IMG.restaurante, migas: migRest })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__foto">${img(IMG.restauranteP, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
    <div class="duo__txt">
      <h2>${L("Cocina después del partido", "Food after the match")}</h2>
      <p>${L("Nuestro restaurante abre todos los días y ofrece una amplia carta de especialidades, menús y platos combinados.", "Our restaurant is open every day with a wide menu of specialities, set menus and combo plates.")}</p>
      <p>${L("Todos nuestros platos están elaborados con productos frescos y de primera calidad.", "Every dish is made with fresh, top-quality produce.")}</p>
      <ul><li>${L("Terraza", "Terrace")}</li><li>${L("Terraza cubierta", "Covered terrace")}</li><li>${L("Zona chill out", "Chill-out area")}</li></ul>
      <p><strong>${L("¡Ven a conocernos!", "Come and see us!")}</strong></p>
      <a class="btn btn--pista" href="${NEGOCIO.telHref}">${I.tel}${L("Llamar al", "Call")} ${NEGOCIO.telefono}</a>
    </div>
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab"><h2>${L("El ambiente", "The atmosphere")}</h2></div>
  ${tira([IMG.restaurante, IMG.bar, IMG.restauranteP, IMG.kiosco, IMG.parque], "restaurante")}
</div></section>
${visita(true)}`,
  });

  /* KIOSCO */
  const migKio = [{ name: L("Servicios", "Services"), href: "/servicios" }, { name: L("Kiosco y barbacoa", "Kiosk and barbecue") }];
  P["/producto/kiosco-y-barbacoa"] = pagina({
    ruta: "/producto/kiosco-y-barbacoa",
    titulo: L("Kiosco y barbacoa | Centro Deportivo Tenisur, Costa Adeje", "Kiosk and barbecue | Centro Deportivo Tenisur, Costa Adeje"),
    desc: L("Kiosco al aire libre con comida a precios económicos, terraza, terraza cubierta y chill out. Ideal para tardes de verano en familia.", "Open-air kiosk with affordable food, terrace, covered terrace and chill-out area. Perfect for summer evenings with the family."),
    migas: migKio,
    cuerpo: `${cabPagina({ h1: L("Kiosco y barbacoa", "Kiosk and barbecue"), sub: L("Comida a precios económicos al aire libre.", "Affordable food in the open air."), foto: IMG.kiosco, migas: migKio })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__foto">${img(IMG.parque, { sizes: "(max-width:820px) 100vw, 50vw" })}</div>
    <div class="duo__txt">
      <h2>${L("Tardes de verano en familia", "Summer evenings with the family")}</h2>
      <p>${L("Tenisur cuenta con un kiosco al aire libre donde ofrecemos comida a precios económicos.", "Tenisur has an open-air kiosk serving affordable food.")}</p>
      <p>${L("En el kiosco los peques podrán comer mientras los mayores disfrutan de una velada tranquila. Un lugar fantástico para aprovechar las tardes y noches de verano con los amigos y la familia.", "Kids can eat at the kiosk while the grown-ups enjoy a relaxed evening. A great spot for summer afternoons and nights with friends and family.")}</p>
      <ul><li>${L("Terraza", "Terrace")}</li><li>${L("Terraza cubierta", "Covered terrace")}</li><li>Chill out</li></ul>
      <a class="btn btn--pista" href="${NEGOCIO.telHref}">${I.tel}${L("Consultar por teléfono", "Ask us by phone")}</a>
    </div>
  </div>
</div></section>
${visita(true)}`,
  });

  /* SERVICIOS (y /productos) */
  const listaServicios = (ruta, h1) => {
    const mig = [{ name: h1 }];
    return pagina({
      ruta,
      titulo: `${h1} | Centro Deportivo Tenisur, Costa Adeje`,
      desc: L("Instalaciones deportivas (tenis, pádel, squash, gimnasio y crossfit), restaurante y kiosco con barbacoa en Costa Adeje.", "Sports facilities (tennis, padel, squash, gym and CrossFit), restaurant and kiosk with barbecue in Costa Adeje."),
      migas: mig,
      cuerpo: `${cabPagina({ h1, sub: L("Deporte, comida y un sitio para quedarse toda la tarde.", "Sport, food and a place to stay all afternoon."), foto: IMG.centro, migas: mig })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__foto">${img(IMG.instalaciones, { sizes: "50vw" })}</div>
    <div class="duo__txt"><h2>${L("Instalaciones deportivas", "Sports facilities")}</h2><p>${L("Tenis, pádel, squash y racquetball, circuito, crossfit y gimnasio.", "Tennis, padel, squash and racquetball, circuit, CrossFit and gym.")}</p><a class="btn btn--pista" href="${u("/producto/instalaciones-deportivas")}">${L("Ver instalaciones", "See facilities")}</a></div>
  </div>
  <div class="duo duo--inv">
    <div class="duo__foto">${img(IMG.restauranteP, { sizes: "50vw" })}</div>
    <div class="duo__txt"><h2>${L("Restaurante", "Restaurant")}</h2><p>${L("Especialidades, menús y platos combinados, todos los días.", "Specialities, set menus and combo plates, every day.")}</p><a class="btn btn--pista" href="${u("/producto/restaurante")}">${L("Ver restaurante", "See restaurant")}</a></div>
  </div>
  <div class="duo">
    <div class="duo__foto">${img(IMG.kiosco, { sizes: "50vw" })}</div>
    <div class="duo__txt"><h2>${L("Kiosco y barbacoa", "Kiosk and barbecue")}</h2><p>${L("Comida económica al aire libre, terrazas y chill out.", "Affordable open-air food, terraces and chill-out area.")}</p><a class="btn btn--pista" href="${u("/producto/kiosco-y-barbacoa")}">${L("Ver kiosco", "See kiosk")}</a></div>
  </div>
</div></section>
${bloqueReserva()}`,
    });
  };
  P["/servicios"] = listaServicios("/servicios", L("Productos y servicios", "Products and services"));
  P["/productos"] = listaServicios("/productos", L("Servicios", "Services"));

  /* Páginas por deporte */
  const otros = [
    ["/es/pistas-de-padel-costa-adeje", L("Pistas de pádel", "Padel courts")],
    ["/es/pista-de-tenis-costa-adeje", L("Pistas de tenis", "Tennis courts")],
    ["/es/pistas-squash-costa-adeje", L("Pistas de squash", "Squash courts")],
    ["/es/ofertas-de-gimnasios-costa-adeje", L("Gimnasio y crossfit", "Gym and CrossFit")],
  ];
  function paginaDeporte({ ruta, h1, titulo, desc, sub, foto, intro, puntos, fotos, video = false, cta }) {
    const mig = [{ name: L("Instalaciones", "Facilities"), href: "/producto/instalaciones-deportivas" }, { name: h1 }];
    return pagina({
      ruta, titulo, desc, migas: mig,
      cuerpo: `${cabPagina({ h1, sub, foto, migas: mig })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__txt">
      <h2>${intro.h}</h2>
      ${intro.p.map((t) => `<p>${t}</p>`).join("")}
      <ul>${puntos.map((t) => `<li>${t}</li>`).join("")}</ul>
      <a class="btn btn--reserva btn--grande" ${extReserva}>${I.cal}${cta}${nuevaPestana()}</a>
    </div>
    ${video
      ? `<div class="video"><video controls playsinline preload="none" poster="${foto.src}" aria-label="${L("Vídeo de las instalaciones de Tenisur", "Video of the Tenisur facilities")}"><source src="${VIDEO}" type="video/mp4"></video></div>`
      : `<div class="duo__foto">${img(fotos[0], { sizes: "(max-width:820px) 100vw, 50vw" })}</div>`}
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab"><h2>${L("Fotos", "Photos")}</h2></div>
  ${tira(fotos, ruta)}
</div></section>
<section class="seccion seccion--blanca" style="padding-top:0"><div class="contenedor">
  <div class="seccion__cab" style="margin-bottom:24px"><h2 style="font-size:var(--t-xl)">${L("Otros deportes en Tenisur", "More sports at Tenisur")}</h2></div>
  <p>${otros.filter(([h]) => h !== ruta).map(([h, t]) => `<a class="enlace" href="${u(h)}">${t}</a>`).join(" &nbsp;·&nbsp; ")}</p>
</div></section>
${bloqueReserva()}
${visita(true)}`,
    });
  }

  P["/es/pistas-de-padel-costa-adeje"] = paginaDeporte({
    ruta: "/es/pistas-de-padel-costa-adeje",
    h1: L("Pistas de pádel en Costa Adeje", "Padel courts in Costa Adeje"),
    titulo: L("Pistas de pádel en Costa Adeje | Centro Deportivo Tenisur", "Padel courts in Costa Adeje | Centro Deportivo Tenisur"),
    desc: L("Tres pistas de pádel descubiertas y acristaladas en Costa Adeje. Reserva online en Centro Deportivo Tenisur.", "Three outdoor glass-walled padel courts in Costa Adeje. Book online at Centro Deportivo Tenisur."),
    sub: L("Tres pistas descubiertas y acristaladas.", "Three outdoor glass-walled courts."),
    foto: IMG.padel1,
    intro: { h: L("Juega al pádel en el sur de Tenerife", "Play padel in the south of Tenerife"), p: [L("En Centro Deportivo Tenisur tienes tres pistas de pádel descubiertas y acristaladas para jugar con tus amigos.", "Centro Deportivo Tenisur has three outdoor glass-walled padel courts to play with your friends."), L("Después del partido, el restaurante, la barbacoa y la zona infantil están a unos pasos.", "After the match, the restaurant, barbecue and playground are just a few steps away.")] },
    puntos: [L("3 pistas descubiertas y acristaladas", "3 outdoor glass-walled courts"), L("Reserva online o por teléfono", "Book online or by phone"), L("Restaurante, barbacoa y zona infantil", "Restaurant, barbecue and playground")],
    fotos: [IMG.padel1, IMG.padel2, IMG.centro, IMG.bar],
    video: true,
    cta: L("Reservar pista de pádel", "Book a padel court"),
  });
  P["/es/pista-de-tenis-costa-adeje"] = paginaDeporte({
    ruta: "/es/pista-de-tenis-costa-adeje",
    h1: L("Pistas de tenis en Costa Adeje", "Tennis courts in Costa Adeje"),
    titulo: L("Pistas de tenis en Costa Adeje | Centro Deportivo Tenisur", "Tennis courts in Costa Adeje | Centro Deportivo Tenisur"),
    desc: L("Tres pistas de tenis descubiertas en Costa Adeje para individuales o dobles. Reserva online en Centro Deportivo Tenisur.", "Three outdoor tennis courts in Costa Adeje for singles or doubles. Book online at Centro Deportivo Tenisur."),
    sub: L("Tres pistas descubiertas para individuales o dobles.", "Three outdoor courts for singles or doubles."),
    foto: IMG.tenisPano,
    intro: { h: L("Tenis al aire libre", "Outdoor tennis"), p: [L("Nuestras pistas de tenis descubiertas están preparadas para partidos individuales o de dobles.", "Our outdoor tennis courts are ready for singles or doubles matches."), L("Reserva tu turno online y ven a jugar con el clima del sur de Tenerife.", "Book your slot online and come and play in the southern Tenerife sunshine.")] },
    puntos: [L("3 pistas descubiertas", "3 outdoor courts"), L("Individuales o dobles", "Singles or doubles"), L("Reserva online o por teléfono", "Book online or by phone")],
    fotos: [IMG.tenisPano, IMG.tenis1, IMG.tenis2, IMG.centro],
    cta: L("Reservar pista de tenis", "Book a tennis court"),
  });
  P["/es/pistas-squash-costa-adeje"] = paginaDeporte({
    ruta: "/es/pistas-squash-costa-adeje",
    h1: L("Pistas de squash en Costa Adeje", "Squash courts in Costa Adeje"),
    titulo: L("Pistas de squash en Costa Adeje | Centro Deportivo Tenisur", "Squash courts in Costa Adeje | Centro Deportivo Tenisur"),
    desc: L("Dos pistas de squash y racquetball en Costa Adeje. Reserva en Centro Deportivo Tenisur.", "Two squash and racquetball courts in Costa Adeje. Book at Centro Deportivo Tenisur."),
    sub: L("Dos pistas de squash y racquetball.", "Two squash and racquetball courts."),
    foto: IMG.centro,
    intro: { h: L("Squash y racquetball", "Squash and racquetball"), p: [L("En Tenisur tienes dos pistas de squash y racquetball para partidos rápidos e intensos.", "Tenisur has two squash and racquetball courts for fast, intense matches."), L("Después del partido, el restaurante y la terraza están a unos pasos.", "After the match, the restaurant and terrace are just a few steps away.")] },
    puntos: [L("2 pistas de squash y racquetball", "2 squash and racquetball courts"), L("Restaurante y terraza al lado", "Restaurant and terrace next door"), L("Reserva online o por teléfono", "Book online or by phone")],
    fotos: [IMG.centro, IMG.instalaciones, IMG.bar, IMG.parque],
    cta: L("Reservar pista de squash", "Book a squash court"),
  });
  P["/es/ofertas-de-gimnasios-costa-adeje"] = paginaDeporte({
    ruta: "/es/ofertas-de-gimnasios-costa-adeje",
    h1: L("Gimnasio y crossfit en Costa Adeje", "Gym and CrossFit in Costa Adeje"),
    titulo: L("Gimnasio y crossfit en Costa Adeje | Centro Deportivo Tenisur", "Gym and CrossFit in Costa Adeje | Centro Deportivo Tenisur"),
    desc: L("Gimnasio con zona de cardio y pesas y crossfit en comunidad en Costa Adeje. Amplio espacio, parque infantil y bar.", "Gym with cardio and weights area plus community CrossFit in Costa Adeje. Plenty of space, playground and bar."),
    sub: L("Cardio, pesas y crossfit en un espacio amplio.", "Cardio, weights and CrossFit in a spacious setting."),
    foto: IMG.instalaciones,
    intro: { h: L("Entrena a tu manera", "Train your way"), p: [L("Crossfit: entrenamiento de alta intensidad en comunidad, con objetivos personales y compitiendo contigo mismo o con tus compañeros.", "CrossFit: high-intensity training in a community, with personal goals, competing against yourself or your training partners."), L("Gimnasio tradicional: zona de cardio y pesas para ganar masa muscular o perder peso. Una amplia superficie para entrenar con menos aglomeraciones.", "Traditional gym: cardio and weights area to build muscle or lose weight. A large space so you can train without the crowds.")] },
    puntos: [L("Crossfit en grupo", "Group CrossFit"), L("Zona de cardio y pesas", "Cardio and weights area"), L("Parque infantil y bar en el centro", "Playground and bar on site")],
    fotos: [IMG.instalaciones, IMG.centro, IMG.parque, IMG.bar],
    cta: L("Consultar en reservas", "Check in bookings"),
  });

  /* GALERÍA */
  const migGal = [{ name: L("Galería", "Gallery") }];
  P["/galeria"] = pagina({
    ruta: "/galeria",
    titulo: L("Galería de imágenes | Centro Deportivo Tenisur, Costa Adeje", "Photo gallery | Centro Deportivo Tenisur, Costa Adeje"),
    desc: L("Fotos de las pistas de tenis, pádel y squash, el restaurante, el kiosco y el parque infantil de Centro Deportivo Tenisur.", "Photos of the tennis, padel and squash courts, restaurant, kiosk and playground at Centro Deportivo Tenisur."),
    migas: migGal,
    cuerpo: `${cabPagina({ h1: L("Galería", "Gallery"), sub: L("Pistas, restaurante y zonas comunes del club.", "Courts, restaurant and the club's common areas."), migas: migGal })}
<section class="seccion"><div class="contenedor">
  <div class="galeria">${GALERIA().map((o) => `<button type="button" data-visor="galeria" aria-label="${L("Ampliar", "Enlarge")}: ${esc(o.alt)}">${img(o, { sizes: "(max-width:720px) 50vw, 33vw" })}</button>`).join("")}</div>
  <p style="margin-top:32px"><a class="enlace" href="${u("/videos")}">${L("Ver los vídeos", "Watch the videos")}</a></p>
</div></section>
${bloqueReserva()}`,
  });

  /* VÍDEOS */
  const migVid = [{ name: L("Galería", "Gallery"), href: "/galeria" }, { name: L("Vídeos", "Videos") }];
  P["/videos"] = pagina({
    ruta: "/videos",
    titulo: L("Vídeos | Centro Deportivo Tenisur, Costa Adeje", "Videos | Centro Deportivo Tenisur, Costa Adeje"),
    desc: L("Vídeo de las instalaciones de Centro Deportivo Tenisur en Costa Adeje.", "Video of the Centro Deportivo Tenisur facilities in Costa Adeje."),
    migas: migVid,
    cuerpo: `${cabPagina({ h1: L("Vídeos", "Videos"), sub: L("Un vistazo a las instalaciones.", "A look around the facilities."), migas: migVid })}
<section class="seccion"><div class="contenedor">
  <div class="video" style="max-width:960px"><video controls playsinline preload="metadata" poster="${IMG.padel1.src}" aria-label="${L("Vídeo de las instalaciones de Tenisur", "Video of the Tenisur facilities")}"><source src="${VIDEO}" type="video/mp4">${L("Tu navegador no puede reproducir este vídeo.", "Your browser can't play this video.")} <a href="${VIDEO}">${L("Descárgalo aquí", "Download it here")}</a>.</video></div>
  <p style="margin-top:24px">${L("Más vídeos en nuestro", "More videos on our")} <a class="enlace" href="${NEGOCIO.instagram}" target="_blank" rel="noopener">Instagram</a>.</p>
</div></section>`,
  });

  /* CONÓCENOS */
  const migSab = [{ name: L("Conócenos", "About us") }];
  P["/saber-mas"] = pagina({
    ruta: "/saber-mas",
    titulo: L("Conócenos | Centro Deportivo Tenisur, Costa Adeje", "About us | Centro Deportivo Tenisur, Costa Adeje"),
    desc: L("Centro Deportivo Tenisur, en Costa Adeje (Tenerife): tenis, pádel, squash, crossfit, gimnasio, restaurante y zona infantil.", "Centro Deportivo Tenisur in Costa Adeje, Tenerife: tennis, padel, squash, CrossFit, gym, restaurant and playground."),
    migas: migSab,
    cuerpo: `${cabPagina({ h1: L("Conócenos", "About us"), sub: L("Un club de barrio en Costa Adeje para hacer deporte y quedarse.", "A neighbourhood club in Costa Adeje to play sport and stay a while."), foto: IMG.tenisPano, migas: migSab })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="duo">
    <div class="duo__txt">
      <h2>${L("Qué es Tenisur", "What is Tenisur")}</h2>
      <p>${L("Centro Deportivo Tenisur está en Costa Adeje, en el sur de Tenerife. Tiene instalaciones para tenis, pádel, squash, racquetball y crossfit, gimnasio y circuito.", "Centro Deportivo Tenisur is in Costa Adeje, in the south of Tenerife. It has facilities for tennis, padel, squash, racquetball and CrossFit, plus a gym and training circuit.")}</p>
      <p>${L("Fuera de la pista, el restaurante abre todos los días, y el kiosco con barbacoa, las terrazas y el parque infantil hacen que muchas familias pasen aquí la tarde.", "Off the court, the restaurant is open every day, and the kiosk with barbecue, the terraces and the playground mean many families spend the afternoon here.")}</p>
      <a class="btn btn--pista" href="${u("/producto/instalaciones-deportivas")}">${L("Ver instalaciones", "See facilities")}</a>
    </div>
    <div class="duo__foto">${img(IMG.centro, { sizes: "50vw" })}</div>
  </div>
</div></section>
<section class="seccion"><div class="contenedor">
  <div class="seccion__cab seccion__cab--fila"><div><h2>${L("Fotos del club", "Club photos")}</h2></div><a class="enlace" href="${u("/galeria")}">${L("Ver galería", "See gallery")}</a></div>
  ${tira([IMG.padel1, IMG.tenis1, IMG.restaurante, IMG.parque, IMG.bar], "saber")}
</div></section>
${visita(true)}`,
  });

  /* CONTACTO */
  const migCon = [{ name: L("Contacto", "Contact") }];
  P["/contacto"] = pagina({
    ruta: "/contacto",
    titulo: L("Contacto | Centro Deportivo Tenisur, Costa Adeje", "Contact | Centro Deportivo Tenisur, Costa Adeje"),
    desc: L("Llama al 675 021 499 o visítanos en Avenida Austria 9, Adeje. Horario: L-V 08:30-22:30, S-D 08:30-15:30.", "Call +34 675 021 499 or visit us at Avenida Austria 9, Adeje. Hours: Mon-Fri 08:30-22:30, Sat-Sun 08:30-15:30."),
    migas: migCon,
    cuerpo: `${cabPagina({ h1: L("Contacto", "Contact"), sub: L("Llámanos, escríbenos por WhatsApp o ven a vernos.", "Call us, message us on WhatsApp or come and see us."), migas: migCon })}
<section class="seccion seccion--blanca"><div class="contenedor">
  ${estadoChip("background:var(--cal);color:var(--texto)")}
  <div class="extras" style="margin-top:8px">
    <div class="extra">${I.tel}<h3>${L("Teléfono", "Phone")}</h3><p><a class="enlace" href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a></p></div>
    <div class="extra">${I.wa}<h3>WhatsApp</h3><p><a class="enlace" href="https://wa.me/${NEGOCIO.whatsapp}" target="_blank" rel="noopener">${L("Enviar mensaje", "Send a message")}</a></p></div>
    <div class="extra">${I.cal}<h3>${L("Reservas de pista", "Court bookings")}</h3><p><a class="enlace" ${extReserva}>tenisur.taykus.com</a></p></div>
    <div class="extra">${I.tel}<h3>${L("¿Prefieres que te llamemos?", "Prefer us to call you?")}</h3><p><a class="enlace" href="${u("/escribenos")}">${L("Déjanos tu teléfono", "Leave your number")}</a></p></div>
  </div>
</div></section>
${visita()}`,
  });

  /* ESCRÍBENOS */
  const migEsc = [{ name: L("Contacto", "Contact"), href: "/contacto" }, { name: L("Te llamamos", "We'll call you") }];
  P["/escribenos"] = pagina({
    ruta: "/escribenos",
    titulo: L("Te llamamos | Centro Deportivo Tenisur", "We'll call you | Centro Deportivo Tenisur"),
    desc: L("Déjanos tu nombre y teléfono y te llamamos.", "Leave your name and phone number and we'll call you."),
    migas: migEsc,
    cuerpo: `${cabPagina({ h1: L("Te llamamos nosotros", "We'll call you"), sub: L("Déjanos tu nombre y teléfono. Se abrirá WhatsApp con el mensaje listo para enviar.", "Leave your name and number. WhatsApp will open with the message ready to send."), migas: migEsc })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <form class="form" id="form-llamada" novalidate data-whatsapp="${NEGOCIO.whatsapp}">
    <div class="aviso aviso--error" id="form-ko" role="alert"></div>
    <div class="dos-col">
      <div class="campo" data-campo="nombre"><label for="nombre">${L("Nombre", "Name")}</label><input id="nombre" name="nombre" autocomplete="name" required><span class="campo__error"></span></div>
      <div class="campo" data-campo="telefono"><label for="telefono">${L("Teléfono", "Phone")}</label><input id="telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required><span class="campo__error"></span></div>
    </div>
    <div class="dos-col">
      <div class="campo"><label for="motivo">${L("Motivo", "Reason")}</label>
        <select id="motivo" name="motivo"><option value="">${L("Elige una opción", "Choose an option")}</option><option>${L("Reserva de pista", "Court booking")}</option><option>${L("Gimnasio o crossfit", "Gym or CrossFit")}</option><option>${L("Restaurante", "Restaurant")}</option><option>${L("Kiosco y barbacoa", "Kiosk and barbecue")}</option><option>${L("Otro", "Other")}</option></select></div>
      <div class="campo"><label for="franja">${L("Mejor momento para llamarte", "Best time to call you")}</label>
        <select id="franja" name="franja"><option value="">${L("Cualquier momento", "Any time")}</option><option>${L("Por la mañana", "In the morning")}</option><option>${L("Por la tarde", "In the afternoon")}</option><option>${L("Por la noche", "In the evening")}</option></select></div>
    </div>
    <div class="campo"><label for="mensaje">${L("Mensaje", "Message")} <span class="ayuda">${L("(opcional)", "(optional)")}</span></label><textarea id="mensaje" name="mensaje" maxlength="600"></textarea></div>
    <label class="check"><input type="checkbox" id="privacidad" name="privacidad" required><span>${L("He leído y acepto la", "I have read and accept the")} <a class="enlace" href="${u("/politica-de-privacidad")}">${L("política de privacidad", "privacy policy")}</a>.</span></label>
    <div><button class="btn btn--pista btn--grande" type="submit">${I.wa}${L("Enviar por WhatsApp", "Send via WhatsApp")}</button></div>
    <div class="aviso" id="form-ok" role="status" tabindex="-1">${L("Abriendo WhatsApp con tu mensaje. Si no se abre, llámanos al", "Opening WhatsApp with your message. If it doesn't open, call us on")} <a class="enlace" href="${NEGOCIO.telHref}">${NEGOCIO.telefono}</a>.</div>
  </form>
</div></section>`,
  });

  /* LEGALES */
  const legal = (ruta, h1, secciones) => {
    const mig = [{ name: h1 }];
    return pagina({
      ruta, titulo: `${h1} | Centro Deportivo Tenisur`, desc: `${h1} — ${NEGOCIO.nombre}.`, migas: mig, noindex: true,
      cuerpo: `${cabPagina({ h1, migas: mig })}
<section class="seccion seccion--blanca"><div class="contenedor prosa">
  <p class="pendiente">${L("Pendiente: el titular de la web debe completar los datos marcados entre corchetes antes de publicar.", "Pending: the site owner must complete the details in square brackets before publishing.")}</p>
  ${secciones}
</div></section>`,
    });
  };
  const TITULAR = `<ul><li>${L("Titular", "Owner")}: [${L("razón social", "company name")}]</li><li>${L("NIF/CIF", "Tax ID (NIF/CIF)")}: [NIF/CIF]</li><li>${L("Domicilio", "Address")}: ${NEGOCIO.direccion}, ${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.provincia}</li><li>${L("Teléfono", "Phone")}: ${NEGOCIO.telefono}</li><li>${L("Correo electrónico", "Email")}: [${L("email de contacto", "contact email")}]</li></ul>`;
  P["/aviso-legal"] = legal("/aviso-legal", L("Aviso legal", "Legal notice"), L(`
<h2>Datos identificativos</h2><p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico, se informa:</p>${TITULAR}
<h2>Uso del sitio</h2><p>El acceso a esta web es gratuito y atribuye la condición de usuario, que se compromete a hacer un uso adecuado de sus contenidos.</p>
<h2>Propiedad intelectual</h2><p>Los textos, imágenes y logotipos de esta web pertenecen a su titular o se usan con autorización.</p>
<h2>Enlaces externos</h2><p>Las reservas se gestionan en una plataforma externa (tenisur.taykus.com), sujeta a sus propias condiciones.</p>`, `
<h2>Company details</h2><p>In accordance with Spanish Law 34/2002 on Information Society Services and Electronic Commerce:</p>${TITULAR}
<h2>Use of the site</h2><p>Access to this website is free. Users agree to make appropriate use of its content.</p>
<h2>Intellectual property</h2><p>The texts, images and logos on this website belong to the owner or are used with permission.</p>
<h2>External links</h2><p>Bookings are handled on an external platform (tenisur.taykus.com), subject to its own terms.</p>`));
  P["/politica-de-privacidad"] = legal("/politica-de-privacidad", L("Política de privacidad", "Privacy policy"), L(`
<h2>Responsable del tratamiento</h2>${TITULAR}
<h2>Qué datos tratamos y para qué</h2><p>Si usas el formulario «Te llamamos», tus datos (nombre, teléfono y mensaje) se envían a través de WhatsApp para atender tu solicitud y llamarte. No se almacenan en esta web.</p>
<h2>Base legal</h2><p>Tu consentimiento al enviar la solicitud.</p>
<h2>Conservación</h2><p>[Plazo de conservación]</p>
<h2>Tus derechos</h2><p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a [email de contacto]. También puedes reclamar ante la Agencia Española de Protección de Datos.</p>
<h2>Reservas</h2><p>Los datos que facilitas al reservar se tratan en la plataforma de reservas externa según su propia política.</p>`, `
<h2>Data controller</h2>${TITULAR}
<h2>What data we process and why</h2><p>If you use the "We'll call you" form, your details (name, phone and message) are sent via WhatsApp so we can handle your request and call you. They are not stored on this website.</p>
<h2>Legal basis</h2><p>Your consent when you send the request.</p>
<h2>Retention</h2><p>[Retention period]</p>
<h2>Your rights</h2><p>You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to [contact email]. You can also complain to the Spanish Data Protection Agency (AEPD).</p>
<h2>Bookings</h2><p>Data you provide when booking is processed by the external booking platform under its own policy.</p>`));
  P["/politica-de-cookies"] = legal("/politica-de-cookies", L("Política de cookies", "Cookie policy"), L(`
<h2>Cookies propias</h2><p>Esta web no instala cookies propias de seguimiento ni de publicidad.</p>
<h2>Servicios de terceros</h2><ul><li>Google Fonts: sirve la tipografía de la web.</li><li>Google Maps: solo se carga si pulsas «Ver mapa», y entonces Google puede instalar sus cookies.</li><li>Vídeo e imágenes: se sirven desde almacenamiento externo.</li></ul>
<h2>Cómo gestionarlas</h2><p>Puedes bloquear o borrar cookies desde la configuración de tu navegador.</p>`, `
<h2>Our own cookies</h2><p>This website does not set its own tracking or advertising cookies.</p>
<h2>Third-party services</h2><ul><li>Google Fonts: serves the website's typeface.</li><li>Google Maps: only loads if you tap "Show map", at which point Google may set its cookies.</li><li>Video and images: served from external storage.</li></ul>
<h2>Managing cookies</h2><p>You can block or delete cookies in your browser settings.</p>`));
  P["/declaracion-de-accesibilidad"] = legal("/declaracion-de-accesibilidad", L("Declaración de accesibilidad", "Accessibility statement"), L(`
<h2>Compromiso</h2><p>${NEGOCIO.nombre} quiere que su web sea accesible para todas las personas, siguiendo las pautas WCAG 2.1 nivel AA.</p>
<h2>Medidas aplicadas</h2><ul><li>Navegación completa con teclado y foco visible.</li><li>Textos alternativos en las imágenes.</li><li>Contraste de color suficiente.</li><li>Respeto a la preferencia de movimiento reducido.</li></ul>
<h2>Limitaciones conocidas</h2><p>El sistema de reservas es una plataforma externa y su accesibilidad depende de su proveedor.</p>
<h2>Contacto</h2><p>Si encuentras alguna barrera, llámanos al ${NEGOCIO.telefono}.</p>`, `
<h2>Our commitment</h2><p>${NEGOCIO.nombre} wants its website to be accessible to everyone, following WCAG 2.1 level AA.</p>
<h2>Measures in place</h2><ul><li>Full keyboard navigation with visible focus.</li><li>Alternative text on images.</li><li>Sufficient colour contrast.</li><li>Reduced-motion preference respected.</li></ul>
<h2>Known limitations</h2><p>The booking system is an external platform and its accessibility depends on its provider.</p>
<h2>Contact</h2><p>If you find any barrier, call us on ${NEGOCIO.telefono}.</p>`));

  return P;
}

/* ---------------- Escritura ---------------- */
rmSync(DIST, { recursive: true, force: true });
const todas = [];
for (const lang of ["es", "en"]) {
  LANG = lang;
  const P = construir();
  for (const [ruta, html] of Object.entries(P)) {
    const r = enRuta(lang, ruta);
    todas.push({ r, noindex: html.includes('content="noindex') });
    const file = r === "/" ? join(DIST, "index.html") : join(DIST, r, "index.html");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
}

/* 404 bilingüe */
LANG = "es";
writeFileSync(join(DIST, "404.html"), pagina({
  ruta: "/404", titulo: "Página no encontrada · Page not found | Centro Deportivo Tenisur", desc: "La página que buscas no existe.", noindex: true,
  cuerpo: `${cabPagina({ h1: "Esta página no existe", sub: "Puede que la dirección haya cambiado con la nueva web. · This page doesn't exist." })}
<section class="seccion seccion--blanca"><div class="contenedor">
  <div class="hero__acciones"><a class="btn btn--pista" href="/">Ir al inicio</a><a class="btn btn--borde" href="/en" lang="en">English home</a><a class="btn btn--reserva" ${extReserva}>${I.cal}Reservar pista · Book a court</a></div>
</div></section>`,
}).replace(/<link rel="alternate"[^>]*>\n?/g, ""));

copyFileSync("src/styles.css", join(DIST, "styles.css"));
copyFileSync("src/main.js", join(DIST, "main.js"));
cpSync("src/img", join(DIST, "img"), { recursive: true });
writeFileSync(join(DIST, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#ddf247"/><path d="M5 7c6 4 6 14 0 18M27 7c-6 4-6 14 0 18" fill="none" stroke="#0f5e52" stroke-width="2.4"/></svg>`);
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${todas.filter((t) => !t.noindex).map((t) => `  <url><loc>${SITE}${t.r}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Generadas ${todas.length} páginas (es + en) en /${DIST}`);
