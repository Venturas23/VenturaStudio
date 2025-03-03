const baseFolderUrl = 'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/SERIES/';

async function fetchM3UFiles() {
    try {
        const response = await fetch(baseFolderUrl + 'file-pesq.json');
        if (!response.ok) throw new Error(`Erro ao obter lista de arquivos: ${response.statusText}`);
        const fileNames = await response.json();
        console.log('Arquivos M3U:', fileNames); // Log dos arquivos M3U
        return fileNames.map(fileName => ({
            url: baseFolderUrl + fileName,
            nome: fileName.replace('.m3u', '')
        }));
    } catch (error) {
        console.error("Erro ao buscar arquivos M3U:", error);
        return [];
    }
}

async function carregarSeries(arquivoUrl) {
    try {
        const response = await fetch(arquivoUrl);
        if (!response.ok) throw new Error(`Erro ao carregar arquivo M3U: ${response.statusText}`);
        const m3uText = await response.text();
        const linhas = m3uText.split("\n");
        const series = {};

        let nomeCanal = '', link = '', imagem = '';

        for (const linha of linhas) {
            if (linha.startsWith("#EXTINF")) {
                nomeCanal = linha.split(",")[1]?.trim() || 'Sem Nome';
                const match = nomeCanal.match(/^(.*?)(?: (\d{4}))? (S\d+E\d+)/);
                if (match) {
                    const [_, serieNome, ano, temporadaEp] = match;
                    const serieKey = ano ? `${serieNome} (${ano})` : serieNome;
                    if (!series[serieKey]) {
                        series[serieKey] = {};
                    }
                    const temporada = temporadaEp.split('E')[0];
                    if (!series[serieKey][temporada]) {
                        series[serieKey][temporada] = [];
                    }
                    series[serieKey][temporada].push({ nomeCanal: `${serieNome} ${temporadaEp}`, link, imagem });
                }
            } else if (linha.startsWith("#EXTIMG")) {
                imagem = linha.split(":")[1]?.trim() || '';
            } else if (linha && !linha.startsWith("#")) {
                link = linha.trim();
            }
        }
        console.log('Series carregadas:', series); // Log das séries carregadas
        return series;
    } catch (error) {
        console.error("Erro ao carregar séries:", error);
        return {};
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inputPesquisa = document.getElementById('inputPesquisa');
    const resultadosContainer = document.getElementById('resultadosContainer');

    inputPesquisa.addEventListener('input', async () => {
        const query = inputPesquisa.value.toLowerCase();
        resultadosContainer.innerHTML = ''; // Limpa os resultados anteriores

        if (query.length > 0) {
            const arquivosM3U = await fetchM3UFiles();
            console.log('Arquivos M3U obtidos:', arquivosM3U); // Log dos arquivos M3U obtidos
            const seriesPromises = arquivosM3U.map(arquivo => carregarSeries(arquivo.url));
            const seriesList = await Promise.all(seriesPromises);

            const series = seriesList.reduce((acc, series) => ({ ...acc, ...series }), {});
            console.log('Series filtradas:', series); // Log das séries filtradas

            Object.keys(series).filter(serie => serie.toLowerCase().includes(query)).forEach(serie => {
                const serieItem = document.createElement('div');
                serieItem.classList.add('item-serie');
                serieItem.setAttribute('tabindex', -1);
                serieItem.setAttribute('role', 'button');
                serieItem.setAttribute('aria-label', `Série: ${serie}`);
                serieItem.dataset.serie = serie;

                const text = document.createElement('span');
                text.textContent = serie;
                serieItem.appendChild(text);

                serieItem.onclick = () => exibirTemporadas(series[serie]);
                serieItem.onkeydown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        exibirTemporadas(series[serie]);
                    }
                };

                resultadosContainer.appendChild(serieItem);
            });
        }
    });
});

function exibirTemporadas(temporadas) {
    const resultadosContainer = document.getElementById('resultadosContainer');
    resultadosContainer.innerHTML = ''; // Limpa os resultados anteriores

    Object.keys(temporadas).forEach(temporada => {
        const temporadaItem = document.createElement('div');
        temporadaItem.classList.add('item-temporada');
        temporadaItem.setAttribute('tabindex', -1);
        temporadaItem.setAttribute('role', 'button');
        temporadaItem.setAttribute('aria-label', `Temporada: ${temporada}`);
        temporadaItem.dataset.temporada = temporada;

        const text = document.createElement('span');
        text.textContent = temporada;
        temporadaItem.appendChild(text);

        temporadaItem.onclick = () => exibirEpisodios(temporadas[temporada]);
        temporadaItem.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                exibirEpisodios(temporadas[temporada]);
            }
        };

        resultadosContainer.appendChild(temporadaItem);
    });
}

function exibirEpisodios(episodios) {
    const resultadosContainer = document.getElementById('resultadosContainer');
    resultadosContainer.innerHTML = ''; // Limpa os resultados anteriores

    episodios.forEach(episodio => {
        const episodioItem = document.createElement('div');
        episodioItem.classList.add('item-episodio');
        episodioItem.setAttribute('tabindex', -1);
        episodioItem.setAttribute('role', 'button');
        episodioItem.setAttribute('aria-label', `Episódio: ${episodio.nomeCanal}`);
        episodioItem.dataset.nomeCanal = episodio.nomeCanal;
        episodioItem.dataset.link = episodio.link;

        const text = document.createElement('span');
        text.textContent = episodio.nomeCanal;
        episodioItem.appendChild(text);

        if (episodio.imagem) {
            const img = document.createElement('img');
            img.src = episodio.imagem;
            img.alt = episodio.nomeCanal;
            img.style.width = '100px'; // Define a largura da imagem
            episodioItem.appendChild(img);
        }

        episodioItem.onclick = () => abrirIframeSerie(episodio.link, episodios, episodios.indexOf(episodio));
        episodioItem.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                abrirIframeSerie(episodio.link, episodios, episodios.indexOf(episodio));
            }
        };

        resultadosContainer.appendChild(episodioItem);
    });
}

// Função para reproduzir vídeo
function abrirIframeSerie(url, episodios, index) {
    // Cria um iframe para a série
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '1000';

    // Adiciona o iframe ao body
    document.body.appendChild(iframe);

    // Solicita que o iframe fique em tela cheia
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
        iframe.mozRequestFullScreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }

    // Remove o iframe quando o usuário sair da tela cheia
    iframe.onfullscreenchange = () => {
        if (!document.fullscreenElement) {
            iframe.remove();
        }
    };

    // Avança para o próximo episódio quando o atual terminar
    iframe.onload = () => {
        if (iframe.contentDocument) {
            const video = iframe.contentDocument.querySelector('video');
            if (video) {
                video.onended = () => {
                    iframe.remove();
                    if (index + 1 < episodios.length) {
                        abrirIframeSerie(episodios[index + 1].link, episodios, index + 1);
                    }
                };
            }
        }
    };
}
