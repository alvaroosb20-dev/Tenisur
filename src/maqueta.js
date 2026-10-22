/* Maqueta 3D del Centro Deportivo Tenisur — sin dependencias (canvas 2D).
   Distribución medida sobre una vista aérea del club (escala ≈ 0,066 m por píxel de la captura).
   Ejes: x = este (+) / oeste (−), z = sur (+) / norte (−), y = altura. */
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

  /* ================= utilidades ================= */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mezcla(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : a) + ")"; }
  function col(c) { return typeof c === "string" ? hex(c) : c; }
  var semilla = 7;
  function azar() { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; }
  function variar(c, k) { c = col(c); var f = 1 + (azar() - 0.5) * k; return [Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)]; }

  /* Píxeles de la vista aérea → metros */
  var ESC = 0.066, OX = 600, OZ = 620;
  function X(px) { return (px - OX) * ESC; }
  function Z(py) { return (py - OZ) * ESC; }

  /* ================= escena ================= */
  var suelo = [], objetos = [], solidos = [], focos = [];

  function planoPts(pts, color, capa, y) {
    suelo.push({ p: pts.map(function (q) { return [q[0], y || 0, q[1]]; }), c: col(color), a: 1, capa: capa });
  }
  function plano(x0, z0, x1, z1, color, capa, y) { planoPts([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], color, capa, y); }
  function planoPx(px0, py0, px1, py1, color, capa) { plano(X(px0), Z(py0), X(px1), Z(py1), color, capa); }
  function linea(x0, z0, x1, z1, ancho, color, capa) {
    var dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1, nx = -dz / l * ancho / 2, nz = dx / l * ancho / 2;
    planoPts([[x0 + nx, z0 + nz], [x1 + nx, z1 + nz], [x1 - nx, z1 - nz], [x0 - nx, z0 - nz]], color || "#f3efe6", capa == null ? 3 : capa);
  }
  // Cara 3D. Con "centro" se orienta hacia fuera y se descarta cuando queda de espaldas.
  function cara(pts, color, alfa, opts) {
    opts = opts || {};
    if (opts.centro) {
      var n = cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])), c = [0, 0, 0];
      pts.forEach(function (p) { c[0] += p[0] / pts.length; c[1] += p[1] / pts.length; c[2] += p[2] / pts.length; });
      if (dot(n, sub(c, opts.centro)) < 0) pts = pts.slice().reverse();
    }
    var a = alfa == null ? 1 : alfa;
    objetos.push({ p: pts, c: col(color), a: a, dos: !opts.centro || a < 1, brillo: opts.brillo || 0 });
  }
  function prisma(planta, y0, h, color, opts) {
    opts = opts || {};
    var y1 = y0 + h, cx = 0, cz = 0;
    planta.forEach(function (q) { cx += q[0] / planta.length; cz += q[1] / planta.length; });
    var centro = [cx, y0 + h / 2, cz];
    if (opts.tapa !== false) cara(planta.map(function (q) { return [q[0], y1, q[1]]; }), opts.techo || color, 1, { centro: centro });
    for (var i = 0; i < planta.length; i++) {
      var a = planta[i], b = planta[(i + 1) % planta.length];
      cara([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], opts.lados ? opts.lados[i % opts.lados.length] : variar(color, 0.06), 1, { centro: centro });
    }
    if (opts.sombra !== false) solidos.push(planta.map(function (q) { return [q[0], y1, q[1]]; }).concat(planta.map(function (q) { return [q[0], y0, q[1]]; })));
    return centro;
  }
  function caja(x0, z0, x1, z1, y0, h, color, opts) { return prisma([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0, h, color, opts); }
  function cajaPx(px0, py0, px1, py1, h, color, opts) { return caja(X(px0), Z(py0), X(px1), Z(py1), (opts && opts.y0) || 0, h, color, opts); }
  // Tejado a cuatro aguas sobre un rectángulo
  function tejado(x0, z0, x1, z1, y, alto, color) {
    var w = x1 - x0, d = z1 - z0, centro = [(x0 + x1) / 2, y, (z0 + z1) / 2], top = y + alto, c1 = variar(color, 0.04), c2 = variar(color, 0.1);
    if (w >= d) {
      var i = d / 2, a = [x0 + i, top, (z0 + z1) / 2], b = [x1 - i, top, (z0 + z1) / 2];
      cara([[x0, y, z0], [x1, y, z0], b, a], c1, 1, { centro: centro });
      cara([[x1, y, z1], [x0, y, z1], a, b], c2, 1, { centro: centro });
      cara([[x0, y, z1], [x0, y, z0], a], c2, 1, { centro: centro });
      cara([[x1, y, z0], [x1, y, z1], b], c1, 1, { centro: centro });
    } else {
      var j = w / 2, e = [(x0 + x1) / 2, top, z0 + j], f = [(x0 + x1) / 2, top, z1 - j];
      cara([[x0, y, z0], [x1, y, z0], e], c1, 1, { centro: centro });
      cara([[x1, y, z1], [x0, y, z1], f], c2, 1, { centro: centro });
      cara([[x0, y, z1], [x0, y, z0], e, f], c2, 1, { centro: centro });
      cara([[x1, y, z0], [x1, y, z1], f, e], c1, 1, { centro: centro });
    }
    solidos.push([[x0, top, z0], [x1, top, z0], [x1, top, z1], [x0, top, z1], [x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]]);
  }
  // Placas solares en filas sobre una cubierta plana
  function placas(x0, z0, x1, z1, y) {
    var filas = Math.max(1, Math.round((z1 - z0) / 1.15));
    for (var r = 0; r < filas; r++) {
      var za = z0 + (z1 - z0) * r / filas + 0.08, zb = z0 + (z1 - z0) * (r + 1) / filas - 0.08;
      cara([[x0, y + 0.05, zb], [x1, y + 0.05, zb], [x1, y + 0.45, za], [x0, y + 0.45, za]], "#1f2b3e", 1, { centro: [(x0 + x1) / 2, y - 1, (za + zb) / 2], brillo: 0.35 });
    }
  }
  function circulo(x, z, r, n) { var p = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); } return p; }
  function poste(x, z, h, color, foco) {
    prisma(circulo(x, z, 0.12, 6), 0, h, color || "#3a403e");
    if (foco) { caja(x - 0.35, z - 0.2, x + 0.35, z + 0.2, h - 0.25, 0.3, "#e9ecea", { sombra: false }); focos.push([x, h - 0.1, z]); }
  }
  // Valla de malla por paneles (más fácil de ordenar en profundidad)
  function valla(x0, z0, x1, z1, h, alfa, color) {
    var l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(l / 3));
    for (var i = 0; i < n; i++) {
      var ta = i / n, tb = (i + 1) / n, ax = x0 + (x1 - x0) * ta, az = z0 + (z1 - z0) * ta, bx = x0 + (x1 - x0) * tb, bz = z0 + (z1 - z0) * tb;
      cara([[ax, 0, az], [bx, 0, bz], [bx, h, bz], [ax, h, az]], color || "#20302a", alfa == null ? 0.2 : alfa);
      cara([[ax, h - 0.06, az], [bx, h - 0.06, bz], [bx, h, bz], [ax, h, az]], "#2a3531", 1);
    }
    for (var k = 0; k <= n; k++) { var px = x0 + (x1 - x0) * k / n, pz = z0 + (z1 - z0) * k / n; prisma([[px - 0.05, pz - 0.05], [px + 0.05, pz - 0.05], [px + 0.05, pz + 0.05], [px - 0.05, pz + 0.05]], 0, h, "#2a3531", { sombra: false }); }
  }
  function cristal(x0, z0, x1, z1, y0, y1) {
    cara([[x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]], "#cfeef3", 0.22);
    cara([[x0, y1 - 0.08, z0], [x1, y1 - 0.08, z1], [x1, y1, z1], [x0, y1, z0]], "#3a4542", 1);
  }
  function red(x0, z0, x1, z1, alto) {
    cara([[x0, 0, z0], [x1, 0, z1], [x1, alto, z1], [x0, alto, z0]], "#151b19", 0.6);
    cara([[x0, alto - 0.07, z0], [x1, alto - 0.07, z1], [x1, alto, z1], [x0, alto, z0]], "#f4f4f2", 1);
    prisma(circulo(x0, z0, 0.06, 6), 0, alto + 0.1, "#cfd4d2", { sombra: false });
    prisma(circulo(x1, z1, 0.06, 6), 0, alto + 0.1, "#cfd4d2", { sombra: false });
  }
  function palmera(x, z, h) {
    prisma(circulo(x, z, 0.22, 6), 0, h, "#8a6b4a");
    for (var i = 0; i < 9; i++) {
      var ang = i / 9 * Math.PI * 2 + 0.3, L = 3.2, dx = Math.cos(ang), dz = Math.sin(ang), px = -dz * 0.45, pz = dx * 0.45;
      cara([[x, h + 0.15, z], [x + dx * L * 0.55 + px, h + 0.35, z + dz * L * 0.55 + pz], [x + dx * L, h - 1.5, z + dz * L], [x + dx * L * 0.55 - px, h + 0.35, z + dz * L * 0.55 - pz]], variar("#3f7a3a", 0.25), 1);
    }
    solidos.push([[x - 2.5, h, z - 2.5], [x + 2.5, h, z - 2.5], [x + 2.5, h, z + 2.5], [x - 2.5, h, z + 2.5], [x, 0, z]]);
  }
  function arbol(x, z, r, h) {
    prisma(circulo(x, z, 0.25, 5), 0, h * 0.45, "#6b5038");
    var cy = h * 0.45 + r * 0.7, arriba = [x, cy + r * 0.9, z], abajo = [x, cy - r * 0.6, z], anillo = [];
    for (var i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2; anillo.push([x + Math.cos(a) * r, cy, z + Math.sin(a) * r]); }
    var centro = [x, cy, z];
    for (var j = 0; j < 7; j++) {
      var p = anillo[j], q = anillo[(j + 1) % 7];
      cara([p, q, arriba], variar("#3f6e35", 0.25), 1, { centro: centro });
      cara([q, p, abajo], variar("#2f5628", 0.2), 1, { centro: centro });
    }
    solidos.push(anillo.concat([arriba, [x, 0, z]]));
  }
  function coche(x, z, ancho, largo, ejeZ, color) {
    var w = ejeZ ? ancho : largo, d = ejeZ ? largo : ancho;
    caja(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 0.25, 0.7, color);
    var cw = ejeZ ? ancho * 0.85 : largo * 0.5, cd = ejeZ ? largo * 0.5 : ancho * 0.85;
    caja(x - cw / 2, z - cd / 2, x + cw / 2, z + cd / 2, 0.95, 0.55, "#28323a", { techo: col(color) });
  }
  function sombrilla(x, z, r, color, alto) {
    var y = alto || 2.4;
    prisma(circulo(x, z, 0.05, 5), 0, y, "#d8dcda", { sombra: false });
    var t = [x, y + 0.45, z], e = [[x - r, y, z - r], [x + r, y, z - r], [x + r, y, z + r], [x - r, y, z + r]];
    for (var i = 0; i < 4; i++) cara([e[i], e[(i + 1) % 4], t], variar(color, 0.08), 1, { centro: [x, y - 1, z] });
    solidos.push(e.concat([t]));
  }
  function mesa(x, z) {
    prisma(circulo(x, z, 0.4, 8), 0.7, 0.05, "#d9d6cf", { sombra: false });
    prisma(circulo(x, z, 0.04, 4), 0, 0.7, "#555555", { sombra: false });
  }
  // Franja a lo largo de una curva (en píxeles), con ancho en metros hacia el sur
  function franja(curva, ancho, color, capa) {
    var a = curva.map(function (q) { return [X(q[0]), Z(q[1])]; });
    for (var i = 0; i < a.length - 1; i++) planoPts([a[i], a[i + 1], [a[i + 1][0], a[i + 1][1] + ancho], [a[i][0], a[i][1] + ancho]], color, capa);
  }

  /* ---------- terreno y calles ---------- */
  plano(-400, -400, 400, 400, "#9a9b90", -5);
  planoPx(40, 180, 1179, 1110, "#7d5a4a", -4);
  var bordeNorte = [[0, 345], [150, 282], [300, 230], [450, 202], [600, 190], [750, 196], [900, 222], [1050, 262], [1179, 300]];
  var bordeSur = [[60, 1112], [250, 1076], [400, 1052], [550, 1036], [700, 1022], [850, 1010], [1000, 1006], [1179, 1010]];
  franja(bordeNorte.map(function (q) { return [q[0], q[1] - 40]; }), 40 * ESC, "#cfcac0", -3);
  franja(bordeNorte.map(function (q) { return [q[0], q[1] - 240]; }), 200 * ESC, "#3b3f42", -3);
  franja(bordeNorte.map(function (q) { return [q[0], q[1] - 140]; }), 0.15, "#e9e6dc", -2);
  franja(bordeSur, 18 * ESC, "#cfcac0", -3);
  franja(bordeSur.map(function (q) { return [q[0], q[1] + 18]; }), 105 * ESC, "#3b3f42", -3);
  franja(bordeSur.map(function (q) { return [q[0], q[1] + 70]; }), 0.15, "#e9e6dc", -2);
  planoPx(700, 1135, 1179, 1194, "#45494c", -3);
  planoPx(0, 450, 45, 1010, "#cfcac0", -3);
  for (var m = 0; m < bordeNorte.length - 1; m++) {
    var a0 = bordeNorte[m], a1 = bordeNorte[m + 1];
    prisma([[X(a0[0]), Z(a0[1])], [X(a1[0]), Z(a1[1])], [X(a1[0]), Z(a1[1] + 14)], [X(a0[0]), Z(a0[1] + 14)]], 0, 1.1, "#ecebe6");
  }

  /* ---------- pistas de tenis (3, eje norte-sur) ---------- */
  var plotsTenis = [[72, 335], [335, 600], [600, 860]];
  var redTenis = [742, 722, 706];
  plotsTenis.forEach(function (pl, i) {
    var x0 = X(pl[0]), x1 = X(pl[1]), z0 = Z(458), z1 = Z(972), cx = (x0 + x1) / 2, cz = Z(redTenis[i]);
    plano(x0, z0, x1, z1, "#2f6a45", -1);
    plano(cx - 6.5, cz - 14.5, cx + 6.5, cz - 10.5, "#3a7a50", 0);
    plano(cx - 6.5, cz + 10.5, cx + 6.5, cz + 14.5, "#3a7a50", 0);
    plano(cx - 5.49, cz - 11.885, cx + 5.49, cz + 11.885, "#3f8a58", 1);
    var L = 11.885, Dd = 5.485, Ds = 4.115, S = 6.4, w = 0.09;
    linea(cx - Dd, cz - L, cx + Dd, cz - L, w); linea(cx - Dd, cz + L, cx + Dd, cz + L, w);
    linea(cx - Dd, cz - L, cx - Dd, cz + L, w); linea(cx + Dd, cz - L, cx + Dd, cz + L, w);
    linea(cx - Ds, cz - L, cx - Ds, cz + L, w); linea(cx + Ds, cz - L, cx + Ds, cz + L, w);
    linea(cx - Ds, cz - S, cx + Ds, cz - S, w); linea(cx - Ds, cz + S, cx + Ds, cz + S, w);
    linea(cx, cz - S, cx, cz + S, w);
    linea(cx, cz - L, cx, cz - L + 0.25, w); linea(cx, cz + L, cx, cz + L - 0.25, w);
    red(cx - 6.4, cz, cx + 6.4, cz, 1.07);
    caja(x0 + 0.5, cz - 1.2, x0 + 1.0, cz + 1.2, 0, 0.45, "#e8e6df");
  });
  var tz0 = Z(458), tz1 = Z(972);
  valla(X(72), tz0, X(860), tz0, 4, 0.22);
  valla(X(72), tz1, X(860), tz1, 4, 0.22);
  valla(X(72), tz0, X(72), tz1, 4, 0.22);
  valla(X(860), tz0, X(860), tz1, 4, 0.22);
  valla(X(335), tz0, X(335), tz1, 3, 0.14);
  valla(X(600), tz0, X(600), tz1, 3, 0.14);
  [72, 335, 600, 860].forEach(function (px) { [500, 715, 930].forEach(function (py) { poste(X(px), Z(py), 9.5, "#3a403e", true); }); });

  /* ---------- pistas de pádel (3, eje este-oeste) ---------- */
  var padel = [[848, 1146, 245, 438], [852, 1150, 455, 620], [856, 1152, 622, 785]];
  padel.forEach(function (pc) {
    var x0 = X(pc[0]), x1 = X(pc[1]), z0 = Z(pc[2]), z1 = Z(pc[3]), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    plano(x0, z0, x1, z1, "#4d5a52", -1);
    var a0 = cx - 10, a1 = cx + 10, b0 = cz - 5, b1 = cz + 5;
    for (var s = 0; s < 8; s++) plano(a0 + s * 2.5, b0, a0 + (s + 1) * 2.5, b1, s % 2 ? "#3f7d4c" : "#468757", 1);
    var w = 0.08;
    linea(cx - 6.95, b0, cx - 6.95, b1, w); linea(cx + 6.95, b0, cx + 6.95, b1, w); linea(cx - 6.95, cz, cx + 6.95, cz, w);
    red(cx, b0, cx, b1, 0.88);
    cristal(a0, b0, a0, b1, 0, 3); cristal(a1, b0, a1, b1, 0, 3);
    valla(a0, b0, a0, b1, 4, 0.12); valla(a1, b0, a1, b1, 4, 0.12);
    cristal(a0, b0, a0 + 2, b0, 0, 3); cristal(a1 - 2, b0, a1, b0, 0, 3); cristal(a0, b1, a0 + 2, b1, 0, 3); cristal(a1 - 2, b1, a1, b1, 0, 3);
    valla(a0 + 2, b0, a1 - 2, b0, 3, 0.16); valla(a0 + 2, b1, a1 - 2, b1, 3, 0.16);
    [[a0, b0], [a1, b0], [a0, b1], [a1, b1]].forEach(function (q) { poste(q[0], q[1], 6.5, "#2c3331", true); });
  });
  planoPx(848, 438, 1146, 455, "#3d6b45", 0);
  cajaPx(925, 440, 965, 452, 0.5, "#f0f0ee");

  /* ---------- edificio del club (norte) ---------- */
  var muro = "#efe9dd", teja = "#b5533a";
  cajaPx(55, 335, 200, 445, 4.2, muro, { tapa: false });
  tejado(X(55), Z(335), X(200), Z(445), 4.2, 1.8, teja);
  cajaPx(170, 262, 330, 352, 6.8, muro, { techo: "#e3c9a8" });
  cajaPx(200, 395, 445, 446, 3.6, "#d9d2c3", { techo: "#9a8f80", lados: [hex("#d9d2c3"), hex("#d9d2c3"), hex("#5e7d86"), hex("#d9d2c3")] });
  cajaPx(330, 212, 445, 395, 6.2, muro, { techo: "#8f877b" });
  placas(X(338), Z(300), X(430), Z(392), 6.2);
  cajaPx(445, 212, 600, 330, 6.2, muro, { techo: "#8f877b" });
  placas(X(450), Z(218), X(595), Z(325), 6.2);
  cajaPx(595, 196, 650, 332, 6.4, muro, { tapa: false });
  tejado(X(595), Z(196), X(650), Z(332), 6.4, 1.5, teja);
  cajaPx(640, 194, 828, 272, 6.4, muro, { techo: "#b5533a" });
  placas(X(645), Z(200), X(805), Z(255), 6.4);
  cajaPx(625, 272, 840, 362, 5, "#e7dfd0", { techo: "#7a5c49", lados: [hex("#e7dfd0"), hex("#e7dfd0"), hex("#56727b"), hex("#e7dfd0")] });
  cajaPx(165, 330, 195, 370, 8, "#e8e4dc");
  planoPx(440, 332, 830, 446, "#8a5f4b", 0);
  [[505, 360], [540, 375], [515, 395], [560, 355], [580, 390]].forEach(function (q) { mesa(X(q[0]), Z(q[1])); });
  cajaPx(630, 386, 712, 400, 0.45, "#e9e6df");
  cajaPx(715, 380, 820, 398, 0.45, "#e9e6df");
  sombrilla(X(545), Z(368), 1.4, "#f2f1ed", 2.5);

  /* ---------- zona de entrenamiento al aire libre (sur) ---------- */
  planoPx(150, 998, 292, 1092, "#262a2b", 0);
  planoPx(292, 985, 622, 1080, "#5f8a3e", 0);
  [[330, 1010], [380, 1030], [430, 1015], [480, 1040], [530, 1020], [575, 1045]].forEach(function (q) { planoPx(q[0], q[1], q[0] + 22, q[1] + 18, "#2c3330", 1); });
  var rx0 = X(185), rx1 = X(270), rz0 = Z(1015), rz1 = Z(1075);
  [[rx0, rz0], [rx1, rz0], [rx0, rz1], [rx1, rz1], [(rx0 + rx1) / 2, rz0], [(rx0 + rx1) / 2, rz1]].forEach(function (q) { caja(q[0] - 0.07, q[1] - 0.07, q[0] + 0.07, q[1] + 0.07, 0, 2.8, "#1a1d1e"); });
  caja(rx0, rz0 - 0.06, rx1, rz0 + 0.06, 2.7, 0.12, "#1a1d1e"); caja(rx0, rz1 - 0.06, rx1, rz1 + 0.06, 2.7, 0.12, "#1a1d1e");
  caja(rx0 - 0.06, rz0, rx0 + 0.06, rz1, 2.7, 0.12, "#1a1d1e"); caja(rx1 - 0.06, rz0, rx1 + 0.06, rz1, 2.7, 0.12, "#1a1d1e");
  valla(X(150), Z(1092), X(622), Z(1080), 2.2, 0.15);
  cajaPx(118, 1000, 150, 1100, 3, "#e6e1d6", { tapa: false });
  tejado(X(118), Z(1000), X(150), Z(1100), 3, 0.9, teja);

  /* ---------- terraza, kiosco y barbacoa (sureste) ---------- */
  planoPx(862, 788, 1110, 1002, "#9b7a64", 0);
  cajaPx(1055, 815, 1112, 992, 3.4, "#efe9dd", { tapa: false });
  tejado(X(1055), Z(815), X(1112), Z(992), 3.4, 1.2, teja);
  cajaPx(905, 948, 962, 1002, 3, "#efe9dd", { tapa: false });
  tejado(X(905), Z(948), X(962), Z(1002), 3, 1, teja);
  cajaPx(856, 955, 905, 1002, 2.6, "#e2ded4", { techo: "#24324a" });
  var gx = X(990), gz = Z(862), gr = 2.4, oct = circulo(gx, gz, gr, 8);
  oct.forEach(function (q) { prisma(circulo(q[0], q[1], 0.08, 4), 0, 2.6, "#6b4c33", { sombra: false }); });
  var cima = [gx, 4.1, gz];
  for (var o = 0; o < 8; o++) { var p1 = oct[o], p2 = oct[(o + 1) % 8]; cara([[p1[0], 2.6, p1[1]], [p2[0], 2.6, p2[1]], cima], variar("#c8622f", 0.1), 1, { centro: [gx, 1.5, gz] }); }
  solidos.push(oct.map(function (q) { return [q[0], 2.6, q[1]]; }).concat([cima]));
  sombrilla(X(1003), Z(800), 1.3, "#f4f4f2", 2.4);
  sombrilla(X(895), Z(835), 1.4, "#f7f7f5", 2.6);
  sombrilla(X(902), Z(878), 1.4, "#f7f7f5", 2.6);
  sombrilla(X(1040), Z(865), 1.3, "#f4f4f2", 2.4);
  [[940, 830], [960, 905], [1020, 920], [1030, 830]].forEach(function (q) { mesa(X(q[0]), Z(q[1])); });

  /* ---------- vegetación ---------- */
  [[60, 560], [52, 640], [60, 720], [55, 800], [62, 880], [60, 960]].forEach(function (q, i) { arbol(X(q[0]), Z(q[1]), 1.6 + (i % 2) * 0.4, 3.2); });
  arbol(X(400), Z(1155), 3.2, 6);
  arbol(X(25), Z(60), 2.2, 4.5); arbol(X(230), Z(65), 2.4, 5);
  for (var pp = 0; pp < 6; pp++) palmera(X(780 + pp * 62), Z(1128), 7 + (pp % 3));
  palmera(X(1165), Z(330), 9); palmera(X(1165), Z(700), 10);

  /* ---------- coches aparcados ---------- */
  var colores = ["#d9dcdf", "#2b2f33", "#8d949a", "#e8e8e8", "#1e3a5f", "#7a1f1f", "#c9ccd0", "#3d4a3f"];
  for (var c = 0; c < 8; c++) coche(X(770 + c * 44), Z(1172), 1.8, 4.2, true, colores[c % colores.length]);
  [[95, 125], [300, 70], [420, 45], [545, 35], [700, 40], [840, 60], [1090, 125], [1160, 140]].forEach(function (q, i) { coche(X(q[0]), Z(q[1]), 1.8, 4.3, false, colores[(i + 3) % colores.length]); });
  [[570, 1112], [600, 1150], [530, 1170]].forEach(function (q, i) { coche(X(q[0]), Z(q[1]), 1.8, 4.3, false, colores[(i + 5) % colores.length]); });

  /* ---------- edificios del entorno (contexto, casas bajas con tejado) ---------- */
  function casa(px0, py0, px1, py1, h, conTejado) {
    if (conTejado) { cajaPx(px0, py0, px1, py1, h, "#ece6da", { tapa: false }); tejado(X(px0), Z(py0), X(px1), Z(py1), h, 1.6, variar(teja, 0.12)); }
    else cajaPx(px0, py0, px1, py1, h, variar("#ebe6dc", 0.06), { techo: variar("#cfc6b6", 0.08) });
  }
  casa(150, -150, 290, -30, 6, false); casa(330, -170, 470, -40, 7.5, false); casa(490, -170, 610, -50, 6.5, true);
  casa(960, -110, 1060, -10, 5.5, true); casa(1070, -110, 1179, 0, 5.5, true);
  casa(1215, 330, 1330, 520, 5.5, true); casa(1215, 560, 1330, 760, 6, false); casa(1215, 800, 1330, 980, 5.5, true);
  casa(-170, 420, -40, 600, 5.5, true); casa(-170, 640, -40, 800, 6, false); casa(-170, 840, -40, 990, 5.5, true);
  casa(-140, 1050, 30, 1200, 5, true);

  /* ================= zonas ================= */
  var ZONAS = [
    { id: "tenis", p: [X(465), 5, Z(560)], es: "Tenis · 3 pistas", en: "Tennis · 3 courts", cam: { yaw: 0.25, pitch: 0.78, dist: 62, t: [X(465), 0, Z(715)] } },
    { id: "padel", p: [X(1000), 6, Z(515)], es: "Pádel · 3 pistas", en: "Padel · 3 courts", cam: { yaw: -0.55, pitch: 0.62, dist: 46, t: [X(1000), 0, Z(515)] } },
    { id: "club", p: [X(400), 9, Z(300)], es: "Club social y restaurante", en: "Clubhouse and restaurant", cam: { yaw: 0.15, pitch: 0.42, dist: 48, t: [X(440), 3, Z(330)] } },
    { id: "terraza", p: [X(985), 5, Z(900)], es: "Terraza, kiosco y barbacoa", en: "Terrace, kiosk and barbecue", cam: { yaw: 0.6, pitch: 0.5, dist: 30, t: [X(985), 1, Z(890)] } },
    { id: "entreno", p: [X(380), 4, Z(1035)], es: "Zona de entrenamiento", en: "Outdoor training area", cam: { yaw: 2.95, pitch: 0.62, dist: 36, t: [X(380), 0, Z(1040)] } },
  ];
  var etiquetas = ZONAS.map(function (z) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "maqueta__etq"; b.textContent = EN ? z.en : z.es;
    b.addEventListener("click", function () { volarA(z.cam); });
    capaEtiquetas.appendChild(b);
    return b;
  });
  document.querySelectorAll("[data-zona]").forEach(function (b) {
    var z = ZONAS.filter(function (q) { return q.id === b.getAttribute("data-zona"); })[0];
    if (z) b.addEventListener("click", function () { volarA(z.cam); raiz.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "center" }); });
  });

  /* ================= cámara ================= */
  var INICIAL = { yaw: 0.42, pitch: 0.72, dist: 105, t: [0, 0, 2] };
  var cam = { yaw: INICIAL.yaw, pitch: INICIAL.pitch, dist: INICIAL.dist, t: INICIAL.t.slice() };
  var anim = null, autoGiro = !reducido, ultimaInteraccion = -1e9, ultimaInteraccionReal = false;
  function volarA(obj) {
    autoGiro = false;
    var ini = { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist, t: cam.t.slice() };
    var dy = obj.yaw - ini.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    anim = { ini: ini, fin: { yaw: ini.yaw + dy, pitch: obj.pitch, dist: obj.dist, t: obj.t }, t0: performance.now(), dur: reducido ? 1 : 1000 };
    pedirFrame();
  }
  function limitar() {
    cam.pitch = Math.max(0.3, Math.min(1.42, cam.pitch));
    cam.dist = Math.max(14, Math.min(150, cam.dist));
    cam.t[0] = Math.max(-45, Math.min(45, cam.t[0])); cam.t[2] = Math.max(-45, Math.min(45, cam.t[2]));
  }

  /* ================= hora del día ================= */
  var CIELOS = [
    { arriba: hex("#5f9fdc"), abajo: hex("#cfe5f2"), luz: hex("#fff8ec"), amb: 0.58, dif: 0.55, dir: norm([-0.35, 1.0, 0.55]), sombra: 0.3, bruma: hex("#d6e6ee") },
    { arriba: hex("#2e3a86"), abajo: hex("#f2995c"), luz: hex("#ffb47c"), amb: 0.42, dif: 0.62, dir: norm([-1.0, 0.32, 0.25]), sombra: 0.34, bruma: hex("#e8a57a") },
    { arriba: hex("#070b1d"), abajo: hex("#1d2a52"), luz: hex("#a9bbff"), amb: 0.2, dif: 0.14, dir: norm([0.3, 1.0, -0.2]), sombra: 0, bruma: hex("#1b2547") },
  ];
  var hora = 0.5, sombrasCache = null;
  function cielo() {
    var h = hora * 2, i = Math.min(1, Math.floor(h)), t = h - i, a = CIELOS[i], b = CIELOS[i + 1];
    return {
      arriba: mezcla(a.arriba, b.arriba, t), abajo: mezcla(a.abajo, b.abajo, t), luz: mezcla(a.luz, b.luz, t), bruma: mezcla(a.bruma, b.bruma, t),
      amb: a.amb + (b.amb - a.amb) * t, dif: a.dif + (b.dif - a.dif) * t, dir: norm(mezcla(a.dir, b.dir, t)),
      sombra: a.sombra + (b.sombra - a.sombra) * t, noche: Math.max(0, (hora - 0.55) / 0.45),
    };
  }
  function textoHora() {
    if (hora < 0.25) return EN ? "Day" : "Día";
    if (hora < 0.75) return EN ? "Sunset" : "Atardecer";
    return EN ? "Night · floodlights on" : "Noche · focos encendidos";
  }
  if (rango) {
    hora = parseFloat(rango.value) / 100;
    rango.addEventListener("input", function () { hora = parseFloat(rango.value) / 100; horaTxt.textContent = textoHora(); rango.setAttribute("aria-valuetext", textoHora()); sombrasCache = null; pedirFrame(); });
    horaTxt.textContent = textoHora();
    rango.setAttribute("aria-valuetext", textoHora());
  }

  /* ================= sombras proyectadas ================= */
  function envolvente(pts) {
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [];
    for (var i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (var j = pts.length - 1; j >= 0; j--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], pts[j]) <= 0) up.pop(); up.push(pts[j]); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }
  function sombras(C) {
    if (sombrasCache) return sombrasCache;
    var d = C.dir;
    sombrasCache = solidos.map(function (s) {
      return envolvente(s.map(function (p) { var k = p[1] / Math.max(0.15, d[1]); return [p[0] - d[0] * k, p[2] - d[2] * k]; }))
        .map(function (q) { return [q[0], 0.02, q[1]]; });
    });
    return sombrasCache;
  }

  /* ================= render ================= */
  var W = 0, H = 0, dpr = 1;
  function tam() {
    // El tamaño se toma del contenedor, nunca del propio lienzo: así no puede crecer sin límite.
    canvas.style.width = "100%"; canvas.style.height = "100%"; canvas.style.display = "block";
    var r = raiz.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (!W && r.width < r.height) { INICIAL.dist = 88; if (!anim && !ultimaInteraccionReal) cam.dist = 88; }
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pedirFrame();
  }
  function base() {
    var cp = Math.cos(cam.pitch), pos = [cam.t[0] + Math.sin(cam.yaw) * cp * cam.dist, cam.t[1] + Math.sin(cam.pitch) * cam.dist, cam.t[2] + Math.cos(cam.yaw) * cp * cam.dist];
    var f = norm(sub(cam.t, pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
    return { pos: pos, f: f, r: r, u: u, fl: (Math.min(W, H) / 2) / Math.tan(0.42) };
  }
  function proyectar(p, B) {
    var d = sub(p, B.pos), z = dot(d, B.f);
    if (z < 0.5) return null;
    return [W / 2 + dot(d, B.r) * B.fl / z, H / 2 - dot(d, B.u) * B.fl / z, z];
  }
  function proyectarPol(pts3, B) {
    var NEAR = 0.4, cs = [], rec = [], out = [];
    for (var i = 0; i < pts3.length; i++) { var d = sub(pts3[i], B.pos); cs.push([dot(d, B.r), dot(d, B.u), dot(d, B.f)]); }
    for (var q = 0; q < cs.length; q++) {
      var A = cs[q], Bq = cs[(q + 1) % cs.length], ain = A[2] >= NEAR, bin = Bq[2] >= NEAR;
      if (ain) rec.push(A);
      if (ain !== bin) { var tt = (NEAR - A[2]) / (Bq[2] - A[2]); rec.push([A[0] + (Bq[0] - A[0]) * tt, A[1] + (Bq[1] - A[1]) * tt, NEAR]); }
    }
    if (rec.length < 3) return null;
    for (var m = 0; m < rec.length; m++) out.push([W / 2 + rec[m][0] * B.fl / rec[m][2], H / 2 - rec[m][1] * B.fl / rec[m][2], rec[m][2]]);
    return out;
  }
  function trazar(pts) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
  }
  function iluminar(pol, C, esSuelo) {
    var c = pol.c, k;
    if (esSuelo) k = C.amb + C.dif * C.dir[1];
    else {
      var n = norm(cross(sub(pol.p[1], pol.p[0]), sub(pol.p[2], pol.p[0])));
      k = C.amb + C.dif * Math.max(0, pol.dos ? Math.abs(dot(n, C.dir)) : dot(n, C.dir)) + pol.brillo * C.dif * 0.4;
    }
    var r = [Math.min(255, c[0] * k * C.luz[0] / 255), Math.min(255, c[1] * k * C.luz[1] / 255), Math.min(255, c[2] * k * C.luz[2] / 255)];
    if (C.noche > 0 && esSuelo && pol.capa >= -1 && pol.capa <= 3) r = mezcla(r, c, C.noche * 0.72);
    return r;
  }
  function brumear(c, z, C) { var f = Math.max(0, Math.min(0.8, (z - 110) / 300)); return f ? mezcla(c, C.bruma, f) : c; }

  // precálculos: orden del suelo y centros de los objetos
  var sueloOrden = suelo.map(function (p, i) { p.i = i; return p; }).sort(function (a, b) { return a.capa - b.capa || a.i - b.i; });
  var ultimoAntesDeSombras = null;
  sueloOrden.forEach(function (p) { if (p.capa <= 1) ultimoAntesDeSombras = p; });
  objetos.forEach(function (o) { var c = [0, 0, 0]; o.p.forEach(function (p) { c[0] += p[0] / o.p.length; c[1] += p[1] / o.p.length; c[2] += p[2] / o.p.length; }); o.cen = c; });

  var frame = null;
  function pedirFrame() { if (!frame) frame = requestAnimationFrame(render); }

  function render(t) {
    frame = null;
    if (anim) {
      var k = Math.min(1, (t - anim.t0) / anim.dur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cam.yaw = anim.ini.yaw + (anim.fin.yaw - anim.ini.yaw) * e;
      cam.pitch = anim.ini.pitch + (anim.fin.pitch - anim.ini.pitch) * e;
      cam.dist = anim.ini.dist + (anim.fin.dist - anim.ini.dist) * e;
      cam.t = mezcla(anim.ini.t, anim.fin.t, e);
      if (k >= 1) anim = null;
    } else if (autoGiro && t - ultimaInteraccion > 3000) {
      cam.yaw += 0.0011;
    }
    sano();
    var C = cielo(), B = base();

    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(C.arriba)); g.addColorStop(1, rgba(C.abajo));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (C.noche > 0.3) {
      ctx.fillStyle = "rgba(255,255,255," + Math.min(0.9, C.noche - 0.2) + ")";
      for (var s = 0; s < 80; s++) ctx.fillRect((s * 977) % 1000 / 1000 * W, (s * 613) % 1000 / 1000 * H * 0.5, 1.2, 1.2);
    }

    // suelo por capas; las sombras se pintan sobre el pavimento y bajo las líneas
    for (var i = 0; i < sueloOrden.length; i++) {
      var pol = sueloOrden[i], pts = proyectarPol(pol.p, B);
      if (pts) {
        var zc = 0; pts.forEach(function (q) { zc += q[2]; }); zc /= pts.length;
        trazar(pts); ctx.fillStyle = rgba(brumear(iluminar(pol, C, true), zc, C)); ctx.fill();
      }
      if (pol === ultimoAntesDeSombras && C.sombra > 0.01) {
        ctx.fillStyle = "rgba(15,20,35," + C.sombra + ")";
        sombras(C).forEach(function (sp) { var p2 = proyectarPol(sp, B); if (p2) { trazar(p2); ctx.fill(); } });
      }
    }

    if (C.noche > 0) {
      ctx.globalCompositeOperation = "lighter";
      focos.forEach(function (f) {
        var s2 = proyectar([f[0], 0, f[2]], B); if (!s2) return;
        var r = 11 * B.fl / s2[2];
        var rg = ctx.createRadialGradient(s2[0], s2[1], 0, s2[0], s2[1], r);
        rg.addColorStop(0, "rgba(255,240,205," + 0.16 * C.noche + ")"); rg.addColorStop(1, "rgba(255,240,205,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(s2[0], s2[1], r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    }

    var lista = [];
    for (var o = 0; o < objetos.length; o++) { var d = sub(objetos[o].cen, B.pos); lista.push({ o: objetos[o], z: dot(d, d) }); }
    lista.sort(function (a, b) { return b.z - a.z; });
    for (var l = 0; l < lista.length; l++) {
      var it = lista[l].o, pp = proyectarPol(it.p, B);
      if (!pp) continue;
      if (!it.dos) {
        var area = 0;
        for (var j = 0; j < pp.length; j++) { var a = pp[j], b = pp[(j + 1) % pp.length]; area += a[0] * b[1] - b[0] * a[1]; }
        if (area > 0) continue;
      }
      var cc = brumear(iluminar(it, C, false), Math.sqrt(lista[l].z), C);
      trazar(pp);
      ctx.fillStyle = rgba(cc, it.a);
      ctx.fill();
      if (it.a >= 1) { ctx.strokeStyle = rgba(cc, 1); ctx.lineWidth = 0.5; ctx.stroke(); }
    }

    if (C.noche > 0) {
      focos.forEach(function (f) {
        var s3 = proyectar(f, B); if (!s3) return;
        var r = Math.max(2, 0.9 * B.fl / s3[2]);
        var rg = ctx.createRadialGradient(s3[0], s3[1], 0, s3[0], s3[1], r * 3);
        rg.addColorStop(0, "rgba(255,252,232," + 0.85 * C.noche + ")"); rg.addColorStop(1, "rgba(255,252,232,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(s3[0], s3[1], r * 3, 0, Math.PI * 2); ctx.fill();
      });
    }

    // etiquetas sin solaparse (prioridad a la más cercana)
    var puestas = [];
    ZONAS.map(function (z, i) { return { i: i, s: proyectar(z.p, B) }; })
      .forEach(function (e) {
        var el = etiquetas[e.i], s4 = e.s;
        if (!s4 || s4[0] < -20 || s4[0] > W + 20 || s4[1] < 30 || s4[1] > H - 10) { el.hidden = true; return; }
        el.hidden = false;
        var w = el.offsetWidth || 120, h = el.offsetHeight || 26;
        s4 = [Math.max(w / 2 + 8, Math.min(W - w / 2 - 60, s4[0])), s4[1]];
        var r = [s4[0] - w / 2 - 4, s4[1] - h - 4, s4[0] + w / 2 + 4, s4[1] + 4];
        if (puestas.some(function (p) { return !(r[2] < p[0] || r[0] > p[2] || r[3] < p[1] || r[1] > p[3]); })) { el.hidden = true; return; }
        puestas.push(r);
        el.style.transform = "translate(" + Math.round(s4[0]) + "px," + Math.round(s4[1]) + "px) translate(-50%,-100%)";
      });

    if (anim || (autoGiro && !document.hidden)) pedirFrame();
  }

  /* ================= controles ================= */
  // Ratón: arrastrar gira e inclina, rueda acerca, Mayús/botón derecho desplaza.
  // Táctil: un dedo a los lados gira (arriba/abajo sigue desplazando la página),
  //         dos dedos: pellizcar acerca y moverlos arriba/abajo inclina.
  function tocar() { ultimaInteraccion = performance.now(); ultimaInteraccionReal = true; autoGiro = false; anim = null; }
  function sano() {
    if (![cam.yaw, cam.pitch, cam.dist, cam.t[0], cam.t[1], cam.t[2]].every(isFinite)) {
      cam.yaw = INICIAL.yaw; cam.pitch = INICIAL.pitch; cam.dist = INICIAL.dist; cam.t = INICIAL.t.slice();
    }
  }
  var raton = null;
  canvas.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "touch") return;
    tocar(); raton = [e.clientX, e.clientY];
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
  });
  canvas.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch" || !raton) return;
    var dx = e.clientX - raton[0], dy = e.clientY - raton[1];
    raton = [e.clientX, e.clientY];
    if (e.shiftKey || e.buttons === 2) {
      var B = base(), k = cam.dist / B.fl, fx = norm([B.f[0], 0, B.f[2]]);
      cam.t = [cam.t[0] - B.r[0] * dx * k + fx[0] * dy * k, 0, cam.t[2] - B.r[2] * dx * k + fx[2] * dy * k];
    } else {
      cam.yaw -= dx * 0.008;
      cam.pitch += dy * 0.006;
    }
    limitar(); sano(); pedirFrame();
  });
  function soltarRaton(e) { if (e.pointerType !== "touch") raton = null; }
  canvas.addEventListener("pointerup", soltarRaton);
  canvas.addEventListener("pointercancel", soltarRaton);

  var toque = null;
  function leerToques(t) {
    if (t.length === 1) return { n: 1, x: t[0].clientX, y: t[0].clientY };
    var a = t[0], b = t[1];
    return { n: 2, x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2, d: Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)) };
  }
  canvas.addEventListener("touchstart", function (e) {
    tocar();
    toque = leerToques(e.touches);
    if (toque.n === 2) toque.dist0 = cam.dist, toque.d0 = toque.d;
  }, { passive: true });
  canvas.addEventListener("touchmove", function (e) {
    if (!toque || !e.touches.length) return;
    var a = leerToques(e.touches);
    if (a.n !== toque.n) { toque = a; if (a.n === 2) { toque.dist0 = cam.dist; toque.d0 = a.d; } return; }
    if (a.n === 1) {
      cam.yaw -= (a.x - toque.x) * 0.009;
    } else {
      e.preventDefault();
      cam.dist = toque.dist0 * toque.d0 / a.d;
      cam.pitch += (a.y - toque.y) * 0.006;
    }
    toque.x = a.x; toque.y = a.y;
    limitar(); sano(); pedirFrame();
  }, { passive: false });
  function finToque(e) {
    if (!e.touches.length) { toque = null; return; }
    toque = leerToques(e.touches);
    if (toque.n === 2) { toque.dist0 = cam.dist; toque.d0 = toque.d; }
  }
  canvas.addEventListener("touchend", finToque);
  canvas.addEventListener("touchcancel", finToque);
  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  canvas.addEventListener("wheel", function (e) { e.preventDefault(); tocar(); cam.dist *= Math.exp(e.deltaY * 0.0012); limitar(); pedirFrame(); }, { passive: false });
  canvas.addEventListener("keydown", function (e) {
    var m = { ArrowLeft: [0.08, 0, 1], ArrowRight: [-0.08, 0, 1], ArrowUp: [0, 0.05, 1], ArrowDown: [0, -0.05, 1], "+": [0, 0, 0.9], "=": [0, 0, 0.9], "-": [0, 0, 1.1] }[e.key];
    if (!m) return;
    e.preventDefault(); tocar(); cam.yaw += m[0]; cam.pitch += m[1]; cam.dist *= m[2]; limitar(); pedirFrame();
  });
  raiz.querySelector("[data-zoom-mas]").addEventListener("click", function () { tocar(); cam.dist *= 0.8; limitar(); pedirFrame(); });
  raiz.querySelector("[data-zoom-menos]").addEventListener("click", function () { tocar(); cam.dist *= 1.25; limitar(); pedirFrame(); });
  raiz.querySelector("[data-reiniciar]").addEventListener("click", function () { volarA(INICIAL); });
  raiz.querySelector("[data-inclinar-mas]").addEventListener("click", function () { tocar(); cam.pitch += 0.15; limitar(); pedirFrame(); });
  raiz.querySelector("[data-inclinar-menos]").addEventListener("click", function () { tocar(); cam.pitch -= 0.15; limitar(); pedirFrame(); });
  raiz.__cam = cam;

  var tRes = null;
  window.addEventListener("resize", function () { clearTimeout(tRes); tRes = setTimeout(tam, 120); });
  document.addEventListener("visibilitychange", pedirFrame);
  tam();
})();
