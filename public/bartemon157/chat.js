/* Asistente de Bartemon 157.
   Sabe la carta real, los precios y los dos locales — el mismo JSON que arma la página.
   Corre entero en el navegador: sin servidor, sin claves, sin costo por conversación.
   (En la versión con Zentral IA esto mismo pasa por un modelo de primera línea y
    además accede a stock, promociones y pedidos.) */
(function () {
  var D = JSON.parse(document.getElementById('cerebro').textContent);
  var hilo = document.getElementById('chatHilo');
  var rapidas = document.getElementById('chatRapidas');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var panel = document.getElementById('chat');
  var abrir = document.getElementById('chatAbrir');
  var cerrar = document.getElementById('chatCerrar');
  var saludado = false;

  var clp = function (n) { return '$' + n.toLocaleString('es-CL'); };
  var norm = function (s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // ---------------------------------------------------------------- burbujas
  function di(quien, html, tarda) {
    var b = document.createElement('div');
    b.className = 'burbuja burbuja--' + quien;
    b.innerHTML = html;
    hilo.appendChild(b);
    hilo.scrollTop = hilo.scrollHeight;
    return b;
  }

  function responde(html, sugerencias) {
    var esperando = di('bot', '<span class="puntos"><i></i><i></i><i></i></span>');
    setTimeout(function () {
      esperando.innerHTML = html;
      hilo.scrollTop = hilo.scrollHeight;
      pintaRapidas(sugerencias || porDefecto);
    }, 420);
  }

  // ---------------------------------------------------------------- fichas
  function ficha(b) {
    return '<div class="ficha"><strong>' + b.n + '</strong><em>' + clp(b.p) + '</em>' +
      (b.d ? '<span>' + b.d + '</span>' : '') +
      ((b.o && b.o.length) ? '<span class="opts">Opciones: ' + b.o.slice(0, 5).join(' · ') + '</span>' : '') +
      '</div>';
  }

  function pedir() {
    return '<div class="cta-chat">' + D.locales.map(function (L) {
      return '<a href="' + L.url + '" target="_blank" rel="noopener">Pedir en ' + L.n + '</a>';
    }).join('') + '</div>';
  }

  // ---------------------------------------------------------------- búsqueda
  function buscaBurger(t) {
    var q = norm(t);
    var todo = D.burgers.concat(D.acompana, D.tragos);
    // nombre exacto primero, después por palabra suelta del nombre, después por ingrediente
    var exacta = todo.filter(function (b) { return q.indexOf(norm(b.n)) >= 0; });
    if (exacta.length) return exacta;
    var porPalabra = todo.filter(function (b) {
      return norm(b.n).split(/\s+/).some(function (p) {
        return p.length > 3 && q.indexOf(p) >= 0;
      });
    });
    return porPalabra;
  }

  function porIngrediente(t) {
    var q = norm(t);
    var palabras = q.split(/\s+/).filter(function (p) { return p.length > 3; });
    if (!palabras.length) return [];
    return D.burgers.filter(function (b) {
      var d = norm(b.n + ' ' + b.d);
      return palabras.some(function (p) { return d.indexOf(p) >= 0; });
    });
  }

  // ---------------------------------------------------------------- cerebro
  var porDefecto = ['¿Cuál me recomiendas?', 'La más barata', 'Horarios', '¿Tienen vegetariana?'];

  function contesta(txt) {
    var q = norm(txt);

    // saludo
    if (/^(hola|buenas|hey|holi|buenos dias|buenas tardes|buenas noches)\b/.test(q)) {
      return responde('¡Hola! Soy el asistente de Bartemon 157. Me sé las ' + D.burgers.length +
        ' burgers, los precios y los horarios de los dos locales. ¿Qué andas buscando?');
    }

    // horarios
    if (/horario|hora|abren|cierran|abierto|cerrado|atienden|domingo|lunes/.test(q)) {
      return responde(D.locales.map(function (L) {
        return '<div class="ficha"><strong>' + L.n + '</strong><span>' + L.dir + '</span>' +
          L.hor.map(function (h) { return '<span>· ' + h + '</span>'; }).join('') + '</div>';
      }).join('') + pedir());
    }

    // dónde están
    if (/donde|direccion|ubicacion|llegar|queda|local|sucursal/.test(q)) {
      return responde('Estamos en dos puntos del valle:' + D.locales.map(function (L) {
        return '<div class="ficha"><strong>' + L.n + '</strong><span>' + L.dir + '</span>' +
          '<span>WhatsApp ' + L.fonoFmt + '</span></div>';
      }).join('') + pedir());
    }

    // delivery / cómo pedir
    if (/delivery|reparto|domicilio|pedir|pedido|retiro|llevar|encargar/.test(q)) {
      return responde('Puedes pedir online para retiro o delivery en cualquiera de los dos locales. ' +
        'Elige el que te quede más cerca:' + pedir());
    }

    // vegetariano / vegano — la opción vive en los MODIFICADORES, no en la descripción
    if (/vegetarian|vegan|falafel|sin carne/.test(q)) {
      var veg = D.burgers.filter(function (b) {
        return /falafel|vegetal|vegana|vegetarian/.test(norm(b.n + ' ' + b.d + ' ' + (b.o || []).join(' ')));
      });
      if (veg.length) {
        return responde('Sí. Casi todas las burgers se pueden pedir con <strong>falafel en vez de carne</strong>, ' +
          'y hay <strong>pan vegano</strong>. Por ejemplo:' + veg.slice(0, 3).map(ficha).join('') +
          'Eliges la opción al momento de pedir.' + pedir(),
          ['¿Qué trae la Bartemon?', 'La más barata', 'Horarios']);
      }
      return responde('En la carta online no veo la opción cargada hoy. Mejor pregunta directo al local:' + pedir());
    }

    // pollo
    if (/pollo|chicken/.test(q)) {
      var pollo = D.burgers.concat(D.acompana).filter(function (b) {
        return /pollo|chicken/.test(norm(b.n + ' ' + b.d));
      });
      if (pollo.length) return responde('De pollo tenemos:' + pollo.map(ficha).join('') + pedir());
    }

    // picante
    if (/picante|aji|spicy|pica/.test(q)) {
      var pic = D.burgers.filter(function (b) { return /aji|picante|merken|jalapen/.test(norm(b.n + ' ' + b.d)); });
      if (pic.length) return responde('Si te gusta el picante:' + pic.map(ficha).join('') + pedir());
    }

    // la más barata / económica
    if (/barat|economic|menos|mas barata|precio bajo|desde/.test(q)) {
      var b1 = D.burgers.slice().sort(function (a, b) { return a.p - b.p; })[0];
      return responde('La más económica es la <strong>' + b1.n + '</strong> a ' + clp(b1.p) + '.' +
        ficha(b1) + 'Y con papas queda una comida completa.' + pedir());
    }

    // la más grande / con hambre
    if (/grande|hambre|xl|doble|triple|mas contundente|llenador/.test(q)) {
      var big = D.burgers.slice().sort(function (a, b) { return b.p - a.p; })[0];
      return responde('Si vienes con hambre de verdad, la <strong>' + big.n + '</strong>:' + ficha(big) + pedir());
    }

    // recomendación
    if (/recomien|cual|mejor|rica|sugerencia|no se que|que pido|primera vez/.test(q)) {
      var casa = D.burgers.filter(function (b) { return /^bartemon$/i.test(b.n); });
      var big2 = D.burgers.filter(function (b) { return /big bt$/i.test(b.n); });
      var sug = casa.concat(big2).slice(0, 2);
      if (!sug.length) sug = D.burgers.slice(0, 2);
      return responde('Si es tu primera vez, parte por la de la casa:' + sug.map(ficha).join('') +
        'Las dos con papas y quedas listo.' + pedir(),
        ['¿Qué trae la Bartemon?', 'La más barata', '¿Tienen cerveza?']);
    }

    // tragos / barra
    if (/trago|coctel|pisco|cerveza|shop|chela|barra|alcohol|bebida|jugo/.test(q)) {
      return responde('No somos solo burgers: hay una barra completa con cócteles, cervezas artesanales y shop.' +
        D.tragos.slice(0, 3).map(ficha).join('') + 'Y bastante más en la carta del local.' + pedir());
    }

    // precio de algo puntual / búsqueda por nombre
    var enc = buscaBurger(q);
    if (enc.length) {
      if (enc.length === 1) return responde(ficha(enc[0]) + pedir());
      return responde('Encontré esto:' + enc.slice(0, 4).map(ficha).join('') + pedir());
    }

    // por ingrediente
    var ing = porIngrediente(q);
    if (ing.length) {
      return responde('Con eso adentro tengo:' + ing.slice(0, 4).map(ficha).join('') + pedir());
    }

    // precio general
    if (/precio|cuanto|vale|cuesta|valor/.test(q)) {
      return responde('Las burgers parten en ' + clp(D.desde) + ' y la mayoría está entre $6.900 y $8.500. ' +
        'Dime cuál te interesa y te digo el precio exacto.',
        D.burgers.slice(0, 3).map(function (b) { return b.n; }));
    }

    // no sé
    return responde('Esa no me la sé de memoria. Puedo ayudarte con la carta, los precios, ' +
      'los horarios y cómo pedir. Si es algo del local, escríbeles directo:' +
      '<div class="cta-chat"><a href="https://wa.me/' + D.locales[0].fono +
      '" target="_blank" rel="noopener">WhatsApp San Felipe</a></div>');
  }

  // ---------------------------------------------------------------- UI
  function pintaRapidas(lista) {
    rapidas.innerHTML = '';
    (lista || []).slice(0, 4).forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.onclick = function () { manda(t); };
      rapidas.appendChild(b);
    });
  }

  function manda(txt) {
    txt = (txt || '').trim();
    if (!txt) return;
    di('yo', txt.replace(/</g, '&lt;'));
    rapidas.innerHTML = '';
    contesta(txt);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    manda(input.value);
    input.value = '';
  });

  function abre() {
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add('abierto'); });
    abrir.classList.add('oculto');
    if (!saludado) {
      saludado = true;
      responde('¡Hola! Soy el asistente de Bartemon 157 🍔<br>Me sé las ' + D.burgers.length +
        ' burgers, los precios y los horarios de los dos locales. ¿Qué se te antoja?');
    }
    setTimeout(function () { input.focus(); }, 300);
  }

  function cierra() {
    panel.classList.remove('abierto');
    abrir.classList.remove('oculto');
    setTimeout(function () { panel.hidden = true; }, 260);
  }

  abrir.addEventListener('click', abre);
  cerrar.addEventListener('click', cierra);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) cierra();
  });
})();
