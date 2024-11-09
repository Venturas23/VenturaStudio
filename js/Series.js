const arquivosM3U = [
    'js/Lista/M3U/SERIES/Séries Animação(Desenho).m3u',
    'js/Lista/M3U/SERIES/Séries Animações (Clássicos).m3u',
    'js/Lista/M3U/SERIES/Séries Anime (Dublado).m3u',
    'js/Lista/M3U/SERIES/Séries Anime (Legendado).m3u',
    'js/Lista/M3U/SERIES/Séries Apple TV.m3u',
    'js/Lista/M3U/SERIES/Séries Classicos.m3u',
    'js/Lista/M3U/SERIES/Séries Discovery.m3u',
    'js/Lista/M3U/SERIES/Séries Disney.m3u',
    'js/Lista/M3U/SERIES/Séries Dorama.m3u',
    'js/Lista/M3U/SERIES/Séries Geral.m3u',
    'js/Lista/M3U/SERIES/Séries GloboPlay.m3u',
    'js/Lista/M3U/SERIES/Séries HBO.m3u',
    'js/Lista/M3U/SERIES/Séries Netflix.m3u',
    'js/Lista/M3U/SERIES/Séries Novelas Turcas.m3u',
    'js/Lista/M3U/SERIES/Séries Novelas.m3u',
    'js/Lista/M3U/SERIES/Séries Prime Video.m3u',
    'js/Lista/M3U/SERIES/Séries Series TV.m3u',
    'js/Lista/M3U/SERIES/Séries Starz e Paramount+.m3u',
    'js/Lista/M3U/SERIES/Séries Tokusatsu.m3u'
];

let seriesAgrupadas = {}; // Guardará as séries agrupadas para a pesquisa

// Função para remover a extensão de um arquivo
function removerExtensao(nomeArquivo) {
    return nomeArquivo.endsWith('.m3u') ? nomeArquivo.substring(0, nomeArquivo.length - 4) : nomeArquivo;
}

// Função para listar arquivos M3U no seletor
function listarArquivos() {
    const filtroArquivo = document.getElementById("filtroArquivo");
    const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();

    // Limpa o seletor antes de adicionar as opções
    filtroArquivo.innerHTML = '';

    // Adiciona a opção inicial
    const option_null = document.createElement("option");
    option_null.value = "";
    option_null.textContent = 'Selecione a Categoria';
    filtroArquivo.appendChild(option_null);

    // Filtra os arquivos e adiciona as opções
    arquivosM3U
        .filter(arquivo => removerExtensao(arquivo.split('/').pop()).toLowerCase().includes(termoBusca))
        .forEach(arquivo => {
            const option = document.createElement("option");
            option.value = arquivo;
            option.textContent = removerExtensao(arquivo.split('/').pop());
            filtroArquivo.appendChild(option);
        });
}

// Função para carregar o arquivo M3U selecionado
async function carregarArquivoM3U() {
    const arquivoSelecionado = document.getElementById("filtroArquivo").value;
    if (!arquivoSelecionado) return;

    try {
        const response = await fetch(arquivoSelecionado);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const m3uText = await response.text();
        exibirSeries(m3uText);
    } catch (error) {
        console.error("Erro ao carregar o arquivo M3U:", error.message);
        document.getElementById("serieList").textContent = "Erro ao carregar séries.";
    }
}

// Função para exibir as séries do arquivo M3U na página
function exibirSeries(m3uText) {
    const linhas = m3uText.split("\n");
    seriesAgrupadas = {}; // Limpa as séries agrupadas

    let serieNomeAtual = '';
    linhas.forEach(linha => {
        linha = linha.trim();

        if (linha.startsWith("#EXTINF")) {
            const [info, nome] = linha.split(",");
            const match = nome.match(/(.*) (S\d+E\d+)/);

            if (match) {
                const [serieNome, temporadaEp] = match.slice(1);
                const capa = info.includes("tvg-logo=") ? info.split("tvg-logo=")[1].split('"')[1] : '';

                if (!seriesAgrupadas[serieNome]) {
                    seriesAgrupadas[serieNome] = { capa, episodios: [] };
                }

                seriesAgrupadas[serieNome].episodios.push({ nome: temporadaEp, link: '' });
                serieNomeAtual = serieNome;
            } else {
                console.warn("Linha #EXTINF não tem o formato esperado:", linha);
            }
        } else if (linha && !linha.startsWith("#")) {
            if (serieNomeAtual && seriesAgrupadas[serieNomeAtual]) {
                seriesAgrupadas[serieNomeAtual].episodios.slice(-1)[0].link = linha;
            } else {
                console.warn("Tentativa de adicionar link sem série correspondente:", linha);
            }
        }
    });

    exibirSeriesNaPagina(seriesAgrupadas);
}

// Função para exibir as séries na página com base na pesquisa
function exibirSeriesNaPagina(seriesAgrupadas) {
    const serieList = document.getElementById("serieList");
    serieList.innerHTML = '';

    const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();

    for (const [serieNome, { capa, episodios }] of Object.entries(seriesAgrupadas)) {
        // Se a pesquisa corresponder ao nome da série ou episódio
        if (serieNome.toLowerCase().includes(termoBusca)) {
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

                imgCapa.addEventListener("click", () => {
                    window.location.href = `episodios.html?serie=${encodeURIComponent(serieNome)}`;
                });

                serieDiv.appendChild(imgCapa);
            }

            serieList.appendChild(serieDiv);
        } else {
            // Filtra episódios
            episodios.forEach(episodio => {
                if (episodio.nome.toLowerCase().includes(termoBusca)) {
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

                        imgCapa.addEventListener("click", () => {
                            window.location.href = `episodios.html?serie=${encodeURIComponent(serieNome)}`;
                        });

                        serieDiv.appendChild(imgCapa);
                    }

                    serieList.appendChild(serieDiv);
                }
            });
        }
    }
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    listarArquivos();
    document.getElementById("barraDeBusca").addEventListener("input", () => {
        exibirSeriesNaPagina(seriesAgrupadas);
    });
});
