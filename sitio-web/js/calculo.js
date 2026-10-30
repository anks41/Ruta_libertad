/* Mi ruta hacia la libertad - lógica del cálculo (sin interfaz)
   Reproduce las fórmulas del Excel "Cómputo de tiempos, beneficios y subrogados" (v2026).
   Es una herramienta ORIENTATIVA: solo mide el requisito de tiempo. No decide beneficios.

   Fórmulas (iguales al Excel):
   - Condena en días = años x 360 + meses x 30 + días.
   - Tiempo físico = fecha de reporte - fecha de captura (no cuenta el día de captura).
   - Redención 2x3, por cada actividad (trabajo, estudio, enseñanza):
       días equivalentes = ENTERO(horas / 6);  días redimidos = ENTERO(días equivalentes / 3) x 2.
   - Tiempo cumplido = tiempo físico + total redimido.
   - Días requeridos = REDONDEAR(condena x fracción): 1/3, 1/2, 3/5 y 70 %.
   - Fecha estimada = fecha de reporte + (requeridos - cumplido); si ya se alcanzó, queda en el pasado.
   - Fin de la pena = captura + condena (sin redención) y captura + condena - redimido (con redención).

   Se puede usar en el navegador (window.CalculoPena) o en Node (require). */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CalculoPena = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIAS_MES = 30;
  var DIAS_ANIO = 360;
  var MS_DIA = 86400000;
  var HORAS_POR_DIA = 6;

  /* num/den es la fracción exacta; el redondeo es el de REDONDEAR() del Excel (mitad hacia arriba) */
  var FRACCIONES = [
    { id: 'tercio', num: 1, den: 3, etiqueta: '1/3', beneficio: '72 horas' },
    { id: 'mitad', num: 1, den: 2, etiqueta: '1/2', beneficio: 'prisión domiciliaria' },
    { id: 'tres', num: 3, den: 5, etiqueta: '3/5', beneficio: 'libertad condicional' },
    { id: 'setenta', num: 7, den: 10, etiqueta: '70 %', beneficio: 'Ley 65, art. 147, num. 5' }
  ];

  var ACTIVIDADES = [
    { id: 'trabajo', campo: 'horasTrabajo', nombre: 'Trabajo' },
    { id: 'estudio', campo: 'horasEstudio', nombre: 'Estudio' },
    { id: 'ensenanza', campo: 'horasEnsenanza', nombre: 'Enseñanza' }
  ];

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /* 'AAAA-MM-DD' -> milisegundos UTC, o null si no es una fecha válida */
  function parseFecha(texto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto || ''));
    if (!m) return null;
    var a = +m[1], mes = +m[2], d = +m[3];
    var t = Date.UTC(a, mes - 1, d);
    var f = new Date(t);
    if (f.getUTCFullYear() !== a || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) return null;
    return t;
  }

  /* milisegundos UTC -> 'DD/MM/AAAA' */
  function formatoFecha(t) {
    var f = new Date(t);
    return pad2(f.getUTCDate()) + '/' + pad2(f.getUTCMonth() + 1) + '/' + f.getUTCFullYear();
  }

  /* Entero >= 0. Vacío cuenta como 0. Devuelve NaN si no es válido. */
  function entero(v) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    if (!isFinite(n) || n < 0 || Math.floor(n) !== n) return NaN;
    return n;
  }

  /* Número >= 0 (admite decimales). Vacío cuenta como 0. */
  function numero(v) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    if (!isFinite(n) || n < 0) return NaN;
    return n;
  }

  function aDuracion(dias) {
    var total = Math.max(0, Math.round(dias));
    var anios = Math.floor(total / DIAS_ANIO);
    var resto = total - anios * DIAS_ANIO;
    var meses = Math.floor(resto / DIAS_MES);
    return { anios: anios, meses: meses, dias: resto - meses * DIAS_MES };
  }

  function plural(n, uno, varios) {
    return n + ' ' + (n === 1 ? uno : varios);
  }

  function textoDuracion(dias) {
    var d = aDuracion(dias);
    var partes = [];
    if (d.anios) partes.push(plural(d.anios, 'año', 'años'));
    if (d.meses) partes.push(plural(d.meses, 'mes', 'meses'));
    if (d.dias || !partes.length) partes.push(plural(d.dias, 'día', 'días'));
    if (partes.length === 1) return partes[0];
    return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
  }

  /* datos: { penaAnios, penaMeses, penaDias, fechaInicio, fechaCorte, horasTrabajo, horasEstudio, horasEnsenanza }
     fechaInicio = fecha de captura; fechaCorte = fecha de reporte. Formato 'AAAA-MM-DD'. */
  function calcular(datos) {
    var errores = [];
    var d = datos || {};

    var pa = entero(d.penaAnios), pm = entero(d.penaMeses), pd = entero(d.penaDias);
    if (isNaN(pa) || isNaN(pm) || isNaN(pd)) {
      errores.push('La condena debe escribirse con números enteros, sin negativos.');
    }
    var penaDias = (pa || 0) * DIAS_ANIO + (pm || 0) * DIAS_MES + (pd || 0);
    if (!errores.length && penaDias <= 0) {
      errores.push('Escriba la condena (años, meses o días).');
    }

    var inicio = parseFecha(d.fechaInicio);
    var corte = parseFecha(d.fechaCorte);
    if (inicio === null) errores.push('Escriba una fecha de captura válida.');
    if (corte === null) errores.push('Escriba una fecha de reporte válida.');
    if (inicio !== null && corte !== null && inicio > corte) {
      errores.push('La fecha de captura no puede ser posterior a la fecha de reporte.');
    }

    var horas = {};
    ACTIVIDADES.forEach(function (a) {
      horas[a.id] = numero(d[a.campo]);
      if (isNaN(horas[a.id])) errores.push('Las horas de ' + a.nombre.toLowerCase() + ' deben ser un número, sin negativos.');
    });

    if (errores.length) return { ok: false, errores: errores };

    var fisico = Math.round((corte - inicio) / MS_DIA);

    var totalRedimido = 0;
    var actividades = ACTIVIDADES.map(function (a) {
      var diasEquivalentes = Math.floor(horas[a.id] / HORAS_POR_DIA);
      var redimidos = Math.floor(diasEquivalentes / 3) * 2;
      totalRedimido += redimidos;
      return { id: a.id, nombre: a.nombre, horas: horas[a.id], diasEquivalentes: diasEquivalentes, redimidos: redimidos };
    });

    var cumplido = fisico + totalRedimido;

    var fracciones = FRACCIONES.map(function (f) {
      /* REDONDEAR(penaDias x num / den, 0) con enteros: mitad hacia arriba */
      var umbral = Math.floor((2 * penaDias * f.num + f.den) / (2 * f.den));
      var aplica = cumplido >= umbral;
      var fecha = corte + (umbral - cumplido) * MS_DIA;
      return {
        id: f.id,
        etiqueta: f.etiqueta,
        beneficio: f.beneficio,
        umbral: umbral,
        aplica: aplica,
        faltan: Math.max(0, umbral - cumplido),
        avance: Math.min(100, (cumplido / umbral) * 100),
        fechaEstimada: fecha,
        fechaEstimadaTexto: formatoFecha(fecha)
      };
    });

    var finSin = inicio + penaDias * MS_DIA;
    var finCon = inicio + (penaDias - totalRedimido) * MS_DIA;

    return {
      ok: true,
      penaDias: penaDias,
      tiempoFisico: fisico,
      actividades: actividades,
      redencion: totalRedimido,
      cumplido: cumplido,
      porcentaje: Math.min(100, (cumplido / penaDias) * 100),
      penaCumplida: cumplido >= penaDias,
      faltaPena: Math.max(0, penaDias - cumplido),
      finSinRedencionTexto: formatoFecha(finSin),
      finConRedencionTexto: formatoFecha(finCon),
      fechaCorteTexto: formatoFecha(corte),
      fracciones: fracciones
    };
  }

  return {
    DIAS_MES: DIAS_MES,
    DIAS_ANIO: DIAS_ANIO,
    FRACCIONES: FRACCIONES,
    parseFecha: parseFecha,
    formatoFecha: formatoFecha,
    aDuracion: aDuracion,
    textoDuracion: textoDuracion,
    calcular: calcular
  };
});
