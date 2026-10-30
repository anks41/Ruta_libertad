/* Mi ruta hacia la libertad - interfaz de la calculadora orientativa
   Conecta el formulario (#calc-form) con la lógica de js/calculo.js.
   Los casos de ejemplo son inventados y sirven para probar la herramienta. */

(function () {
  'use strict';

  var C = window.CalculoPena;
  var form = document.getElementById('calc-form');
  if (!C || !form) return;

  var cajaErrores = document.getElementById('calc-errores');
  var cajaResultado = document.getElementById('calc-resultado');

  var COLORES = { tercio: 'var(--c1)', mitad: 'var(--band)', tres: 'var(--c2)', setenta: 'var(--c3)' };
  var NOTAS = {
    tercio: 'Cumplir el tiempo no basta: el permiso exige además los demás requisitos legales.',
    mitad: 'Cumplir el tiempo no basta: la decisión depende de la autoridad competente y de los demás requisitos.',
    tres: 'Cumplir el tiempo no basta: el juez de ejecución de penas valora conducta, arraigo y lo relativo a la víctima.',
    setenta: 'Cumplir el tiempo no basta: el beneficio tiene condiciones propias que debe verificar la autoridad competente.'
  };

  /* Casos de ejemplo (inventados). La fecha de reporte es fija para que el resultado sea siempre el mismo. */
  var EJEMPLOS = {
    A: { penaAnios: 6, penaMeses: 0, penaDias: 0, fechaInicio: '2025-06-01', fechaCorte: '2026-10-26', horasTrabajo: 540, horasEstudio: 180, horasEnsenanza: 0 },
    B: { penaAnios: 10, penaMeses: 0, penaDias: 0, fechaInicio: '2022-03-10', fechaCorte: '2026-10-26', horasTrabajo: 1800, horasEstudio: 900, horasEnsenanza: 300 },
    C: { penaAnios: 5, penaMeses: 0, penaDias: 0, fechaInicio: '2022-10-01', fechaCorte: '2026-10-26', horasTrabajo: 1500, horasEstudio: 600, horasEnsenanza: 300 }
  };

  var CAMPOS = ['penaAnios', 'penaMeses', 'penaDias', 'fechaInicio', 'fechaCorte', 'horasTrabajo', 'horasEstudio', 'horasEnsenanza'];

  function campo(nombre) {
    return form.elements[nombre];
  }

  function hoy() {
    var f = new Date();
    var m = f.getMonth() + 1;
    var d = f.getDate();
    return f.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function leer() {
    var datos = {};
    CAMPOS.forEach(function (n) { datos[n] = campo(n).value; });
    return datos;
  }

  function llenar(datos) {
    CAMPOS.forEach(function (n) {
      campo(n).value = datos[n] === undefined ? '' : datos[n];
    });
  }

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function dato(titulo, valor, detalle) {
    var caja = el('div', 'calc-stat');
    caja.appendChild(el('div', 'calc-stat-title', titulo));
    caja.appendChild(el('div', 'calc-stat-value', valor));
    if (detalle) caja.appendChild(el('div', 'calc-stat-detail', detalle));
    return caja;
  }

  function dias(n) {
    return n + (n === 1 ? ' día' : ' días');
  }

  function tarjetaFraccion(f) {
    var tarjeta = el('article', 'calc-frac');
    tarjeta.style.setProperty('--frac', COLORES[f.id]);

    var cab = el('div', 'calc-frac-head');
    cab.appendChild(el('span', 'calc-frac-num', f.etiqueta));
    cab.appendChild(el('span', null, f.beneficio));
    tarjeta.appendChild(cab);

    var cuerpo = el('div', 'calc-frac-body');
    cuerpo.appendChild(el('p', 'calc-frac-state', f.aplica ? '¿Aplica? SÍ (tiempo alcanzado)' : '¿Aplica? NO: faltan ' + C.textoDuracion(f.faltan)));

    var pista = el('div', 'calc-progress');
    pista.setAttribute('role', 'img');
    pista.setAttribute('aria-label', 'Avance hacia ' + f.etiqueta + ': ' + Math.floor(f.avance) + ' por ciento');
    var relleno = el('div', 'calc-progress-fill');
    relleno.style.width = f.avance + '%';
    pista.appendChild(relleno);
    cuerpo.appendChild(pista);

    cuerpo.appendChild(el('p', 'calc-frac-line', 'Días requeridos: ' + dias(f.umbral) + ' (' + C.textoDuracion(f.umbral) + ')'));
    cuerpo.appendChild(el('p', 'calc-frac-line', (f.aplica ? 'Se alcanzó hacia el ' : 'Fecha estimada: ') + f.fechaEstimadaTexto));
    cuerpo.appendChild(el('p', 'calc-frac-note', NOTAS[f.id]));
    tarjeta.appendChild(cuerpo);
    return tarjeta;
  }

  function pintar(r) {
    cajaResultado.textContent = '';

    var resumen = el('div', 'calc-summary');
    resumen.appendChild(dato('Condena', C.textoDuracion(r.penaDias), dias(r.penaDias)));
    resumen.appendChild(dato('Tiempo físico', C.textoDuracion(r.tiempoFisico), dias(r.tiempoFisico) + ' hasta el ' + r.fechaCorteTexto));
    var partes = r.actividades.map(function (a) { return a.nombre.toLowerCase() + ' ' + a.redimidos; }).join(', ');
    resumen.appendChild(dato('Redención 2×3', C.textoDuracion(r.redencion), dias(r.redencion) + ' (' + partes + ')'));
    resumen.appendChild(dato('Tiempo cumplido', C.textoDuracion(r.cumplido), dias(r.cumplido) + ' · ' + r.porcentaje.toFixed(1).replace('.', ',') + ' % de la condena'));
    cajaResultado.appendChild(resumen);

    var rejilla = el('div', 'calc-fracs');
    r.fracciones.forEach(function (f) { rejilla.appendChild(tarjetaFraccion(f)); });
    cajaResultado.appendChild(rejilla);

    var total = r.penaCumplida
      ? '¿Pena cumplida? SÍ. Por este cómputo, el tiempo cumplido iguala o supera la condena. Verifique los datos con la autoridad competente.'
      : '¿Pena cumplida? NO. Faltan ' + C.textoDuracion(r.faltaPena) + ' (' + dias(r.faltaPena) + ').';
    cajaResultado.appendChild(el('p', 'calc-total', total));
    cajaResultado.appendChild(el('p', 'calc-total', 'Fin de la pena sin redención: ' + r.finSinRedencionTexto + '. Fin de la pena con redención 2×3: ' + r.finConRedencionTexto + '.'));

    cajaResultado.appendChild(el('p', 'calc-disclaimer',
      'Resultado orientativo. Solo mide el requisito de tiempo (mes de 30 días, año de 360, redención 2×3 a partir de las horas). No evalúa delitos excluidos ni los demás requisitos, y no reemplaza el cómputo oficial del juez ni la asesoría jurídica.'));

    cajaResultado.hidden = false;
  }

  function mostrarErrores(lista) {
    cajaErrores.textContent = '';
    if (lista.length) {
      var ul = el('ul');
      lista.forEach(function (m) { ul.appendChild(el('li', null, m)); });
      cajaErrores.appendChild(ul);
      cajaErrores.hidden = false;
    } else {
      cajaErrores.hidden = true;
    }
  }

  function calcular() {
    var r = C.calcular(leer());
    if (!r.ok) {
      mostrarErrores(r.errores);
      cajaResultado.hidden = true;
      return;
    }
    mostrarErrores([]);
    pintar(r);
  }

  function limpiar() {
    form.reset();
    campo('fechaCorte').value = hoy();
    mostrarErrores([]);
    cajaResultado.hidden = true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    calcular();
  });

  form.addEventListener('reset', function (e) {
    e.preventDefault();
    limpiar();
  });

  var botones = document.querySelectorAll('[data-ejemplo]');
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener('click', function (e) {
      var datos = EJEMPLOS[e.currentTarget.getAttribute('data-ejemplo')];
      if (!datos) return;
      llenar(datos);
      calcular();
    });
  }

  campo('fechaCorte').value = hoy();
})();
