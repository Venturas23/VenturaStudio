const arquivosM3U = [
    'js/Lista/M3U/Series Amazon Prime Video.m3u',
    'js/Lista/M3U/Series AMC Plus.m3u',
    'js/Lista/M3U/Series Apple TV Plus.m3u',
    'js/Lista/M3U/Series Brasil Paralelo.m3u',
    'js/Lista/M3U/Series Claro Video.m3u',
    'js/Lista/M3U/Series Crunchyroll.m3u',
    'js/Lista/M3U/Series Geral.m3u',
    'js/Lista/M3U/Series Legendadas.m3u',
    'js/Lista/M3U/Series Lionsgate.m3u',
    'js/Lista/M3U/Series Max.m3u',
    'js/Lista/M3U/Series Netflix.m3u',
    'js/Lista/M3U/Series Outras Produtoras.m3u',
    'js/Lista/M3U/Series Paramount.m3u',
    'js/Lista/M3U/Series Play Plus.m3u',
    'js/Lista/M3U/Series SBT.m3u',
    'js/Lista/M3U/Series Star Plus.m3u',
    'js/Lista/M3U/Series Univer.m3u'
    // Adicione mais arquivos aqui
  ];
  
  function removerExtensao(nomeArquivo) {
    return nomeArquivo.endsWith('.m3u') ? nomeArquivo.substring(0, nomeArquivo.length - 4) : nomeArquivo;
}

function listarArquivos() {
    const filtroArquivo = document.getElementById("filtroArquivo");
    arquivosM3U.forEach(arquivo => {
        const option = document.createElement("option");
        option.value = arquivo;
        option.textContent = removerExtensao(arquivo.split('/').pop());
        filtroArquivo.appendChild(option);
    });
}

async function carregarArquivoM3U() {
    const arquivoSelecionado = document.getElementById("filtroArquivo").value;
    if (!arquivoSelecionado) return;
    
    try {
        const response = await fetch(arquivoSelecionado);
        const m3uText = await response.text();
        exibirSeries(m3uText);
    } catch (error) {
        console.error("Erro ao carregar o arquivo M3U:", error);
        document.getElementById("serieList").textContent = "Erro ao carregar séries.";
    }
}

function exibirSeries(m3uText) {
    const linhas = m3uText.split("\n");
    const seriesAgrupadas = {}; // Objeto para agrupar séries por nome

    linhas.forEach(linha => {
        linha = linha.trim();
        
        if (linha.startsWith("#EXTINF")) {
            const [info, nome] = linha.split(",");
            const [serieNome, temporadaEp] = nome.match(/(.*) (S\d+E\d+)/).slice(1);
            
            const capa = info.includes("tvg-logo=") ? info.split("tvg-logo=")[1].split('"')[1] : '';
            
            if (!seriesAgrupadas[serieNome]) {
                seriesAgrupadas[serieNome] = { capa, episodios: [] };
            }
            
            seriesAgrupadas[serieNome].episodios.push({ nome: temporadaEp, link: '' });
        } else if (linha && !linha.startsWith("#")) {
            const serieNomeAtual = Object.keys(seriesAgrupadas).slice(-1)[0];
            seriesAgrupadas[serieNomeAtual].episodios.slice(-1)[0].link = linha;
        }
    });

    exibirSeriesNaPagina(seriesAgrupadas);
}

function exibirSeriesNaPagina(seriesAgrupadas) {
    const serieList = document.getElementById("serieList");
    serieList.innerHTML = '';

    for (const [serieNome, { capa, episodios }] of Object.entries(seriesAgrupadas)) {
        const serieDiv = document.createElement("div");
        serieDiv.classList.add("serie");

        const tituloSerie = document.createElement("h3");
        tituloSerie.textContent = serieNome;
        serieDiv.appendChild(tituloSerie);

        if (capa) {
            const imgCapa = document.createElement("img");
            imgCapa.src = capa;
            imgCapa.alt = `Capa de ${serieNome}`;
            imgCapa.classList.add("capa");
            serieDiv.appendChild(imgCapa);
        }

        episodios.forEach(({ nome, link }) => {
            const episodioLink = document.createElement("a");
            episodioLink.href = link;
            episodioLink.textContent = nome;
            episodioLink.classList.add("episodio");
            episodioLink.addEventListener("click", (e) => {
                e.preventDefault();
                reproduzirVideo(link);
            });
            serieDiv.appendChild(episodioLink);
        });

        serieList.appendChild(serieDiv);
    }
}

function reproduzirVideo(url) {
    const player = videojs('videoPlayer');
    player.src({ type: 'application/x-mpegurl', src: url });
    player.ready(() => {
        player.play();
    });
}

// Inicializar ao carregar a página
listarArquivos();