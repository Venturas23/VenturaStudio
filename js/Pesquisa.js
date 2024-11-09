var btnPesq = document.querySelector('.icon-Search');
var BarPes = document.querySelector('#barraDeBusca');

btnPesq.addEventListener('click', function(){
    BarPes.classList.toggle('expandir');
    btnPesq.classList.toggle('expandir');
});