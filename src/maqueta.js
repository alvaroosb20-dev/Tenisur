/* Maqueta 3D/4D del Centro Deportivo Tenisur — sin dependencias (canvas 2D).
   3 dimensiones de espacio + la hora del día (día · atardecer · noche).
   Recreación aproximada: la disposición es orientativa. */
(function () {
  "use strict";
  var raiz = document.querySelector("[data-maqueta]");
  if (!raiz) return;
  var EN = (document.documentElement.lang || "es").slice(0, 2) === "en";
  var canvas = raiz.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var capaEtiquetas = raiz.querySelector("[data-etiquetas]");
  var rango = document.getElementById("hora");
  var horaTxt = document.querySelector("[data-hora-txt]");
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- utilidades ---------- */
  function v(x, y, z) { return [x, y, z]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mezcla(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : a) + ")"; }

  /* ---------- escena ---------- */
  var suelo = [];   // polígonos planos a ras de suelo (se pintan primero, en orden)
  var objetos = []; // polígonos con volumen (se ordenan por profundidad)
  var focos = [];   // puntos de luz para la noche

  function plano(x0, z0, x1, z1, color, y, capa) {
    suelo.push({ p: [v(x0, y || 0, z0), v(x1, y || 0, z0), v(x1, y || 0, z1), v(x0, y || 0, z1)], c: hex(color), a: 1, plano: true, capa: capa || 0 });
  }
  function linea(x0, z0, x1, z1, ancho, color, capa) {
    var dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1, nx = -dz / l * ancho / 2, nz = dx / l * ancho / 2;
    suelo.push({ p: [v(x0 + nx, 0.03, z0 + nz), v(x1 + nx, 0.03, z1 + nz), v(x1 - nx, 0.03, z1 - nz), v(x0 - nx, 0.03, z0 - nz)], c: hex(color || "#ffffff"), a: 1, plano: true, capa: capa || 2 });
  }
  function cara(pts, color, alfa, opts) {
    objetos.push({ p: pts, c: typeof color === "string" ? hex(color) : color, a: alfa == null ? 1 : alfa, dos: !!(opts && opts.dosCaras), sinLuz: !!(opts && opts.sinLuz), borde: opts && opts.borde });
  }
  function caja(cx, cz, w, d, h, color, opts) {
    var y0 = (opts && opts.y0) || 0, y1 = y0 + h, x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    var colTecho = (opts && opts.techo) || color, a = opts && opts.alfa;
    cara([v(x0, y1, z0), v(x0, y1, z1), v(x1, y1, z1), v(x1, y1, z0)], colTecho, a);       // techo
    cara([v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)], (opts && opts.frenteZ) || color, a); // +z
    cara([v(x1, y0, z0), v(x0, y0, z0), v(x0, y1, z0), v(x1, y1, z0)], (opts && opts.fondoZ) || color, a);  // -z
    cara([v(x1, y0, z1), v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1)], (opts && opts.frenteX) || color, a); // +x
    cara([v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0)], (opts && opts.fondoX) || color, a); // -x
  }
  function muro(x0, z0, x1, z1, y0, y1, color, alfa) {
    cara([v(x0, y0, z0), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z0)], color, alfa, { dosCaras: true });
  }

  /* Pista de tenis: largo en z, centro (cx, cz) */
  function pistaTenis(cx, cz) {
    plano(cx - 9, cz - 18, cx + 9, cz + 18, "#2f6b45", 0, 0);            // perímetro verde
    plano(cx - 7.2, cz - 15.2, cx + 7.2, cz + 15.2, "#b8603b", 0.01, 1); // tierra batida
    var L = 11.885, Dd = 5.485, Ds = 4.115, S = 6.4, w = 0.12;
    linea(cx - Dd, cz - L, cx + Dd, cz - L, w); linea(cx - Dd, cz + L, cx + Dd, cz + L, w);
    linea(cx - Dd, cz - L, cx - Dd, cz + L, w); linea(cx + Dd, cz - L, cx + Dd, cz + L, w);
    linea(cx - Ds, cz - L, cx - Ds, cz + L, w); linea(cx + Ds, cz - L, cx + Ds, cz + L, w);
    linea(cx - Ds, cz - S, cx + Ds, cz - S, w); linea(cx - Ds, cz + S, cx + Ds, cz + S, w);
    linea(cx, cz - S, cx, cz + S, w);
    linea(cx, cz - L, cx, cz - L + 0.3, w); linea(cx, cz + L, cx, cz + L - 0.3, w);
    // red
    muro(cx - 6.4, cz, cx + 6.4, cz, 0, 0.95, "#1d2421", 0.55);
    caja(cx - 6.4, cz, 0.12, 0.12, 1.07, "#d8dcda"); caja(cx + 6.4, cz, 0.12, 0.12, 1.07, "#d8dcda");
    muro(cx - 6.4, cz, cx + 6.4, cz, 0.88, 0.95, "#ffffff", 1);
  }

  /* Pista de pádel: largo en x */
  function pistaPadel(cx, cz) {
    plano(cx - 11, cz - 6, cx + 11, cz + 6, "#3c4744", 0, 0);
    plano(cx - 10, cz - 5, cx + 10, cz + 5, "#2c6d8f", 0.01, 1);
    var w = 0.1;
    linea(cx - 6.95, cz - 5, cx - 6.95, cz + 5, w); linea(cx + 6.95, cz - 5, cx + 6.95, cz + 5, w);
    linea(cx - 6.95, cz, cx + 6.95, cz, w);
    // red
    muro(cx, cz - 5, cx, cz + 5, 0, 0.88, "#1d2421", 0.55);
    muro(cx, cz - 5, cx, cz + 5, 0.82, 0.88, "#ffffff", 1);
    // cristales de fondo (3 m) y laterales (2 m de cristal + malla)
    var vidrio = "#bfe9f2";
    muro(cx - 10, cz - 5, cx - 10, cz + 5, 0, 3, vidrio, 0.28);
    muro(cx + 10, cz - 5, cx + 10, cz + 5, 0, 3, vidrio, 0.28);
    muro(cx - 10, cz - 5, cx - 6, cz - 5, 0, 3, vidrio, 0.28); muro(cx + 6, cz - 5, cx + 10, cz - 5, 0, 3, vidrio, 0.28);
    muro(cx - 10, cz + 5, cx - 6, cz + 5, 0, 3, vidrio, 0.28); muro(cx + 6, cz + 5, cx + 10, cz + 5, 0, 3, vidrio, 0.28);
    muro(cx - 6, cz - 5, cx + 6, cz - 5, 0, 3, "#1d2421", 0.18); muro(cx - 6, cz + 5, cx + 6, cz + 5, 0, 3, "#1d2421", 0.18);
    muro(cx - 10, cz - 5, cx - 10, cz + 5, 3, 4, "#1d2421", 0.18); muro(cx + 10, cz - 5, cx + 10, cz + 5, 3, 4, "#1d2421", 0.18);
    // postes de luz
    [[-10, -5], [10, -5], [-10, 5], [10, 5]].forEach(function (q) { caja(cx + q[0], cz + q[1], 0.15, 0.15, 6, "#2a302e"); focos.push(v(cx + q[0], 6, cz + q[1])); });
  }

  function palmera(x, z, h) {
    caja(x, z, 0.5, 0.5, h, "#7a5a3c");
    var y = h, c = "#3f7d3a";
    for (var i = 0; i < 6; i++) {
      var ang = i / 6 * Math.PI * 2, dx = Math.cos(ang) * 3.4, dz = Math.sin(ang) * 3.4, px = -Math.sin(ang) * 0.6, pz = Math.cos(ang) * 0.6;
      cara([v(x, y + 0.2, z), v(x + dx + px, y - 1.4, z + dz + pz), v(x + dx * 1.08, y - 1.9, z + dz * 1.08), v(x + dx - px, y - 1.4, z + dz - pz)], c, 1, { dosCaras: true });
    }
  }
  function sombrilla(x, z) {
    caja(x, z, 0.12, 0.12, 2.4, "#cfd4d2");
    var r = 1.6, y = 2.6;
    cara([v(x - r, y - 0.4, z - r), v(x + r, y - 0.4, z - r), v(x, y, z)], "#f4f4f2", 1, { dosCaras: true });
    cara([v(x + r, y - 0.4, z - r), v(x + r, y - 0.4, z + r), v(x, y, z)], "#e9ecea", 1, { dosCaras: true });
    cara([v(x + r, y - 0.4, z + r), v(x - r, y - 0.4, z + r), v(x, y, z)], "#f4f4f2", 1, { dosCaras: true });
    cara([v(x - r, y - 0.4, z + r), v(x - r, y - 0.4, z - r), v(x, y, z)], "#e9ecea", 1, { dosCaras: true });
  }

  // Terreno
  plano(-75, -50, 75, 42, "#6f7a72", -0.02, -1);
  plano(-28, -6, 28, 30, "#2f6b45", -0.01, -1);
  // Tenis (3 pistas, delante)
  [-18.5, 0, 18.5].forEach(function (x) { pistaTenis(x, 12); });
  // Valla de tenis
  var vf = "#1d2421", va = 0.13;
  muro(-28, -6, 28, -6, 0, 3.5, vf, va); muro(-28, 30, 28, 30, 0, 3.5, vf, va);
  muro(-28, -6, -28, 30, 0, 3.5, vf, va); muro(28, -6, 28, 30, 0, 3.5, vf, va);
  [[-28, -6], [28, -6], [-28, 30], [28, 30], [0, -6], [0, 30]].forEach(function (q) { caja(q[0], q[1], 0.2, 0.2, 9, "#2a302e"); focos.push(v(q[0], 9, q[1])); });
  // Pádel (3 pistas, detrás)
  plano(-36, -32, 36, -12, "#56615c", -0.005, -1);
  [-23.5, 0, 23.5].forEach(function (x) { pistaPadel(x, -22); });
  // Edificio de squash y racquetball
  caja(-50, -22, 18, 16, 7.5, "#d9d4c7", { techo: "#9aa39e", frenteX: "#cfc9bb" });
  // Gimnasio y crossfit
  caja(-50, -42, 18, 12, 6, "#c9cfcb", { techo: "#8a948f" });
  // Restaurante / club social (fachada acristalada hacia las pistas)
  caja(-48, 10, 16, 26, 5.5, "#ece8df", { techo: "#a7ada9", frenteX: "#b9dbe0" });
  plano(-40, -2, -34, 22, "#c9b79a", 0.01, 0);
  // Terraza, kiosco y barbacoa (derecha)
  plano(34, -30, 62, -6, "#c9b79a", 0, 0);
  [[39, -24], [46, -24], [53, -24], [39, -15], [46, -15], [53, -15]].forEach(function (q) { sombrilla(q[0], q[1]); });
  caja(58, -11, 6, 6, 3.2, "#f0ede6", { techo: "#2f6b45" });
  caja(58, -22, 3, 3, 1.2, "#5c5f5d");
  // Parque infantil
  plano(36, 4, 58, 22, "#2f8a5c", 0, 0);
  caja(42, 10, 4, 4, 2.6, "#ddf247", { techo: "#e35d3a" });
  caja(50, 16, 6, 0.3, 2.2, "#1b3f73");
  caja(53, 9, 3, 3, 1.4, "#e35d3a");
  cara([v(44, 2.6, 10), v(44, 2.6, 11.5), v(48, 0.1, 11.5), v(48, 0.1, 10)], "#1b3f73", 1, { dosCaras: true });
  // Palmeras
  [[-34, -44], [-34, 34], [-62, 30], [30, 36], [63, 2], [63, -36], [-8, -40], [16, -40]].forEach(function (q, i) { palmera(q[0], q[1], 9 + (i % 3) * 2); });

  /* ---------- zonas (etiquetas y vuelo de cámara) ---------- */
  var ZONAS = [
    { id: "tenis", p: v(0, 4, 12), es: "Tenis · 3 pistas", en: "Tennis · 3 courts", cam: { yaw: 0.0, pitch: 0.75, dist: 70, t: v(0, 0, 12) } },
    { id: "padel", p: v(0, 5, -22), es: "Pádel · 3 pistas", en: "Padel · 3 courts", cam: { yaw: 0.35, pitch: 0.6, dist: 60, t: v(0, 0, -22) } },
    { id: "squash", p: v(-50, 9, -22), es: "Squash y racquetball", en: "Squash and racquetball", cam: { yaw: -0.9, pitch: 0.45, dist: 45, t: v(-50, 2, -22) } },
    { id: "gym", p: v(-50, 7.5, -42), es: "Gimnasio y crossfit", en: "Gym and CrossFit", cam: { yaw: -0.6, pitch: 0.5, dist: 45, t: v(-50, 2, -40) } },
    { id: "restaurante", p: v(-48, 7.5, 10), es: "Restaurante", en: "Restaurant", cam: { yaw: -1.2, pitch: 0.4, dist: 45, t: v(-46, 2, 10) } },
    { id: "terraza", p: v(48, 5, -19), es: "Terraza, kiosco y barbacoa", en: "Terrace, kiosk and barbecue", cam: { yaw: 1.0, pitch: 0.5, dist: 45, t: v(48, 1, -18) } },
    { id: "parque", p: v(47, 5, 13), es: "Parque infantil", en: "Playground", cam: { yaw: 1.3, pitch: 0.55, dist: 38, t: v(47, 1, 13) } },
  ];
  var etiquetas = ZONAS.map(function (z) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "maqueta__etq";
    b.textContent = EN ? z.en : z.es;
    b.addEventListener("click", function () { volarA(z.cam); });
    capaEtiquetas.appendChild(b);
    return b;
  });
  document.querySelectorAll("[data-zona]").forEach(function (b) {
    var z = ZONAS.filter(function (q) { return q.id === b.getAttribute("data-zona"); })[0];
    if (z) b.addEventListener("click", function () { volarA(z.cam); raiz.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "center" }); });
  });

  /* ---------- cámara ---------- */
  var INICIAL = { yaw: 0.55, pitch: 0.62, dist: 125, t: v(0, 0, -4) };
  var cam = { yaw: INICIAL.yaw, pitch: INICIAL.pitch, dist: INICIAL.dist, t: INICIAL.t.slice() };
  var anim = null, autoGiro = !reducido, ultimaInteraccion = 0;

  function volarA(obj) {
    autoGiro = false;
    var ini = { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist, t: cam.t.slice() };
    // camino más corto en el giro
    var dy = obj.yaw - ini.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    anim = { ini: ini, fin: { yaw: ini.yaw + dy, pitch: obj.pitch, dist: obj.dist, t: obj.t }, t0: performance.now(), dur: reducido ? 1 : 900 };
    pedirFrame();
  }
  function limitar() {
    cam.pitch = Math.max(0.12, Math.min(1.45, cam.pitch));
    cam.dist = Math.max(18, Math.min(200, cam.dist));
  }

  /* ---------- hora del día (4.ª dimensión) ---------- */
  var CIELOS = [
    { arriba: hex("#7fb6e6"), abajo: hex("#d7ecf7"), luz: hex("#fff6e6"), amb: 0.62, dif: 0.48, suelo: 1, dir: norm([-0.5, 1, 0.35]) },
    { arriba: hex("#3a3f8f"), abajo: hex("#f39a5a"), luz: hex("#ffb27a"), amb: 0.45, dif: 0.55, suelo: 0.85, dir: norm([0.9, 0.35, -0.6]) },
    { arriba: hex("#0b1026"), abajo: hex("#22305a"), luz: hex("#9fb4ff"), amb: 0.22, dif: 0.15, suelo: 0.45, dir: norm([0.2, 1, 0.2]) },
  ];
  var hora = 0.5;
  function cielo() {
    var h = hora * 2, i = Math.min(1, Math.floor(h)), t = h - i, a = CIELOS[i], b = CIELOS[i + 1];
    return {
      arriba: mezcla(a.arriba, b.arriba, t), abajo: mezcla(a.abajo, b.abajo, t), luz: mezcla(a.luz, b.luz, t),
      amb: a.amb + (b.amb - a.amb) * t, dif: a.dif + (b.dif - a.dif) * t, dir: norm(mezcla(a.dir, b.dir, t)), suelo: a.suelo + (b.suelo - a.suelo) * t,
      noche: Math.max(0, (hora - 0.55) / 0.45),
    };
  }
  function textoHora() {
    if (hora < 0.25) return EN ? "Day" : "Día";
    if (hora < 0.75) return EN ? "Sunset" : "Atardecer";
    return EN ? "Night · floodlights on" : "Noche · focos encendidos";
  }
  if (rango) {
    hora = parseFloat(rango.value) / 100;
    rango.addEventListener("input", function () { hora = parseFloat(rango.value) / 100; horaTxt.textContent = textoHora(); rango.setAttribute("aria-valuetext", textoHora()); pedirFrame(); });
    horaTxt.textContent = textoHora();
    rango.setAttribute("aria-valuetext", textoHora());
  }

  /* ---------- render ---------- */
  var W = 0, H = 0, dpr = 1;
  function tam() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pedirFrame();
  }

  function base() {
    var cp = Math.cos(cam.pitch), pos = [cam.t[0] + Math.sin(cam.yaw) * cp * cam.dist, cam.t[1] + Math.sin(cam.pitch) * cam.dist, cam.t[2] + Math.cos(cam.yaw) * cp * cam.dist];
    var f = norm(sub(cam.t, pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
    return { pos: pos, f: f, r: r, u: u, fl: (Math.min(W, H) / 2) / Math.tan(0.45) };
  }
  function proyectar(p, B) {
    var d = sub(p, B.pos), z = dot(d, B.f);
    if (z < 0.5) return null;
    return [W / 2 + dot(d, B.r) * B.fl / z, H / 2 - dot(d, B.u) * B.fl / z, z];
  }

  function color(pol, C, nrm) {
    var c = pol.c, k;
    if (pol.plano) { k = C.amb + C.dif * 0.85; return [c[0] * k * C.luz[0] / 255 * C.suelo + 0, c[1] * k * C.luz[1] / 255 * C.suelo, c[2] * k * C.luz[2] / 255 * C.suelo]; }
    var lam = Math.abs(dot(nrm, C.dir));
    k = C.amb + C.dif * lam;
    return [Math.min(255, c[0] * k * C.luz[0] / 255), Math.min(255, c[1] * k * C.luz[1] / 255), Math.min(255, c[2] * k * C.luz[2] / 255)];
  }

  function dibujarPol(pol, B, C, dosCaras) {
    // coordenadas de cámara + recorte contra el plano cercano (evita huecos al acercarse)
    var NEAR = 0.5, cs = [], pts = [];
    for (var i = 0; i < pol.p.length; i++) { var d = sub(pol.p[i], B.pos); cs.push([dot(d, B.r), dot(d, B.u), dot(d, B.f)]); }
    var rec = [];
    for (var q = 0; q < cs.length; q++) {
      var A = cs[q], Bq = cs[(q + 1) % cs.length], ain = A[2] >= NEAR, bin = Bq[2] >= NEAR;
      if (ain) rec.push(A);
      if (ain !== bin) { var tt = (NEAR - A[2]) / (Bq[2] - A[2]); rec.push([A[0] + (Bq[0] - A[0]) * tt, A[1] + (Bq[1] - A[1]) * tt, NEAR]); }
    }
    if (rec.length < 3) return;
    for (var m = 0; m < rec.length; m++) pts.push([W / 2 + rec[m][0] * B.fl / rec[m][2], H / 2 - rec[m][1] * B.fl / rec[m][2], rec[m][2]]);
    if (!dosCaras) {
      var area = 0;
      for (var j = 0; j < pts.length; j++) { var a = pts[j], b = pts[(j + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
      if (area > 0) return;
    }
    var nrm = norm(cross(sub(pol.p[1], pol.p[0]), sub(pol.p[2], pol.p[0])));
    var col = pol.sinLuz ? pol.c : color(pol, C, nrm);
    // la iluminación nocturna de los focos aclara las pistas
    if (C.noche > 0 && pol.plano && pol.capa >= 1) col = mezcla(col, pol.c, C.noche * 0.75);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
    ctx.fillStyle = rgba(col, pol.a);
    ctx.fill();
    if (pol.a >= 1 && !pol.plano) { ctx.strokeStyle = rgba(col, 1); ctx.lineWidth = 0.6; ctx.stroke(); }
  }

  var frame = null;
  function pedirFrame() { if (!frame) frame = requestAnimationFrame(render); }

  function render(t) {
    frame = null;
    if (anim) {
      var k = Math.min(1, (t - anim.t0) / anim.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cam.yaw = anim.ini.yaw + (anim.fin.yaw - anim.ini.yaw) * e;
      cam.pitch = anim.ini.pitch + (anim.fin.pitch - anim.ini.pitch) * e;
      cam.dist = anim.ini.dist + (anim.fin.dist - anim.ini.dist) * e;
      cam.t = mezcla(anim.ini.t, anim.fin.t, e);
      if (k >= 1) anim = null;
    } else if (autoGiro && t - ultimaInteraccion > 3000) {
      cam.yaw += 0.0012;
    }
    var C = cielo(), B = base();
    // cielo
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(C.arriba)); g.addColorStop(1, rgba(C.abajo));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (C.noche > 0.3) {
      ctx.fillStyle = "rgba(255,255,255," + (C.noche - 0.3) + ")";
      for (var s = 0; s < 60; s++) { var sx = (s * 977) % 1000 / 1000 * W, sy = (s * 613) % 1000 / 1000 * H * 0.45; ctx.fillRect(sx, sy, 1.2, 1.2); }
    }
    // suelo por capas
    suelo.slice().sort(function (a, b) { return a.capa - b.capa; }).forEach(function (p) { dibujarPol(p, B, C, true); });
    // halos de los focos sobre las pistas (noche)
    if (C.noche > 0) {
      ctx.globalCompositeOperation = "lighter";
      focos.forEach(function (f) {
        var s2 = proyectar([f[0], 0, f[2]], B); if (!s2) return;
        var r = 9 * B.fl / s2[2];
        var rg = ctx.createRadialGradient(s2[0], s2[1], 0, s2[0], s2[1], r);
        rg.addColorStop(0, "rgba(255,245,210," + 0.22 * C.noche + ")"); rg.addColorStop(1, "rgba(255,245,210,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(s2[0], s2[1], r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    }
    // objetos ordenados de lejos a cerca
    var lista = [];
    objetos.forEach(function (o) {
      var c = [0, 0, 0]; o.p.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; });
      var n = o.p.length, d = sub([c[0] / n, c[1] / n, c[2] / n], B.pos);
      lista.push({ o: o, z: dot(d, d) });
    });
    lista.sort(function (a, b) { return b.z - a.z; });
    lista.forEach(function (it) { dibujarPol(it.o, B, C, it.o.dos || it.o.a < 1); });
    // focos encendidos
    if (C.noche > 0) {
      focos.forEach(function (f) {
        var s3 = proyectar(f, B); if (!s3) return;
        var r = Math.max(4, 2.2 * B.fl / s3[2]);
        var rg = ctx.createRadialGradient(s3[0], s3[1], 0, s3[0], s3[1], r * 3);
        rg.addColorStop(0, "rgba(255,250,225," + C.noche + ")"); rg.addColorStop(1, "rgba(255,250,225,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(s3[0], s3[1], r * 3, 0, Math.PI * 2); ctx.fill();
      });
    }
    // etiquetas
    ZONAS.forEach(function (z, i) {
      var s4 = proyectar(z.p, B), el = etiquetas[i];
      if (!s4 || s4[0] < -40 || s4[0] > W + 40 || s4[1] < -20 || s4[1] > H + 20) { el.hidden = true; return; }
      el.hidden = false;
      el.style.transform = "translate(" + Math.round(s4[0]) + "px," + Math.round(s4[1]) + "px) translate(-50%,-100%)";
      el.style.zIndex = String(1000 - Math.round(s4[2]));
    });
    if (anim || (autoGiro && !document.hidden)) pedirFrame();
  }

  /* ---------- controles: arrastrar, pellizcar, rueda, teclado ---------- */
  var punteros = {}, pinchIni = null;
  function tocar() { ultimaInteraccion = performance.now(); autoGiro = false; anim = null; }
  canvas.addEventListener("pointerdown", function (e) {
    tocar();
    canvas.setPointerCapture(e.pointerId);
    punteros[e.pointerId] = [e.clientX, e.clientY];
    var ids = Object.keys(punteros);
    if (ids.length === 2) { var a = punteros[ids[0]], b = punteros[ids[1]]; pinchIni = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), dist: cam.dist }; }
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!punteros[e.pointerId]) return;
    var prev = punteros[e.pointerId], ids = Object.keys(punteros);
    punteros[e.pointerId] = [e.clientX, e.clientY];
    if (ids.length === 1) {
      cam.yaw -= (e.clientX - prev[0]) * 0.008;
      cam.pitch += (e.clientY - prev[1]) * 0.006;
    } else if (ids.length === 2 && pinchIni) {
      var a = punteros[ids[0]], b = punteros[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      cam.dist = pinchIni.dist * pinchIni.d / Math.max(10, d);
    }
    limitar(); pedirFrame();
  });
  function soltar(e) { delete punteros[e.pointerId]; if (Object.keys(punteros).length < 2) pinchIni = null; }
  canvas.addEventListener("pointerup", soltar);
  canvas.addEventListener("pointercancel", soltar);
  canvas.addEventListener("wheel", function (e) { e.preventDefault(); tocar(); cam.dist *= Math.exp(e.deltaY * 0.0012); limitar(); pedirFrame(); }, { passive: false });
  canvas.addEventListener("keydown", function (e) {
    var m = { ArrowLeft: [0.08, 0, 1], ArrowRight: [-0.08, 0, 1], ArrowUp: [0, 0.05, 1], ArrowDown: [0, -0.05, 1], "+": [0, 0, 0.9], "=": [0, 0, 0.9], "-": [0, 0, 1.1] }[e.key];
    if (!m) return;
    e.preventDefault(); tocar(); cam.yaw += m[0]; cam.pitch += m[1]; cam.dist *= m[2]; limitar(); pedirFrame();
  });
  raiz.querySelector("[data-zoom-mas]").addEventListener("click", function () { tocar(); cam.dist *= 0.8; limitar(); pedirFrame(); });
  raiz.querySelector("[data-zoom-menos]").addEventListener("click", function () { tocar(); cam.dist *= 1.25; limitar(); pedirFrame(); });
  raiz.querySelector("[data-reiniciar]").addEventListener("click", function () { volarA(INICIAL); });

  window.addEventListener("resize", tam);
  document.addEventListener("visibilitychange", pedirFrame);
  tam();
})();
