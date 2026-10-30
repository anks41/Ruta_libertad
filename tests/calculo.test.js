/* Pruebas de js/calculo.js
   Ejecutar con:  node tests/calculo.test.js
   Los valores esperados salen del Excel "Cómputo de tiempos, beneficios y subrogados" (v2026),
   recalculado con LibreOffice para cada caso, para no depender de la propia función. */

'use strict';
var assert = require('assert');
var C = require('../js/calculo.js');

var pasadas = 0;
function prueba(nombre, fn) {
  fn();
  pasadas++;
  console.log('ok  - ' + nombre);
}

var CASOS = {
  A: { datos: { penaAnios: 6, penaMeses: 0, penaDias: 0, fechaInicio: '2025-06-01', fechaCorte: '2026-10-26', horasTrabajo: 540, horasEstudio: 180, horasEnsenanza: 0 },
    excel: { pena: 2160, fisico: 512, red: 80, cum: 592, um: [720, 1080, 1296, 1512], ap: ["NO", "NO", "NO", "NO"], fe: ["03/03/2027", "26/02/2028", "29/09/2028", "03/05/2029"], cumplida: 'NO', sin: '01/05/2031', con: '10/02/2031' } },
  B: { datos: { penaAnios: 10, penaMeses: 0, penaDias: 0, fechaInicio: '2022-03-10', fechaCorte: '2026-10-26', horasTrabajo: 1800, horasEstudio: 900, horasEnsenanza: 300 },
    excel: { pena: 3600, fisico: 1691, red: 332, cum: 2023, um: [1200, 1800, 2160, 2520], ap: ["S\u00cd", "S\u00cd", "NO", "NO"], fe: ["25/07/2024", "17/03/2026", "12/03/2027", "06/03/2028"], cumplida: 'NO', sin: '17/01/2032', con: '19/02/2031' } },
  C: { datos: { penaAnios: 5, penaMeses: 0, penaDias: 0, fechaInicio: '2022-10-01', fechaCorte: '2026-10-26', horasTrabajo: 1500, horasEstudio: 600, horasEnsenanza: 300 },
    excel: { pena: 1800, fisico: 1486, red: 264, cum: 1750, um: [600, 900, 1080, 1260], ap: ["S\u00cd", "S\u00cd", "S\u00cd", "S\u00cd"], fe: ["02/09/2023", "28/06/2024", "25/12/2024", "23/06/2025"], cumplida: 'NO', sin: '05/09/2027', con: '15/12/2026' } },
  D: { datos: { penaAnios: 2, penaMeses: 7, penaDias: 13, fechaInicio: '2024-02-29', fechaCorte: '2026-10-26', horasTrabajo: 1001, horasEstudio: 455, horasEnsenanza: 17 },
    excel: { pena: 943, fisico: 970, red: 160, cum: 1130, um: [314, 472, 566, 660], ap: ["S\u00cd", "S\u00cd", "S\u00cd", "S\u00cd"], fe: ["01/08/2024", "06/01/2025", "10/04/2025", "13/07/2025"], cumplida: 'SÍ', sin: '29/09/2026', con: '22/04/2026' } },
};

Object.keys(CASOS).forEach(function (k) {
  prueba('Caso ' + k + ': coincide con el Excel en todos los resultados', function () {
    var r = C.calcular(CASOS[k].datos);
    var x = CASOS[k].excel;
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.penaDias, x.pena);
    assert.strictEqual(r.tiempoFisico, x.fisico);
    assert.strictEqual(r.redencion, x.red);
    assert.strictEqual(r.cumplido, x.cum);
    assert.deepStrictEqual(r.fracciones.map(function (f) { return f.umbral; }), x.um);
    assert.deepStrictEqual(r.fracciones.map(function (f) { return f.aplica ? 'SÍ' : 'NO'; }), x.ap);
    assert.deepStrictEqual(r.fracciones.map(function (f) { return f.fechaEstimadaTexto; }), x.fe);
    assert.strictEqual(r.penaCumplida ? 'SÍ' : 'NO', x.cumplida);
    assert.strictEqual(r.finSinRedencionTexto, x.sin);
    assert.strictEqual(r.finConRedencionTexto, x.con);
  });
});

prueba('El tiempo físico no cuenta el día de captura (reporte menos captura)', function () {
  var r = C.calcular({ penaDias: 30, fechaInicio: '2026-01-01', fechaCorte: '2026-01-01' });
  assert.strictEqual(r.tiempoFisico, 0);
  r = C.calcular({ penaDias: 30, fechaInicio: '2026-01-01', fechaCorte: '2026-01-11' });
  assert.strictEqual(r.tiempoFisico, 10);
});

prueba('Redención 2x3: 6 horas = 1 día; por cada 3 días se redimen 2; sin mezclar actividades', function () {
  var r = C.calcular({ penaAnios: 1, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01', horasTrabajo: 17, horasEstudio: 17, horasEnsenanza: 18 });
  /* 17 h -> 2 días -> 0 redimidos (en trabajo y estudio); 18 h -> 3 días -> 2 redimidos */
  assert.strictEqual(r.redencion, 2);
  assert.strictEqual(r.actividades[2].redimidos, 2);
  r = C.calcular({ penaAnios: 1, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01', horasTrabajo: 18, horasEstudio: 18, horasEnsenanza: 18 });
  assert.strictEqual(r.redencion, 6);
});

prueba('La condena puede escribirse en años, meses y días', function () {
  var r = C.calcular({ penaAnios: 2, penaMeses: 6, penaDias: 15, fechaInicio: '2026-01-01', fechaCorte: '2026-01-01' });
  assert.strictEqual(r.penaDias, 2 * 360 + 6 * 30 + 15);
});

prueba('El umbral se redondea al más cercano, la mitad hacia arriba (943 x 1/2 = 472; 100 x 1/3 = 33)', function () {
  var r = C.calcular({ penaDias: 943, fechaInicio: '2026-01-01', fechaCorte: '2026-01-01' });
  assert.strictEqual(r.fracciones[1].umbral, 472);
  r = C.calcular({ penaDias: 100, fechaInicio: '2026-01-01', fechaCorte: '2026-01-01' });
  assert.deepStrictEqual(r.fracciones.map(function (f) { return f.umbral; }), [33, 50, 60, 70]);
});

prueba('Alcanzar el umbral exacto cuenta como que aplica', function () {
  var r = C.calcular({ penaDias: 30, fechaInicio: '2026-01-01', fechaCorte: '2026-01-11' });
  assert.strictEqual(r.fracciones[0].umbral, 10);
  assert.strictEqual(r.fracciones[0].aplica, true);
  assert.strictEqual(r.fracciones[0].faltan, 0);
});

prueba('Validaciones: sin condena, fechas al revés, fecha inválida, negativos y horas inválidas', function () {
  assert.strictEqual(C.calcular({ fechaInicio: '2026-01-01', fechaCorte: '2026-02-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1, fechaInicio: '2026-03-01', fechaCorte: '2026-02-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1, fechaInicio: '2026-02-30', fechaCorte: '2026-03-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: -1, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01', horasTrabajo: -5 }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1.5, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01' }).ok, false);
});

prueba('Textos de duración', function () {
  assert.strictEqual(C.textoDuracion(0), '0 días');
  assert.strictEqual(C.textoDuracion(1), '1 día');
  assert.strictEqual(C.textoDuracion(177), '5 meses y 27 días');
  assert.strictEqual(C.textoDuracion(360), '1 año');
  assert.strictEqual(C.textoDuracion(2160 + 33), '6 años, 1 mes y 3 días');
});

console.log('\n' + pasadas + ' pruebas pasaron.');
