/* Centro Deportivo Tenisur — interacción (sin dependencias) */
(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  var panel = document.getElementById("panel");
  var abrir = document.querySelector("[data-abrir-menu]");
  var cerrar = document.querySelector("[data-cerrar-menu]");
  var ultimoFoco = null;

  function abrirMenu() {
    if (!panel) return;
    ultimoFoco = document.activeElement;
    panel.classList.add("abierto");
    panel.setAttribute("aria-hidden", "false");
    abrir && abrir.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
    setTimeout(function () { cerrar && cerrar.focus(); }, 50);
  }
  function cerrarMenu() {
    if (!panel) return;
    panel.classList.remove("abierto");
    panel.setAttribute("aria-hidden", "true");
    abrir && abrir.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    ultimoFoco && ultimoFoco.focus && ultimoFoco.focus();
  }
  abrir && abrir.addEventListener("click", abrirMenu);
  cerrar && cerrar.addEventListener("click", cerrarMenu);
  panel && panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarMenu();
    if (e.key === "Tab") {
      var f = panel.querySelectorAll("a, button");
      if (!f.length) return;
      var primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 980 && panel && panel.classList.contains("abierto")) cerrarMenu(); });

  /* ---------- Abierto ahora (hora de Canarias) ---------- */
  // Horario publicado: L-V 08:30-22:30 · S-D 08:30-15:30
  var HORARIO = { 1: [510, 1350], 2: [510, 1350], 3: [510, 1350], 4: [510, 1350], 5: [510, 1350], 6: [510, 930], 0: [510, 930] };
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function ahoraCanarias() {
    try {
      var partes = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Atlantic/Canary", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var m = {};
      partes.forEach(function (p) { m[p.type] = p.value; });
      var dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(m.weekday);
      return { dia: dia, min: parseInt(m.hour, 10) * 60 + parseInt(m.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function hhmm(n) { var h = Math.floor(n / 60), mi = n % 60; return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi; }

  var a = ahoraCanarias();
  var hoy = HORARIO[a.dia];
  var texto, abierto = false;
  if (a.min >= hoy[0] && a.min < hoy[1]) {
    abierto = true;
    texto = "Abierto ahora · cierra a las " + hhmm(hoy[1]);
  } else if (a.min < hoy[0]) {
    texto = "Cerrado · abre hoy a las " + hhmm(hoy[0]);
  } else {
    var man = (a.dia + 1) % 7;
    texto = "Cerrado · abre mañana " + DIAS[man] + " a las " + hhmm(HORARIO[man][0]);
  }
  document.querySelectorAll("[data-estado]").forEach(function (el) {
    el.setAttribute("data-abierto", abierto ? "si" : "no");
    var t = el.querySelector("[data-estado-texto]");
    if (t) t.textContent = texto;
    el.hidden = false;
  });
  var finde = a.dia === 0 || a.dia === 6;
  document.querySelectorAll("[data-fila]").forEach(function (tr) {
    if ((tr.getAttribute("data-fila") === "finde") === finde) tr.classList.add("hoy");
  });

  /* ---------- Visor de galería ---------- */
  var visor = document.getElementById("visor");
  var grupos = {};
  document.querySelectorAll("[data-visor]").forEach(function (btn) {
    var g = btn.getAttribute("data-visor");
    (grupos[g] = grupos[g] || []).push(btn);
  });
  var actual = { g: null, i: 0 };

  function mostrar() {
    var btn = grupos[actual.g][actual.i];
    var img = btn.querySelector("img");
    var vi = visor.querySelector("img");
    vi.src = img.currentSrc || img.src;
    vi.alt = img.alt;
    visor.querySelector("figcaption").textContent = img.alt + " (" + (actual.i + 1) + " de " + grupos[actual.g].length + ")";
  }
  function mover(d) {
    var n = grupos[actual.g].length;
    actual.i = (actual.i + d + n) % n;
    mostrar();
  }
  if (visor && typeof visor.showModal === "function") {
    Object.keys(grupos).forEach(function (g) {
      grupos[g].forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          actual = { g: g, i: i };
          mostrar();
          visor.showModal();
        });
      });
    });
    visor.querySelector("[data-visor-cerrar]").addEventListener("click", function () { visor.close(); });
    visor.querySelector("[data-visor-ant]").addEventListener("click", function () { mover(-1); });
    visor.querySelector("[data-visor-sig]").addEventListener("click", function () { mover(1); });
    visor.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") mover(-1);
      if (e.key === "ArrowRight") mover(1);
    });
    visor.addEventListener("click", function (e) { if (e.target === visor || e.target.classList.contains("visor__in")) visor.close(); });
    var x0 = null;
    visor.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
      x0 = null;
    });
  } else {
    // Navegadores sin <dialog>: abrir la imagen directamente
    Object.keys(grupos).forEach(function (g) {
      grupos[g].forEach(function (btn) {
        btn.addEventListener("click", function () { window.open(btn.querySelector("img").src, "_blank", "noopener"); });
      });
    });
  }

  /* ---------- Mapa bajo demanda (sin cookies de Google hasta que se pulsa) ---------- */
  document.querySelectorAll("[data-cargar-mapa]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cont = btn.closest(".mapa");
      var ifr = document.createElement("iframe");
      ifr.src = cont.getAttribute("data-src");
      ifr.title = "Mapa: Centro Deportivo Tenisur, Avenida Austria 9, Adeje";
      ifr.loading = "lazy";
      ifr.referrerPolicy = "no-referrer-when-downgrade";
      cont.appendChild(ifr);
      var aviso = cont.querySelector(".mapa__aviso");
      aviso && aviso.remove();
    });
  });

  /* ---------- Formulario "Te llamamos" → WhatsApp ---------- */
  var form = document.getElementById("form-llamada");
  if (form) {
    var ok = document.getElementById("form-ok");
    var ko = document.getElementById("form-ko");
    function marcar(campo, msg) {
      var c = form.querySelector('[data-campo="' + campo + '"]');
      if (!c) return;
      if (msg) {
        c.setAttribute("data-error", "");
        c.querySelector(".campo__error").textContent = msg;
        c.querySelector("input, select, textarea").setAttribute("aria-invalid", "true");
      } else {
        c.removeAttribute("data-error");
        c.querySelector("input, select, textarea").removeAttribute("aria-invalid");
      }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ok.classList.remove("visible");
      ko.classList.remove("visible");
      var d = new FormData(form);
      var nombre = (d.get("nombre") || "").toString().trim();
      var tel = (d.get("telefono") || "").toString().replace(/[^\d+]/g, "");
      var motivo = (d.get("motivo") || "").toString();
      var franja = (d.get("franja") || "").toString();
      var msg = (d.get("mensaje") || "").toString().trim();
      var errores = 0;
      marcar("nombre", nombre.length < 2 ? (errores++, "Escribe tu nombre.") : "");
      marcar("telefono", tel.replace(/\D/g, "").length < 9 ? (errores++, "Escribe un teléfono de al menos 9 cifras.") : "");
      var priv = form.querySelector("#privacidad");
      if (!priv.checked) { errores++; priv.setAttribute("aria-invalid", "true"); } else priv.removeAttribute("aria-invalid");
      if (errores) {
        ko.textContent = errores === 1 && !priv.checked && nombre && tel.length >= 9
          ? "Acepta la política de privacidad para continuar."
          : "Revisa los campos marcados en rojo.";
        ko.classList.add("visible");
        var primero = form.querySelector("[aria-invalid='true']");
        primero && primero.focus();
        return;
      }
      var texto = "Hola, soy " + nombre + ". Me gustaría que me llamarais al " + tel +
        (franja ? " (mejor " + franja.toLowerCase() + ")" : "") +
        (motivo ? ". Motivo: " + motivo : "") +
        (msg ? ". " + msg : "") + ".";
      var url = "https://wa.me/" + form.getAttribute("data-whatsapp") + "?text=" + encodeURIComponent(texto);
      var btn = form.querySelector("button[type=submit]");
      btn.classList.add("is-loading");
      btn.setAttribute("aria-busy", "true");
      setTimeout(function () {
        btn.classList.remove("is-loading");
        btn.removeAttribute("aria-busy");
        ok.classList.add("visible");
        ok.focus();
        window.location.href = url;
      }, 400);
    });
  }

  /* Año del pie */
  document.querySelectorAll("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
