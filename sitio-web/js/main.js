/* Mi ruta hacia la libertad: menú móvil, imágenes y GIFs, pestañas de fases y lista de revisión. */
/* Menú móvil */
(function(){
  var b=document.getElementById('burger'),n=document.getElementById('nav');
  b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');b.setAttribute('aria-expanded','false')}});
})();

/* Imágenes y GIFs: si el archivo existe, reemplaza la caja punteada */
document.querySelectorAll('.media img').forEach(function(img){
  var fig=img.parentNode;
  function ok(){fig.classList.add('ok')}
  function fail(){img.remove()}
  img.addEventListener('load',ok);
  img.addEventListener('error',fail);
  if(img.complete){img.naturalWidth>0?ok():fail()}
});

/* Fases: pestañas */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.steps [role=tab]'));
  function show(i){
    tabs.forEach(function(t,k){
      var sel=k===i;
      t.setAttribute('aria-selected',sel);t.tabIndex=sel?0:-1;
      document.getElementById(t.getAttribute('aria-controls')).hidden=!sel;
    });
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(i)});
    t.addEventListener('keydown',function(e){
      var k=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;
      if(k){e.preventDefault();var n=(i+k+tabs.length)%tabs.length;show(n);tabs[n].focus()}
    });
  });
})();

/* Lista de revisión */
(function(){
  var boxes=[].slice.call(document.querySelectorAll('#checklist input'));
  var c=document.getElementById('count'),f=document.getElementById('barfill');
  function upd(){var n=boxes.filter(function(b){return b.checked}).length;c.textContent=n;f.style.width=(n/boxes.length*100)+'%'}
  boxes.forEach(function(b){b.addEventListener('change',upd)});
  document.getElementById('reset').addEventListener('click',function(){boxes.forEach(function(b){b.checked=false});upd()});
})();
