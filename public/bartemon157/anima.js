/* Bartemon 157 — "La plancha responde"
   ─────────────────────────────────────────────────────────────────────────────
   El dedo del visitante es el calor. Un SOLO requestAnimationFrame mueve los
   seis momentos: parallax del hero, lente de brasa, cinta arrastrable, card
   viva, imán de los CTA y rescoldo del cierre.

   Reglas de la casa:
   · sólo se animan transform y opacity;
   · las lecturas de layout van todas al principio del frame, antes de escribir;
   · el loop se apaga solo cuando no hay nada en pantalla que mover;
   · nunca se llama preventDefault en pointermove/touchmove — el scroll vertical
     del visitante es intocable;
   · prefers-reduced-motion apaga los seis, no cuatro.                          */
(function () {
  'use strict';

  var raiz    = document.documentElement;
  var quieto  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino    = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var items   = document.querySelectorAll('.anim');

  /* ── Sin animación: todo visible, nada se mueve. Salida temprana. ───────── */
  if (quieto || !('IntersectionObserver' in window)) {
    for (var q = 0; q < items.length; q++) items[q].classList.add('visible');
    raiz.classList.add('sin-anim');
    return;
  }
  raiz.classList.add('con-anim');

  /* ══════════════════════════════════════════ reveal al entrar en pantalla */
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var hermanos = Array.prototype.slice.call(el.parentNode.children);
      var d = Math.min(hermanos.indexOf(el), 8) * 60;
      el.style.transitionDelay = d + 'ms';

      var foto = el.classList.contains('burger') ? el.querySelector('.burger__foto') : null;
      if (foto) foto.style.transitionDelay = d + 'ms';

      el.classList.add('visible');
      obs.unobserve(el);

      /* Cuando termina de entrar: se limpia la máscara (no dejamos 14 capas
         enmascaradas colgando) y la card queda "lista" para el tilt, con su
         transición propia en vez de la del reveal. */
      if (foto) setTimeout(function () {
        foto.style.webkitMaskImage = 'none';
        foto.style.maskImage = 'none';
        el.classList.add('lista');
      }, d + 780);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  for (var i0 = 0; i0 < items.length; i0++) obs.observe(items[i0]);

  /* ══════════════════════════════════ el asistente entra al bajar del hero */
  var btnChat = document.getElementById('chatAbrir');
  var ctaHero = document.querySelector('.hero__botones');
  if (btnChat) {
    btnChat.classList.add('dormido');
    if (ctaHero && 'IntersectionObserver' in window) {
      // Duerme mientras se ve «Pedir en Rinconada»: en el celular lo tapaba (el temporizador
      // de 2,6 s lo despertaba aunque la persona siguiera arriba). Si vuelve al hero, se duerme.
      new IntersectionObserver(function (e) {
        btnChat.classList.toggle('dormido', e[0].isIntersecting);
      }).observe(ctaHero);
    } else {
      var despierta = function () { btnChat.classList.remove('dormido'); };
      setTimeout(despierta, 2600);
      window.addEventListener('scroll', function () {
        if (window.scrollY > window.innerHeight * 0.5) despierta();
      }, { passive: true });
    }
  }

  /* ═══════════════════════════════════════════════════ estado compartido  */
  var W = window.innerWidth, H = window.innerHeight, SC = window.scrollY;
  var corriendo = false;

  var mx = -9999, my = -9999;      // puntero crudo (viewport)
  var lx = -9999, ly = -9999;      // puntero suavizado
  var hayPuntero = false;
  var LERP = 0.16;                 // la comida se siente inmediata, no cinematográfica
  var tAct = 0;                    // última actividad (scroll o puntero)

  function pedir() {
    tAct = performance.now();
    if (!corriendo) { corriendo = true; requestAnimationFrame(marco); }
  }

  function ver(el, set) {
    if (!el) return;
    new IntersectionObserver(function (es) {
      set(es[0].isIntersecting);
      pedir();
    }, { threshold: 0 }).observe(el);
  }

  function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ═══════════════════════════════════ 1. HERO: parallax + lente de brasa */
  /* El hero cambió de forma: antes era una foto plana y la lente recortaba un
     círculo de ella. Ahora la hamburguesa son 7 capas con alfa flotando sobre
     la plancha, así que la lente pasó a ser una FUENTE DE LUZ que se pasea por
     encima — ya no necesita una segunda copia de la foto en registro. Por eso
     `.brasa__img` dejó de existir y todo lo que la tocaba va guardado. */
  var heroFoto = document.querySelector('.hero__fondo');
  var heroImg  = document.querySelector('.hero__plancha');
  var brasa    = document.querySelector('.brasa');
  var brasaImg = document.querySelector('.brasa__img');   /* null en el hero nuevo */
  var pista    = document.querySelector('.pista');
  var rHero = null, R = 150, brasaOn = false;
  var parObj = 0, parAct = 0;
  var verHero = true;

  if (heroImg) heroImg.style.transform = 'translate3d(0,0,0) scale(1.06)';

  function medirHero() {
    if (!heroFoto) return;
    var r = heroFoto.getBoundingClientRect();
    /* --r vive en .brasa, no en el contenedor. Leerlo del contenedor devolvía
       NaN → R caía al valor por defecto y la lente entraba tarde. */
    R = (brasa && parseFloat(getComputedStyle(brasa).getPropertyValue('--r'))) || 150;
    if (brasaImg) {
      brasaImg.style.setProperty('--fw', r.width + 'px');
      brasaImg.style.setProperty('--fh', r.height + 'px');
    }
  }
  ver(heroFoto, function (v) { verHero = v; });

  /* la lente sólo promueve capa mientras hay actividad: dejarla promovida
     permanentemente se come memoria en un teléfono de 3 GB */
  var tCapa = 0;
  function capaViva() {
    if (!brasa) return;
    if (!tCapa) brasa.style.willChange = 'transform';
    clearTimeout(tCapa);
    tCapa = setTimeout(function () { brasa.style.willChange = ''; tCapa = 0; }, 400);
  }

  /* ── autodemo: sin esto, en el teléfono nadie descubre que la foto se toca */
  var demo = { on: false, t0: 0, dur: 2600, cx: 0, cy: 0, w: 0, h: 0 };
  function arrancaDemo() {
    if (!brasa || !heroFoto || demo.usada) return;
    var r = heroFoto.getBoundingClientRect();
    if (r.width < 40 || r.bottom < 0) return;
    demo.cx = r.left + r.width / 2; demo.cy = r.top + r.height / 2;
    demo.w = r.width; demo.h = r.height;
    demo.on = true; demo.usada = true; demo.t0 = 0;
    mx = demo.cx; my = demo.cy; lx = mx; ly = my;
    capaViva();
    pedir();
  }
  function cortaDemo() {
    if (demo.on) { demo.on = false; }
    demo.usada = true;
  }

  if (pista) {
    if (fino) pista.textContent = 'Pasa el mouse';
    setTimeout(function () { if (pista) pista.classList.add('on'); }, 1400);
    setTimeout(function () { if (pista) pista.classList.remove('on'); }, 8000);
  }
  function ocultaPista() { if (pista) pista.classList.remove('on'); }

  /* ══════════════════════════════════════════════ 2. LA PRENSA (los 34 CTA)
     Sólo una clase CSS. Nada de wrappers, nada de preventDefault: los 17 href
     de sanfelipe y los 17 de rinconada siguen siendo anchors normales.        */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn,.pide');
    if (b) b.classList.add('prensa');
  }, { passive: true });
  function suelta() {
    var ps = document.querySelectorAll('.prensa');
    for (var i = 0; i < ps.length; i++) ps[i].classList.remove('prensa');
  }
  window.addEventListener('pointerup', suelta, { passive: true });
  window.addEventListener('pointercancel', suelta, { passive: true });

  /* ── el imán, ahora dentro del rAF y con distancia CIRCULAR (el check por
        ejes hacía saltar el botón con el cursor lejos, en diagonal) ───────── */
  var imanes = [];
  if (fino) {
    var els = document.querySelectorAll('.iman');
    for (var i1 = 0; i1 < els.length; i1++) {
      imanes.push({ el: els[i1], ax: 0, ay: 0, tx: 0, ty: 0, r: null, act: false });
    }
  }

  /* ═══════════════════════════════════════════════ 3. LA CINTA SE AGARRA  */
  var cinta   = document.querySelector('.cinta');
  var pistaC  = cinta && cinta.querySelector('.cinta__pista');
  var V_AUTO = 0.9, FRIC = 0.94, REENG = 0.04, UMBRAL_CLICK = 8, LOCK_EJE = 6;
  var off = 0, vel = V_AUTO, mitad = 0, verCinta = false;
  var agarra = false, ejeOk = false, horiz = false;
  var cx0 = 0, cy0 = 0, off0 = 0, recorrido = 0, idPtr = null;

  function medirCinta() {
    if (!pistaC) return;
    var m = pistaC.scrollWidth / 2;
    if (m > 0) mitad = m;
  }

  function tomaCinta() {
    if (!pistaC || !cinta) return;
    try {
      medirCinta();
      if (!mitad) return;
      cinta.classList.add('viva');
      pistaC.style.animation = 'none';
      pistaC.style.transform = 'translate3d(0,0,0)';
    } catch (err) {
      /* si algo revienta, se restituye la animación CSS de siempre */
      cinta.classList.remove('viva');
      pistaC.style.animation = '';
      pistaC.style.transform = '';
      mitad = 0;
    }
  }
  ver(cinta, function (v) { verCinta = v; });

  if (cinta) {
    /* Los 28 .cinta__item son <a>: el navegador arranca un arrastre NATIVO de
       enlace y mata el gesto con un pointercancel a los pocos píxeles. Anular
       'dragstart' es la única forma de agarrar la cinta — y es seguro, dragstart
       no tiene nada que ver con el scroll (jamás se toca touchmove). */
    cinta.addEventListener('dragstart', function (e) { e.preventDefault(); });

    cinta.addEventListener('pointerdown', function (e) {
      if (!mitad) return;
      agarra = true; ejeOk = false; horiz = false; recorrido = 0;
      cx0 = e.clientX; cy0 = e.clientY; off0 = off; idPtr = e.pointerId;
      pedir();
    }, { passive: true });

    cinta.addEventListener('pointermove', function (e) {
      if (!agarra || e.pointerId !== idPtr) return;
      var dx = e.clientX - cx0, dy = e.clientY - cy0;
      if (!ejeOk) {
        if (Math.abs(dx) < LOCK_EJE && Math.abs(dy) < LOCK_EJE) return;
        ejeOk = true;
        horiz = Math.abs(dx) > Math.abs(dy);
        /* Si el gesto es vertical soltamos TODO: el visitante quiere bajar y la
           página tiene que bajar. Este es el riesgo nº1 en teléfono. */
        if (!horiz) { agarra = false; idPtr = null; return; }
        try { cinta.setPointerCapture(e.pointerId); } catch (err) {}
        cinta.classList.add('agarrada');
      }
      if (!horiz) return;
      var nuevo = off0 - dx;
      vel = vel * 0.72 + (nuevo - off) * 0.28;
      off = nuevo;
      recorrido = Math.abs(dx);
      pedir();
    }, { passive: true });

    var soltarCinta = function (e) {
      if (!agarra) return;
      agarra = false; idPtr = null;
      cinta.classList.remove('agarrada');
      try { if (e && e.pointerId != null) cinta.releasePointerCapture(e.pointerId); } catch (err) {}
      pedir();
    };
    cinta.addEventListener('pointerup', soltarCinta, { passive: true });
    cinta.addEventListener('pointercancel', soltarCinta, { passive: true });
    window.addEventListener('pointerup', soltarCinta, { passive: true });

    /* Guarda de clic en FASE DE CAPTURA: un arrastre no navega, un toque
       limpio (< 8 px) sí. Los 28 .cinta__item siguen apuntando a #carta. */
    cinta.addEventListener('click', function (e) {
      if (recorrido > UMBRAL_CLICK) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ══════════════════════════════════ 4. LA CARTA: card viva (tilt + brillo) */
  var zona  = document.querySelector('.burgers');
  var cards = zona ? Array.prototype.slice.call(zona.querySelectorAll('.burger')) : [];
  var medidas = [], verBurgers = false, cardViva = null;

  function medirCards() {
    medidas = cards.map(function (c) {
      var r = c.getBoundingClientRect();
      return { t: r.top + window.scrollY, h: r.height };
    });
  }
  ver(zona, function (v) {
    verBurgers = v;
    if (!v && cardViva) { cardViva.classList.remove('viva'); cardViva = null; }
  });

  function pintaViva(c) {
    if (c === cardViva) return;
    if (cardViva) cardViva.classList.remove('viva');
    cardViva = c;
    if (c) c.classList.add('viva');
  }

  if (zona && fino) {
    /* UN listener delegado, no 14 */
    zona.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.burger');
      if (!c) { pintaViva(null); return; }
      var r = c.getBoundingClientRect();
      var px = e.clientX - r.left, py = e.clientY - r.top;
      c.style.setProperty('--rx', ((0.5 - py / r.height) * 6).toFixed(2) + 'deg');
      c.style.setProperty('--ry', ((px / r.width - 0.5) * 8).toFixed(2) + 'deg');
      c.style.setProperty('--gx', ((px / r.width) * 100).toFixed(1) + '%');
      c.style.setProperty('--gy', ((py / r.height) * 100).toFixed(1) + '%');
      pintaViva(c);
    }, { passive: true });
    zona.addEventListener('pointerleave', function () {
      if (cardViva) {
        cardViva.style.setProperty('--rx', '0deg');
        cardViva.style.setProperty('--ry', '0deg');
      }
      pintaViva(null);
    }, { passive: true });
  }

  /* ══════════════════════════ 4b. PRUEBA SOCIAL: los números giran hacia arriba
     El valor final ya está escrito en el HTML: esto sólo lo re-anima. Los
     contadores viven dentro del mismo rAF, no en un loop aparte.             */
  var contando = [];
  var nums = document.querySelectorAll('.prueba .num');
  if (nums.length) {
    var obsN = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        obsN.unobserve(e.target);
        contando.push({ el: e.target, fin: parseFloat(e.target.getAttribute('data-n')) || 0, t0: 0 });
        pedir();
      });
    }, { threshold: 0.55 });
    for (var n0 = 0; n0 < nums.length; n0++) obsN.observe(nums[n0]);
  }

  /* ══════════════════════════════════════════════ 5. EL RESCOLDO DEL CIERRE */
  var cierre   = document.querySelector('.cierre');
  var rescoldo = document.querySelector('.rescoldo');
  var verCierre = false, rCierre = null, rescOn = false;
  ver(cierre, function (v) {
    verCierre = v;
    if (!v && rescoldo && rescOn) { rescoldo.classList.remove('on'); rescOn = false; }
  });

  /* ═══════════════════════════════════════════════════════ el puntero ════ */
  window.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    hayPuntero = true;
    if (demo.on) { demo.on = false; lx = mx; ly = my; }
    cortaDemo();
    capaViva();
    pedir();
  }, { passive: true });

  window.addEventListener('pointerdown', function (e) {
    mx = e.clientX; my = e.clientY;
    hayPuntero = true;
    if (demo.on) { demo.on = false; lx = mx; ly = my; }
    cortaDemo();
    ocultaPista();
    capaViva();
    pedir();
  }, { passive: true });

  window.addEventListener('wheel', cortaDemo, { passive: true });
  window.addEventListener('touchstart', function () { ocultaPista(); cortaDemo(); }, { passive: true });

  window.addEventListener('scroll', function () {
    SC = window.scrollY;
    pedir();
  }, { passive: true });

  var tRes = 0;
  window.addEventListener('resize', function () {
    clearTimeout(tRes);
    tRes = setTimeout(function () {
      W = window.innerWidth; H = window.innerHeight;
      medirHero(); medirCinta(); medirCards();
      pedir();
    }, 150);
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════ EL LOOP ════ */
  function necesita(ahora) {
    if (verCinta && mitad) return true;          // la cinta sí pide frames siempre
    if (contando.length) return true;
    if (ahora - tAct < 600) return true;         // cola tras el último scroll/gesto
    if (verHero) {
      if (demo.on) return true;
      if (Math.abs(parObj - parAct) > 0.1) return true;
      if (Math.abs(mx - lx) > 0.4 || Math.abs(my - ly) > 0.4) return true;
    }
    for (var i = 0; i < imanes.length; i++) {
      var m = imanes[i];
      if (m.act || Math.abs(m.ax) > 0.05 || Math.abs(m.ay) > 0.05) return true;
    }
    return false;
  }

  function marco(ts) {
    /* ───────────── FASE DE LECTURA: todo el layout junto, antes de escribir */
    if (verHero && heroFoto) rHero = heroFoto.getBoundingClientRect();
    if (verCierre && cierre)  rCierre = cierre.getBoundingClientRect();
    for (var i = 0; i < imanes.length; i++) imanes[i].r = imanes[i].el.getBoundingClientRect();

    /* ───────────── autodemo: alimenta el puntero por el mismo lerp */
    if (demo.on) {
      if (!demo.t0) demo.t0 = ts;
      var u = (ts - demo.t0) / demo.dur;
      if (u >= 1) { demo.on = false; }
      else {
        var t = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;  // easeInOutQuad
        mx = demo.cx + 0.30 * demo.w * Math.sin(t * 2.4 * Math.PI);
        my = demo.cy + 0.16 * demo.h * Math.sin(t * 3.4 * Math.PI + 1.1);
      }
    }

    /* ───────────── suavizado del puntero (uno solo para todos los momentos) */
    if (lx < -9000) { lx = mx; ly = my; }
    lx += (mx - lx) * LERP;
    ly += (my - ly) * LERP;

    /* ───────────── FASE DE ESCRITURA — sólo transform y opacity */

    /* parallax del hero */
    if (verHero && heroImg) {
      parObj = Math.min(SC, H * 1.25) * 0.18;
      parAct += (parObj - parAct) * 0.12;
      heroImg.style.transform = 'translate3d(0,' + parAct.toFixed(2) + 'px,0) scale(1.06)';
    }

    /* la lente de brasa */
    if (verHero && brasa && rHero && rHero.width) {
      var dentro = (hayPuntero || demo.on) &&
                   mx > rHero.left - R && mx < rHero.right + R &&
                   my > rHero.top - R  && my < rHero.bottom + R;
      if (dentro !== brasaOn) { brasaOn = dentro; brasa.classList.toggle('on', dentro); }
      if (dentro) {
        var ex = lx - rHero.left, ey = ly - rHero.top;
        brasa.style.transform = 'translate3d(' + ex.toFixed(1) + 'px,' + ey.toFixed(1) + 'px,0)';
        if (brasaImg) {
          /* la foto caliente tiene que quedar EN REGISTRO con la fría: replica
             el parallax y el scale del <img> base, si no se desalinea */
          brasaImg.style.transform = 'translate3d(' + (R - ex).toFixed(1) + 'px,' +
                                     (R - ey + parAct).toFixed(1) + 'px,0) scale(1.06)';
        }
      }
    }

    /* la cinta */
    if (verCinta && mitad && pistaC) {
      if (!agarra) {
        if (Math.abs(vel) > V_AUTO) vel *= FRIC;
        else vel += (V_AUTO - vel) * REENG;
        off += vel;
      }
      off = ((off % mitad) + mitad) % mitad;
      pistaC.style.transform = 'translate3d(' + (-off).toFixed(2) + 'px,0,0)';
    }

    /* la card viva en teléfono: el input es el scroll, no el mouse */
    if (verBurgers && !fino && medidas.length) {
      var medio = SC + H / 2, elegida = null, mejor = 2;
      for (var k = 0; k < cards.length; k++) {
        var md = medidas[k];
        if (!md) continue;
        if (md.t + md.h < SC - 160 || md.t > SC + H + 160) continue;
        var d = limita(((md.t + md.h / 2) - medio) / (H / 2), -1, 1);
        cards[k].style.setProperty('--rx', (d * -4.5).toFixed(2) + 'deg');
        cards[k].style.setProperty('--gy', (50 - d * 30).toFixed(1) + '%');
        var ad = Math.abs(d);
        if (ad < 0.35 && ad < mejor) { mejor = ad; elegida = cards[k]; }
      }
      pintaViva(elegida);
    }

    /* el rescoldo del cierre */
    if (verCierre && rescoldo && rCierre) {
      var rx, ry, encima = false;
      if (fino && hayPuntero) {
        encima = my > rCierre.top - 80 && my < rCierre.bottom + 80;
        rx = lx - rCierre.left;
        ry = ly - rCierre.top;
      }
      if (!encima) {
        /* sin dedo encima el rescoldo SUBE por la sección a medida que la
           alcanzas: llega encendida justo cuando aparecen los dos botones */
        var p = limita((H - rCierre.top) / (H + rCierre.height), 0, 1);
        rx = rCierre.width * 0.5 + Math.sin(p * 2 * Math.PI) * rCierre.width * 0.22;
        ry = rCierre.height * (1 - p);
      }
      if (!rescOn) { rescoldo.classList.add('on'); rescOn = true; }
      rescoldo.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    }

    /* el imán de los CTA */
    for (var j = 0; j < imanes.length; j++) {
      var m2 = imanes[j], r2 = m2.r;
      if (!r2 || !r2.width) continue;
      var dx2 = mx - (r2.left + r2.width / 2);
      var dy2 = my - (r2.top + r2.height / 2);
      var cerca = hayPuntero && Math.hypot(dx2, dy2) < r2.width / 2 + 90;
      if (cerca !== m2.act) {
        m2.act = cerca;
        m2.el.classList.toggle('imantado', cerca);
      }
      m2.tx = cerca ? limita(dx2 * 0.055, -6, 6) : 0;
      m2.ty = cerca ? limita(dy2 * 0.055, -6, 6) : 0;
      if (!cerca && Math.abs(m2.ax) < 0.05 && Math.abs(m2.ay) < 0.05) {
        if (m2.ax !== 0 || m2.ay !== 0) {
          m2.ax = 0; m2.ay = 0;
          m2.el.style.removeProperty('--ix');
          m2.el.style.removeProperty('--iy');
        }
        continue;
      }
      m2.ax += (m2.tx - m2.ax) * 0.18;
      m2.ay += (m2.ty - m2.ay) * 0.18;
      m2.el.style.setProperty('--ix', m2.ax.toFixed(2) + 'px');
      m2.el.style.setProperty('--iy', m2.ay.toFixed(2) + 'px');
    }

    /* los contadores de la prueba social */
    for (var c = contando.length - 1; c >= 0; c--) {
      var ct = contando[c];
      if (!ct.t0) ct.t0 = ts;
      var uc = Math.min((ts - ct.t0) / 900, 1);
      ct.el.textContent = Math.round(ct.fin * (1 - Math.pow(1 - uc, 3)));
      if (uc >= 1) { ct.el.textContent = ct.fin; contando.splice(c, 1); }
    }

    if (necesita(ts)) requestAnimationFrame(marco);
    else corriendo = false;
  }

  /* ═══════════════════════════════════════════════════════════ arranque ══ */
  function arranca() {
    W = window.innerWidth; H = window.innerHeight; SC = window.scrollY;
    medirHero();
    medirCards();
    tomaCinta();
    pedir();
    setTimeout(arrancaDemo, 1100);
  }

  if (document.readyState === 'complete') arranca();
  else window.addEventListener('load', arranca);

  /* ═══════════════ 6. LA HAMBURGUESA SE POSA ═════════════════════════════
     🔴 El estado por defecto en el CSS es POSADA. Aquí se la levanta para
     dejarla caer. Al revés —por defecto en el aire— cualquier fallo de este
     archivo dejaría el hero VACÍO, que es el peor error posible en lo primero
     que ve el visitante. Con reduced-motion no se toca nada.

     No se despieza por capas: se probó y se ve cortada (una foto plana no
     guarda lo que hay debajo de cada ingrediente). El movimiento es el
     aterrizaje. */
  (function () {
    var hero = document.querySelector('.hero');
    var burger = hero && hero.querySelector('.bt-burger');
    if (!hero || !burger || quieto) return;

    /* Arranca en el primer frame pintado, no en 'load': esperar a que bajen
       video y fuentes hace que caiga con el visitante ya mirándola posada. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('armando'); });
    });

    /* El vaivén lento se enciende SÓLO cuando terminó el aterrizaje: si se
       solapan, las dos animaciones pelean por el transform y da un tirón. */
    burger.addEventListener('animationend', function (e) {
      if (e.animationName === 'btCae') hero.classList.add('posada');
    });
  })();

  /* ═══════════════ 7. EL HUMO DE LA PLANCHA ══════════════════════════════
     No se descarga nunca "por si acaso": son 305 KB. Sólo entra si el
     visitante no pidió movimiento reducido ni ahorro de datos, y si la
     conexión no se declaró lenta. El video va en opacity 0 hasta que corre,
     así que si no llega no se nota; por lo mismo no lleva póster (no se veía
     nunca y bajaba 88 KB). WCAG 2.2.2: botón de pausa obligatorio. ──── */
  (function () {
    var vid = document.querySelector('.hero__humo');
    if (!vid) return;
    var con = navigator.connection || {};
    var lenta = con.saveData === true || /(^|-)2g$/.test(con.effectiveType || '');
    var chica = !window.matchMedia('(min-width:900px)').matches;
    if (quieto || lenta || chica) return;

    var pausa = document.querySelector('.hero__pausa');
    vid.src = vid.getAttribute('data-src');

    vid.addEventListener('canplay', function () {
      vid.classList.add('on');
      if (pausa) pausa.hidden = false;
    }, { once: true });

    /* 🔴 El .catch() de play() va VACÍO a propósito: si el observer de pausa
       llama pause() con la promesa de play() aún pendiente, ésta rechaza con
       AbortError, y cualquier cosa que se haga ahí (como sacar el video del
       DOM) lo borra sin que el archivo tenga nada malo. */
    var quiere = true;
    function intenta() { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    intenta();

    if (pausa) {
      pausa.addEventListener('click', function () {
        quiere = !quiere;
        if (quiere) { intenta(); pausa.innerHTML = '&#9613;&#9613;'; }
        else { vid.pause(); pausa.innerHTML = '&#9654;'; }
        pausa.setAttribute('aria-label', quiere ? 'Pausar el humo del fondo'
                                                : 'Reanudar el humo del fondo');
      });
    }
    /* Fuera de pantalla no gasta batería decodificando. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && quiere) intenta();
          else if (!e.isIntersecting) vid.pause();
        });
      }, { threshold: 0.01 }).observe(vid);
    }
  })();


  /* ── La hamburguesa se arma sola ────────────────────────────────────────
     Dispara con IntersectionObserver, no con scroll-scrub: el scrub obliga a
     recalcular en cada frame y es justo donde se nota el tirón en un teléfono
     de gama media. Así, además, la secuencia SIEMPRE termina — no se queda a
     medio armar si el visitante scrollea rápido. Una sola vez. ──────────── */
  var arma = document.querySelector('.arma');
  if (arma) {
    if (quieto || !('IntersectionObserver' in window)) {
      arma.classList.add('armada');
    } else {
      var oArma = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('armada');
          oArma.unobserve(e.target);
        });
      }, { threshold: 0.3 });
      oArma.observe(arma);
    }
  }

  /* ═══════════════ 9. ¿ESTÁ ABIERTO AHORA? ═══════════════════════════════
     Los dos locales tienen horarios distintos y uno de ellos cierra pasada la
     medianoche. Quien entra a las 22:40 un domingo necesita saber a cuál pedir
     ANTES de elegir la hamburguesa, no después de que no le contesten.

     🔴 La hora se toma SIEMPRE en America/Santiago, no la del computador del
     visitante: alguien en Madrid mirando la carta vería "cerrado" a las 20:00
     de Chile. El horario viene del mismo bloque de datos que se imprime en la
     tarjeta, así que no hay dos verdades que se puedan desincronizar.

     El estado nace `hidden` en el HTML: si este archivo falla, no se muestra un
     "abierto" que podría ser mentira — se ven las horas, que es el estado
     actual de la página. ─────────────────────────────────────────────────── */
  (function () {
    var nodo = document.getElementById('cerebro');
    if (!nodo) return;
    var datos;
    try { datos = JSON.parse(nodo.textContent); } catch (e) { return; }
    var locales = (datos && datos.locales) || [];
    if (!locales.length) return;

    var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    /* Minutos desde medianoche y día de la semana EN CHILE. Se saca de
       Intl con la zona fijada, que es la única forma de no depender del reloj
       ni de la zona del dispositivo. */
    function ahoraEnChile() {
      var f;
      try {
        f = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Santiago', hour12: false,
          weekday: 'short', hour: '2-digit', minute: '2-digit'
        }).formatToParts(new Date());
      } catch (e) { return null; }          /* navegador sin zonas: no se opina */
      var p = {};
      f.forEach(function (x) { p[x.type] = x.value; });
      var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
      var h = parseInt(p.hour, 10), m = parseInt(p.minute, 10);
      if (dow < 0 || isNaN(h) || isNaN(m)) return null;
      return { dia: dow, min: (h % 24) * 60 + m };
    }

    function hhmm(m) {
      m = ((m % 1440) + 1440) % 1440;
      return String(Math.floor(m / 60)).padStart(2, '0') + ':' +
             String(m % 60).padStart(2, '0');
    }

    /* Devuelve {abierto, cierra} o {abierto:false, abre, dia}. */
    function estado(horas, hoy) {
      var h = horas[hoy.dia];
      if (h && hoy.min >= h[0] && hoy.min < h[1]) return { abierto: true, cierra: h[1] };

      /* 🔴 La sesión de AYER puede seguir viva: el viernes cierra a las 01:00,
         así que a las 00:30 del sábado la que está abierta es la del viernes. */
      var ayer = horas[(hoy.dia + 6) % 7];
      if (ayer && ayer[1] > 1440 && hoy.min < ayer[1] - 1440)
        return { abierto: true, cierra: ayer[1] };

      /* Cerrada: la próxima apertura. Hoy si aún no abre, si no el primer día
         que tenga horario, mirando hasta una semana completa. */
      if (h && hoy.min < h[0]) return { abierto: false, abre: h[0], en: 0 };
      for (var i = 1; i <= 7; i++) {
        var d = (hoy.dia + i) % 7;
        if (horas[d]) return { abierto: false, abre: horas[d][0], en: i, dia: d };
      }
      return null;
    }

    function texto(e) {
      if (!e) return null;
      if (e.abierto) return { on: true, txt: 'Abierto ahora · cierra ' + hhmm(e.cierra) };
      if (e.en === 0) return { on: false, txt: 'Cerrado · abre hoy a las ' + hhmm(e.abre) };
      if (e.en === 1) return { on: false, txt: 'Cerrado · abre mañana a las ' + hhmm(e.abre) };
      return { on: false, txt: 'Cerrado · abre el ' + DIAS[e.dia] + ' a las ' + hhmm(e.abre) };
    }

    function pinta() {
      var hoy = ahoraEnChile();
      if (!hoy) return;
      locales.forEach(function (L) {
        var caja = document.querySelector('[data-local="' + L.key + '"]');
        if (!caja || !L.horas) return;

        var t = texto(estado(L.horas, hoy));
        var sp = caja.querySelector('[data-estado]');
        if (sp && t) {
          sp.textContent = t.txt;
          sp.classList.toggle('estado--on', t.on);
          sp.hidden = false;
        }

        /* La línea del horario que rige HOY, marcada. Con 3 líneas por local,
           encontrar la de hoy a ojo es trabajo que la página puede ahorrar. */
        caja.querySelectorAll('.local__hor li').forEach(function (li) {
          var d = (li.getAttribute('data-dia') || '').split(',');
          li.classList.toggle('hoy', d.indexOf(String(hoy.dia)) >= 0);
        });
      });
    }

    pinta();
    /* Se repinta cada minuto: alguien que deja la carta abierta mientras decide
       no puede quedarse con un "abierto" de hace media hora. */
    setInterval(pinta, 60000);
  })();

})();
