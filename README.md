# Mi ruta hacia la libertad: sitio web

Página informativa sobre el tratamiento penitenciario, la redención de pena y los beneficios por fracción de la condena (1/3, 3/5 y 4/5) en Colombia, con una calculadora orientativa de tiempo cumplido. Proyecto académico del Consultorio Jurídico, Universidad Católica de Colombia.

No necesita instalación ni compilación: es HTML, CSS y JavaScript puro.

## Estructura

```
index.html              Contenido y estructura
css/styles.css          Estilos, paleta (claro y oscuro) y versión móvil
js/main.js              Menú móvil, carga de imágenes y GIFs, fases y lista de revisión
js/calculo.js           Lógica de la calculadora (sin interfaz)
js/calculadora-ui.js    Formulario y resultados de la calculadora
tests/calculo.test.js   Pruebas de la fórmula
img/                    Aquí van las imágenes y GIFs
INFOGRAFIA/             (ya existe en el repositorio) infografía A4
```

## Cómo ver la página

Abra `index.html` en el navegador, o desde la terminal del Codespace: `python3 -m http.server 8000` y abra el puerto 8000.

## Imágenes y GIFs

**Ya incluidos** (GIFs animados originales, hechos para este proyecto, sin derechos de terceros): `hero.gif`, `fases-ruta.gif`, `redencion-ejemplo.gif`, `autoridades-esquema.gif`, `fraccion-1-3.gif`, `fraccion-3-5.gif` y `fraccion-4-5.gif`. Si quiere cambiar alguno, guarde el suyo con el mismo nombre.

**Ilustraciones originales incluidas** (WebP, sin derechos de terceros; puede reemplazarlas por fotos con el mismo nombre): `ruta-fases`, `ruta-redencion`, `ruta-fracciones`, `ruta-normativa`, `redencion-trabajo`, `redencion-estudio`, `redencion-ensenanza` y `orientacion`.

Todos los espacios de imagen están cubiertos.

La página trae cajas punteadas que indican el nombre del archivo y el tamaño. Guarde cada archivo en la carpeta `img/` con ese nombre exacto y la caja se reemplaza sola. Para cambiar un nombre o formato, busque `SLOT:` en `index.html` y edite el `src`.

| Archivo | Tamaño | Dónde aparece |
|---|---|---|
| `hero.gif` | 1280×720 | Fondo del inicio |
| `ruta-fases.webp`, `ruta-redencion.webp`, `ruta-fracciones.webp`, `ruta-normativa.webp` | 800×600 | Tarjetas de la ruta |
| `fases-ruta.gif` | 1200×675 | Ruta de las 5 fases |
| `redencion-trabajo.webp`, `redencion-estudio.webp`, `redencion-ensenanza.webp` | 800×600 | Modalidades de redención |
| `redencion-ejemplo.gif` | 1000×750 | Tiempo cumplido vs. redimido |
| `fraccion-1-3.gif`, `fraccion-3-5.gif`, `fraccion-4-5.gif` | 1280×720 | Fracciones |
| `autoridades-esquema.gif` | 1600×600 | Esquema del procedimiento |
| `infografia.webp` | 1200×1600 | Vista previa de la infografía |
| `orientacion.webp` | 800×600 | Sección de orientación |

## Dónde editar

- Textos: `index.html`. Las fracciones están escritas directamente en la sección `#fracciones`.
- Colores: variables al inicio de `css/styles.css` (`--c1`, `--c2`, `--c3` son los colores de 1/3, 3/5 y 4/5).

## Calculadora orientativa

Reproduce las fórmulas del Excel «Cómputo de tiempos, beneficios y subrogados» (v2026). Recibe la condena (años, meses, días), la fecha de captura, la fecha de reporte y las horas de trabajo, estudio y enseñanza. Calcula el tiempo físico, la redención 2×3, el tiempo cumplido, los días requeridos y la fecha estimada de 1/3 (72 horas), 1/2 (domiciliaria), 3/5 (libertad condicional) y 70 % (Ley 65, art. 147, num. 5), y el fin de la pena con y sin redención. Las pruebas se ejecutan con `node tests/calculo.test.js` y comparan contra el Excel recalculado.

Fórmulas (iguales al Excel):
- Condena en días = años × 360 + meses × 30 + días.
- Tiempo físico = fecha de reporte − fecha de captura (no cuenta el día de captura).
- Redención por actividad: días equivalentes = parte entera de horas ÷ 6; días redimidos = parte entera de (días equivalentes ÷ 3) × 2.
- Tiempo cumplido = tiempo físico + total redimido.
- Días requeridos = condena × fracción, redondeado al día más cercano.
- Fecha estimada = fecha de reporte + (requeridos − cumplido).

La herramienta solo mide el requisito de tiempo y no reemplaza el cómputo del juez ni la asesoría jurídica. La fracción 4/5 sigue explicada en la sección de fracciones, pero no está en la calculadora porque el Excel no la usa.

## Pendientes de verificación jurídica

- Las etiquetas amarillas "Por confirmar" de la página.
- La Ley 2466 de 2025 y el fallo STP5152-2026 citados por el Excel (redención 2×3 para trabajo, estudio y enseñanza).
- Las fases del artículo 144 de la Ley 65 de 1993 y la vigencia de los artículos 147, 147A y 148.
- La jurisprudencia (por ejemplo, la sentencia C-757 de 2014).
- Los datos de contacto del Consultorio Jurídico.

## Publicar con GitHub Pages

Settings, Pages, rama `main`, carpeta `/ (root)`. El repositorio debe ser público en una cuenta gratuita.

Contenido informativo. No constituye asesoría jurídica ni garantiza la concesión de ningún beneficio.

## GIFs de Giphy (opcional)

Si quiere sumar GIFs de Giphy, busque estos términos y use **Compartir, Copiar enlace del GIF**. Muchos son recortes de películas o series con derechos de autor: prefiera GIFs genéricos o abstractos, cite la fuente y recuerde que dependen de que Giphy los mantenga en línea. Lo más seguro es descargarlos y guardarlos en `img/`.

| Espacio | Qué buscar en Giphy |
|---|---|
| Inicio (`hero`) | libertad, camino, amanecer, puerta abierta |
| Redención: trabajo | trabajo en equipo, taller, manos trabajando |
| Redención: estudio | estudiar, libros, aprender, escribir |
| Redención: enseñanza | profesor, enseñar, pizarra, clase |
| Autoridades | justicia, balanza, martillo de juez, documentos |
| Orientación | ayuda, asesoría, conversación, apoyo |
| Normas | ley, libro de leyes, sello, firmar documento |
