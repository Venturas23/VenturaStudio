const baseFolderUrl = 'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/FILMES/';

// Função para listar os nomes dos arquivos de categorias
async function fetchM3UFiles() {
    try {
        const response = await fetch(baseFolderUrl + 'file-list.json');
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

// Função para carregar filmes de uma categoria
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

// Função para criar uma categoria vazia
function criarCategoria(categoriaNome, categoriaIndex) {
    const categoriasContainer = document.getElementById('categoriasContainer');
    if (!categoriasContainer) {
        console.error("Elemento 'categoriasContainer' não encontrado.");
        return;
    }

    const categoriaDiv = document.createElement('div');
    categoriaDiv.classList.add('categoria');
    categoriaDiv.dataset.index = categoriaIndex;

    const titulo = document.createElement('h2');
    titulo.classList.add('titulo-categoria');
    titulo.textContent = categoriaNome;

    const carrosselContainer = document.createElement('div');
    carrosselContainer.classList.add('carrossel-container');

    const carrossel = document.createElement('div');
    carrossel.classList.add('carrossel');
    carrossel.dataset.categoria = categoriaIndex;

    const btnPrev = document.createElement('button');
    btnPrev.classList.add('btn-prev');
    btnPrev.textContent = '<';
    btnPrev.onclick = () => navegarCarrossel(carrossel, -1);

    const btnNext = document.createElement('button');
    btnNext.classList.add('btn-next');
    btnNext.textContent = '>';
    btnNext.onclick = () => navegarCarrossel(carrossel, 1);

    carrosselContainer.appendChild(btnPrev);
    carrosselContainer.appendChild(carrossel);
    carrosselContainer.appendChild(btnNext);

    categoriaDiv.appendChild(titulo);
    categoriaDiv.appendChild(carrosselContainer);
    categoriasContainer.appendChild(categoriaDiv);
}

function navegarCarrossel(carrossel, direcao) {
    const itemWidth = carrossel.querySelector('.item-filme').offsetWidth;
    const scrollAmount = itemWidth * direcao;
    carrossel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// Função para carregar os itens de uma categoria
async function carregarCategoria(categoriaDiv, arquivoUrl) {
    const carrossel = categoriaDiv.querySelector('.carrossel');
    carrossel.innerHTML = ''; // Limpa antes de carregar

    const filmes = await carregarFilmes(arquivoUrl);
    filmes.forEach((filme, index) => {
        const filmeItem = document.createElement('div');
        filmeItem.classList.add('item-filme');
        filmeItem.dataset.index = index;
        filmeItem.dataset.capa = filme.capa || 'placeholder.jpg';
        filmeItem.dataset.nomeCanal = filme.nomeCanal;
        filmeItem.dataset.link = filme.link;

        const img = document.createElement('img');
        img.src = filme.capa || 'placeholder.jpg';
        img.alt = filme.nomeCanal;
        filmeItem.appendChild(img);

        // Adiciona eventos
        filmeItem.onclick = () => abrirIframeFilme(filme.link);

        carrossel.appendChild(filmeItem);
    });
}

// Inicializa as categorias com carregamento dinâmico
async function listarCategorias() {
    const arquivosM3U = await fetchM3UFiles();

    // Cria categorias vazias
    arquivosM3U.forEach((arquivo, index) => {
        criarCategoria(arquivo.nome, index + 1);
    });

    // Carrega todas as categorias
    const categorias = document.querySelectorAll('.categoria');
    categorias.forEach(async (categoriaDiv, index) => {
        const arquivoUrl = arquivosM3U[index].url;
        await carregarCategoria(categoriaDiv, arquivoUrl);
    });
}

// Função para abrir o link do filme em outra aba
function abrirIframeFilme(url) {
    window.open(url, '_blank');
}

// Inicializa o sistema
listarCategorias();
