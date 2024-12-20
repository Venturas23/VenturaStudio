const arquivosM3U = [
    'js/Lista/M3U/SERIES/Séries Animes.m3u',
    'js/Lista/M3U/SERIES/Séries Apple TV.m3u',
    'js/Lista/M3U/SERIES/Séries Brasil Paralelo.m3u',
    'js/Lista/M3U/SERIES/Séries Cursos e Aulas.m3u',
    'js/Lista/M3U/SERIES/Séries Desenhos.m3u',
    'js/Lista/M3U/SERIES/Séries Discovery +.m3u',
    'js/Lista/M3U/SERIES/Séries Disney+.m3u',
    'js/Lista/M3U/SERIES/Séries Diversas.m3u',
    'js/Lista/M3U/SERIES/Séries Documentarios.m3u',
    'js/Lista/M3U/SERIES/Séries Dorama.m3u',
    'js/Lista/M3U/SERIES/Séries Geral.m3u',
    'js/Lista/M3U/SERIES/Séries GloboPlay.m3u',
    'js/Lista/M3U/SERIES/Séries HBO Max.m3u',
    'js/Lista/M3U/SERIES/Séries Legendadas.m3u',
    'js/Lista/M3U/SERIES/Séries National Geographic.m3u',
    'js/Lista/M3U/SERIES/Séries Netflix.m3u',
    'js/Lista/M3U/SERIES/Séries Novelas.m3u',
    'js/Lista/M3U/SERIES/Séries Paramount.m3u',
    'js/Lista/M3U/SERIES/Séries Prime Video.m3u',
    'js/Lista/M3U/SERIES/Séries Programas De TV.m3u',
    'js/Lista/M3U/SERIES/Séries Reality Show.m3u',
    'js/Lista/M3U/SERIES/Séries Star +.m3u',
    'js/Lista/M3U/SERIES/Séries Treine em Casa - Aulas.m3u'
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

    filtroArquivo.innerHTML = ''; // Limpa as opções anteriores

    const option_null = document.createElement("option");
    option_null.value = "";
    option_null.textContent = 'Selecione a Categoria';
    filtroArquivo.appendChild(option_null);

    arquivosM3U
        .filter(arquivo => removerExtensao(arquivo.split('/').pop()).toLowerCase().includes(termoBusca))
        .forEach(arquivo => {
            const option = document.createElement("option");
            option.value = arquivo;
            option.textContent = removerExtensao(arquivo.split('/').pop());
            filtroArquivo.appendChild(option);
        });

    // Reinicia para a primeira página ao aplicar novo filtro
    paginaAtual = 1;
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
// Atualizando o padrão de agrupamento
function exibirSeries(m3uText) {
    const linhas = m3uText.split("\n");
    seriesAgrupadas = {}; // Reinicia o objeto para agrupar as séries
    let serieNomeAtual = '';
    
    linhas.forEach((linha) => {
        linha = linha.trim();
        
        // Detecta linhas #EXTINF com tvg-name
        if (linha.startsWith("#EXTINF")) {
            const tvgNameMatch = linha.match(/tvg-name="([^"]+)"/);
            const tvgLogoMatch = linha.match(/tvg-logo="([^"]+)"/);
            const groupTitleMatch = linha.match(/group-title="([^"]+)"/);

            const nomeCompleto = tvgNameMatch ? tvgNameMatch[1] : 'Nome Desconhecido';
            const capa = tvgLogoMatch ? tvgLogoMatch[1] : '';
            const categoria = groupTitleMatch ? groupTitleMatch[1] : 'Outros';

            // Padrão ajustado para "Nome da Série (Ano) S1 E1"
            const match = nomeCompleto.match(/^(.*) \((\d{4})\) (S\d+ E\d+)/);
            if (match) {
                const [_, serieNome, ano, episodio] = match;

                // Inicializa série se ainda não existir
                if (!seriesAgrupadas[serieNome]) {
                    seriesAgrupadas[serieNome] = { capa, categoria, ano, episodios: [] };
                }

                // Adiciona episódio à série correspondente
                seriesAgrupadas[serieNome].episodios.push({ nome: episodio, link: '' });
                serieNomeAtual = serieNome;
            } else {
                console.warn("Formato inesperado no nome do episódio:", nomeCompleto);
            }
        } 
        // A linha seguinte ao #EXTINF é o link
        else if (linha && !linha.startsWith("#")) {
            if (serieNomeAtual && seriesAgrupadas[serieNomeAtual]) {
                const ultimoEpisodio = seriesAgrupadas[serieNomeAtual].episodios.slice(-1)[0];
                ultimoEpisodio.link = linha;
            } else {
                console.warn("Link encontrado sem série correspondente:", linha);
            }
        }
    });

    exibirSeriesNaPagina(seriesAgrupadas);
}
let itensPorPagina = 45; // Número de séries por página
let paginaAtual = 1;    // Página inicial
// Exibição agrupada por série
function exibirSeriesNaPagina(seriesAgrupadas) {
    const serieList = document.getElementById("serieList");
    serieList.innerHTML = '';

    const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();
    
    // Filtra as séries de acordo com o termo de busca
    const seriesFiltradas = Object.entries(seriesAgrupadas)
        .filter(([serieNome]) => serieNome.toLowerCase().includes(termoBusca));

    // Calcular o índice de início e fim para a paginação
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const seriesPaginadas = seriesFiltradas.slice(inicio, fim);

    seriesPaginadas.forEach(([serieNome, { capa, categoria, ano, episodios }]) => {
        const serieDiv = document.createElement("div");
        serieDiv.classList.add("serie");

        const tituloSerie = document.createElement("h3");
        tituloSerie.textContent = `${serieNome} (${ano})`;
        serieDiv.appendChild(tituloSerie);

        if (capa) {
            const imgCapa = document.createElement("img");
            imgCapa.src = capa;
            imgCapa.alt = `Capa de ${serieNome}`;
            imgCapa.classList.add("capa");

            // Redireciona ao clicar na capa
            imgCapa.addEventListener("click", () => {
                // Codifica o nome da série para evitar problemas com caracteres especiais
                const encodedSerieNome = encodeURIComponent(serieNome);
                window.location.href = `episodios.html?serie=${encodedSerieNome}`;
            });

            serieDiv.appendChild(imgCapa);
        }

        serieList.appendChild(serieDiv);
    });

    // Exibe os botões de navegação de página
    exibirBotoesPaginacao(seriesFiltradas.length);
}


function exibirBotoesPaginacao(totalItens) {
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const paginacaoContainer = document.getElementById("paginacaoContainer");
    paginacaoContainer.innerHTML = ''; // Limpa os botões anteriores

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement("button");
        botao.textContent = i;
        botao.classList.add('botao-paginacao');
        if (i === paginaAtual) {
            botao.classList.add('ativo');
        }
        botao.onclick = () => mudarPagina(i);
        paginacaoContainer.appendChild(botao);
    }
}
function mudarPagina(novaPagina) {
    paginaAtual = novaPagina;
    exibirSeriesNaPagina(seriesAgrupadas);
}


// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    listarArquivos();
    document.getElementById("barraDeBusca").addEventListener("input", () => {
        exibirSeriesNaPagina(seriesAgrupadas);
    });
});
