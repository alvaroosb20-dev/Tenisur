# Centro Deportivo Tenisur — web nueva

Rediseño completo de centrodeportivotenisur.es (antes en Duda/QDQ). Web estática, sin dependencias, lista para Vercel.

## Publicar en Vercel (desde el iPhone)
1. Crea un repositorio en GitHub (p. ej. `tenisur`) y sube **todo el contenido de esta carpeta** (no la carpeta `dist`, se genera sola).
2. En vercel.com → Add New → Project → importa el repo. Vercel lee `vercel.json` (build `node build.mjs`, salida `dist`). No hace falta configurar nada más.
3. Comprueba la URL `*.vercel.app` y, cuando el cliente dé el visto bueno, apunta el dominio `centrodeportivotenisur.es` a Vercel.

Para editar textos, horarios o fotos: todo está en `build.mjs` (objetos `NEGOCIO`, `IMG` y cada página). Estilos en `src/styles.css`, interacción en `src/main.js`.

## Idiomas
- Español en las rutas de siempre e inglés en las mismas rutas bajo `/en` (p. ej. `/en/producto/restaurante`).
- Selector ES / EN en la cabecera, visible también en móvil. Cada página enlaza a su versión en el otro idioma y lleva `hreflang` para Google.
- Los textos de cada idioma están juntos en `build.mjs` con la forma `L("español", "english")`.

## Pistas en 3D
- Página `/pistas-3d` (y `/en/pistas-3d`) con una maqueta 3D del club hecha a mano en `src/maqueta.js`, sin librerías.
- Se gira con el dedo, se acerca pellizcando y tiene un control de hora del día (día, atardecer y noche con focos).
- Es una recreación aproximada: la colocación de pistas y edificios es orientativa. Si el cliente quiere que coincida con la realidad, hace falta un plano o una foto aérea.
- Botón «Ver las pistas en 3D» en la portada y en Instalaciones.

## Reservas (sin cambios)
- Todos los botones «Reservar» siguen llevando a **https://tenisur.taykus.com/**, el mismo sistema que la web anterior. No se ha tocado Taykus.
- Además, `/reservas` redirige a Taykus.

## Rutas conservadas
`/`, `/servicios`, `/productos`, `/producto/instalaciones-deportivas`, `/producto/restaurante`, `/producto/kiosco-y-barbacoa`, `/galeria`, `/videos`, `/saber-mas`, `/contacto`, `/es/pistas-de-padel-costa-adeje`, `/es/pista-de-tenis-costa-adeje`, `/es/pistas-squash-costa-adeje`, `/es/ofertas-de-gimnasios-costa-adeje`.
Redirecciones: `/escríbenos` → `/escribenos`, `/fotos/img/*` → `/galeria`, `/noticias` y `/blog` → `/saber-mas`, `/conocenos/tour` → `/galeria`.

## Pendiente (necesita al cliente o a ti)
1. **Fotos**: se cargan desde el almacenamiento de Duda. Antes de dar de baja QDQ, descárgalas (URLs en `IMG` de `build.mjs`), súbelas a `/public` o similar y cambia las rutas, o la web se quedará sin imágenes.
2. **Logo**: igual que las fotos, viene del CDN de Duda.
3. **Textos legales**: aviso legal, privacidad y cookies tienen estructura, pero faltan razón social, NIF/CIF, email y plazo de conservación (marcados entre corchetes). Están en `noindex` hasta completarlos.
4. **WhatsApp**: se usa el 675 021 499. Confirmar que ese número tiene WhatsApp.
5. **Formulario «Te llamamos»**: el de Duda enviaba al panel de QDQ. Ahora abre WhatsApp con el mensaje preparado. Si prefieren email, hay que conectar un servicio (Formspree, Resend…).
6. **Datos contradictorios en la web antigua**: unas tarjetas decían 2 pistas de pádel y otras 3; se ha usado 3 (texto principal y página SEO). Confirmar.
7. **Noticias, blog y tour virtual**: no se pudo leer su contenido; ahora redirigen. Si tenían contenido propio, pásamelo y creo las páginas.
8. **Redes**: Instagram @centrodeportivotenisur y facebook.com/tenisur. Confirmar que son las oficiales.
9. Probar en un iPhone y un Android reales una vez publicada.

## Pruebas hechas
- 40 páginas generadas (20 en español y 20 en inglés), revisadas en móvil (390 px) y escritorio (1366 px): sin errores de JavaScript, sin desplazamiento horizontal, un solo `h1` por página, todas las imágenes con `alt`, sin enlaces internos rotos.
- Menú móvil: abre, enfoca el botón de cerrar, se cierra con Escape.
- Formulario: muestra errores si falta algo; con datos válidos abre `wa.me/34675021499` con el mensaje.
- Las fotos, fuentes, mapa y Taykus no se pudieron cargar en el entorno de pruebas (sin acceso a esos dominios); hay que verlos en la URL de Vercel.
