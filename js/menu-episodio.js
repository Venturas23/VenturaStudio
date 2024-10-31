var Capa = document.querySelector('.Capa-Geral');
var opcao = document.querySelectorAll('.episodio');
var Quadrado = document.querySelectorAll('.Episodio-All')


Capa.addEventListener('click', function(){
    opcao.forEach((item)=>
        item.classList.toggle('expandir')
    );
});
Capa.addEventListener('click', function(){
    Quadrado.forEach((item)=>
        item.classList.toggle('expandir')
    );
});
