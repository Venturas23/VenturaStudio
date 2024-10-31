const arquivosM3U = [
    'js/Lista/M3U/Series Amazon Prime Video.m3u',
    'js/Lista/M3U/Series AMC Plus.m3u',
    'js/Lista/M3U/Series Apple TV Plus.m3u',
    'js/Lista/M3U/Series Brasil Paralelo.m3u',
    'js/Lista/M3U/Series Claro Video.m3u',
    'js/Lista/M3U/Series Crunchyroll.m3u',
    'js/Lista/M3U/Series Funimation Now.m3u',
    'js/Lista/M3U/Series Globoplay.m3u',
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
];

function removerExtensao(nomeArquivo) {
    return nomeArquivo.endsWith('.m3u') ? nomeArquivo.substring(0, nomeArquivo.length - 4) : nomeArquivo;
}

function listarArquivos() {
    const filtroArquivo = document.getElementById("filtroArquivo");
    
    if (!filtroArquivo) {
        console.error("Elemento select com ID 'filtroArquivo' não encontrado no HTML.");
        return;
    }

    arquivosM3U.forEach(arquivo => {
        const option = document.createElement("option");
        option.value = arquivo;
        option.textContent = removerExtensao(arquivo.split('/').pop());
        filtroArquivo.appendChild(option);
    });
}

// Função para limpar o conteúdo da lista de séries
function limparSeries() {
    const serieList = document.getElementById("serieList");
    serieList.innerHTML = ''; // Limpa o conteúdo da lista
}

async function carregarArquivoM3U() {
    const arquivoSelecionado = document.getElementById("filtroArquivo").value;
    if (!arquivoSelecionado) return;

    limparSeries();  // Limpa a categoria anterior antes de carregar a nova

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
    const seriesAgrupadas = {};

    linhas.forEach(linha => {
        linha = linha.trim();
        
        if (linha.startsWith("#EXTINF")) {
            const [info, nome] = linha.split(",");
            const resultado = nome ? nome.match(/(.*) (S\d+E\d+)/) : null;

            if (resultado) {
                const [_, serieNome, temporadaEp] = resultado;
                const capa = info.includes("tvg-logo=") ? info.split("tvg-logo=")[1].split('"')[1] : '';

                if (!seriesAgrupadas[serieNome]) {
                    seriesAgrupadas[serieNome] = { capa, episodios: [] };
                }

                seriesAgrupadas[serieNome].episodios.push({ nome: temporadaEp, link: '' });
            }
        } else if (linha && !linha.startsWith("#")) {
            const serieNomeAtual = Object.keys(seriesAgrupadas).slice(-1)[0];
            if (serieNomeAtual) {
                seriesAgrupadas[serieNomeAtual].episodios.slice(-1)[0].link = linha;
            }
        }
    });

    exibirSeriesNaPagina(seriesAgrupadas);
}

function exibirSeriesNaPagina(seriesAgrupadas) {
    const serieList = document.getElementById("serieList");
    serieList.innerHTML = '';

    for (const [serieNome, { capa, episodios }] of Object.entries(seriesAgrupadas)) {
        const serieDiv = document.createElement("div");
        const episodioDiv = document.createElement("div");
        serieDiv.classList.add("Item-Geral");
        episodioDiv.classList.add("Episodio-All");

        const tituloSerie = document.createElement("h3");
        tituloSerie.classList.add('Titulo-Geral');
        tituloSerie.textContent = serieNome;
        serieDiv.appendChild(tituloSerie);

        // Link para a capa que leva ao último episódio assistido
        const linkElement = document.createElement("a");
        linkElement.href = "#";
        linkElement.classList.add("Link-Retorn")
        linkElement.addEventListener("click", (e) => {
            e.preventDefault();
            const ultimoEpisodio = localStorage.getItem(`ultimoEpisodio-${serieNome}`);
            if (ultimoEpisodio) {
                reproduzirVideo(serieNome, episodios, ultimoEpisodio);
            } else {
                reproduzirVideo(serieNome, episodios, episodios[0].link);
            }
        });

        if (capa) {
            const imgCapa = document.createElement("img");
            imgCapa.src = capa;
            imgCapa.alt = `Capa de ${serieNome}`;
            imgCapa.classList.add("Capa-Geral");
            linkElement.appendChild(imgCapa);
            serieDiv.appendChild(linkElement);
        }

        episodios.forEach(({ nome, link }) => {
            const episodioLink = document.createElement("a");
            episodioLink.href = link;
            episodioLink.textContent = nome;
            episodioLink.classList.add("episodio");
            episodioLink.addEventListener("click", (e) => {
                e.preventDefault();
                salvarUltimoEpisodio(serieNome, link);
                reproduzirVideo(serieNome, episodios, link);
            });
            episodioDiv.appendChild(episodioLink);
            serieDiv.appendChild(episodioDiv);
        });
        
        serieList.appendChild(serieDiv);
    }
}
function salvarUltimoEpisodio(serieNome, link) {
    localStorage.setItem(`ultimoEpisodio-${serieNome}`, link);
}

function reproduzirVideo(serieNome, episodios, linkAtual) {
    const videoPlayer = document.getElementById("videoPlayer");
    
    // Verifica se o elemento videoPlayer existe e é um elemento de vídeo válido
    if (!videoPlayer || typeof videoPlayer.play !== "function") {
        console.error("Elemento videoPlayer não encontrado ou não é um elemento de vídeo.");
        return;
    }

    // Define a URL do vídeo
    videoPlayer.src = linkAtual;
    videoPlayer.play();

    // Salva o último episódio ao iniciar a reprodução
    salvarUltimoEpisodio(serieNome, linkAtual);

    // Entra em tela cheia automaticamente ao iniciar o episódio
    videoPlayer.requestFullscreen()
        .catch(err => console.log("Erro ao entrar em tela cheia:", err));

    // Avança para o próximo episódio automaticamente ao finalizar
    videoPlayer.onended = () => {
        const indiceAtual = episodios.findIndex(ep => ep.link === linkAtual);
        const proximoEpisodio = episodios[indiceAtual + 1];

        if (proximoEpisodio) {
            reproduzirVideo(serieNome, episodios, proximoEpisodio.link);
        } else {
            console.log("Fim da série!");
            alert("Você concluiu todos os episódios disponíveis para essa série.");
        }
    };
}
// Inicializar a lista de arquivos ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    listarArquivos();

    // Adicionar evento para limpar a categoria ao selecionar outra
    const filtroArquivo = document.getElementById("filtroArquivo");
    filtroArquivo.addEventListener("change", carregarArquivoM3U);
});
