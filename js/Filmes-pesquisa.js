const baseFolderUrl = 'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/FILMES/';

async function fetchM3UFiles() {
    try {
        const response = await fetch(baseFolderUrl + 'file-pesq.json');
        if (!response.ok) throw new Error(`Erro ao obter lista de arquivos: ${response.statusText}`);
        const fileNames = await response.json();
        return fileNames.map(fileName => ({
            url: baseFolderUrl + fileName,
            nome: fileName.replace('.m3u', '')
        }));
    } catch (error) {
        console.error("Erro ao buscar arquivos M3U:", error);
        return [];
    }
}

async function carregarFilmes(arquivoUrl) {
    try {
        const response = await fetch(arquivoUrl);
        if (!response.ok) throw new Error(`Erro ao carregar arquivo M3U: ${response.statusText}`);
        const m3uText = await response.text();
        const linhas = m3uText.split("\n");
        const filmes = [];
        
        let nomeCanal = '', capa = '', link = '';

        for (const linha of linhas) {
            if (linha.startsWith("#EXTINF")) {
                nomeCanal = linha.split(",")[1]?.trim() || 'Sem Nome';
                const logoMatch = linha.match(/tvg-logo="([^"]+)"/);
                capa = logoMatch ? logoMatch[1] : '';
            } else if (linha && !linha.startsWith("#")) {
                link = linha.trim();
                filmes.push({ nomeCanal, capa, link });
            }
        }
        return filmes;
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        return [];
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
            for (const arquivo of arquivosM3U) {
                const filmes = await carregarFilmes(arquivo.url);
                const filmesFiltrados = filmes.filter(filme => filme.nomeCanal.toLowerCase().includes(query));

                filmesFiltrados.forEach(filme => {
                    const filmeItem = document.createElement('div');
                    filmeItem.classList.add('item-filme');
                    filmeItem.setAttribute('tabindex', -1);
                    filmeItem.setAttribute('role', 'button');
                    filmeItem.setAttribute('aria-label', `Filme: ${filme.nomeCanal}`);
                    filmeItem.dataset.capa = filme.capa || 'placeholder.jpg';
                    filmeItem.dataset.nomeCanal = filme.nomeCanal;
                    filmeItem.dataset.link = filme.link;

                    const img = document.createElement('img');
                    img.src = filme.capa || 'placeholder.jpg';
                    img.alt = filme.nomeCanal;
                    filmeItem.appendChild(img);

                    filmeItem.onclick = () => abrirIframeFilme(filme.link);
                    filmeItem.onkeydown = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            abrirIframeFilme(filme.link);
                        }
                    };

                    resultadosContainer.appendChild(filmeItem);
                });
            }
        }
    });
});
// Função para reproduzir vídeo
function abrirIframeFilme(url) {
    window.open(url, '_blank');
}
