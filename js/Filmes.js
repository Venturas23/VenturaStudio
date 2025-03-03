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

    const categoriaDiv = document.createElement('div');
    categoriaDiv.classList.add('categoria');
    categoriaDiv.setAttribute('tabindex', 0);
    categoriaDiv.setAttribute('aria-label', `Categoria ${categoriaNome}`);
    categoriaDiv.dataset.index = categoriaIndex;

    const titulo = document.createElement('h2');
    titulo.classList.add('titulo-categoria');
    titulo.textContent = categoriaNome;

    const carrossel = document.createElement('div');
    carrossel.classList.add('carrossel');
    carrossel.dataset.categoria = categoriaIndex;

    categoriaDiv.appendChild(titulo);
    categoriaDiv.appendChild(carrossel);
    categoriasContainer.appendChild(categoriaDiv);
}

// Função para carregar os itens de uma categoria
async function carregarCategoria(categoriaDiv, arquivoUrl) {
    const carrossel = categoriaDiv.querySelector('.carrossel');
    carrossel.innerHTML = ''; // Limpa antes de carregar

    const filmes = await carregarFilmes(arquivoUrl);
    filmes.forEach((filme, index) => {
        const filmeItem = document.createElement('div');
        filmeItem.classList.add('item-filme');
        filmeItem.setAttribute('tabindex', -1);
        filmeItem.setAttribute('role', 'button');
        filmeItem.setAttribute('aria-label', `Filme: ${filme.nomeCanal}`);
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
        filmeItem.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                abrirIframeFilme(filme.link);
            } else if (e.key === 'ArrowRight') {
                navegarCarrossel(carrossel, filmeItem, 1); // Próximo item
            } else if (e.key === 'ArrowLeft') {
                navegarCarrossel(carrossel, filmeItem, -1); // Item anterior
            }
        };

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

    iniciarNavegacaoEntreCategorias();
}

// Navegação no carrossel com setas do teclado
function navegarCarrossel(carrossel, itemAtual, direcao) {
    const itens = Array.from(carrossel.querySelectorAll('.item-filme'));
    const indexAtual = itens.indexOf(itemAtual);
    const novoIndex = indexAtual + direcao;

    if (novoIndex >= 0 && novoIndex < itens.length) {
        const novoItem = itens[novoIndex];
        novoItem.focus(); // Move o foco para o próximo ou anterior
        novoItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); // Garante visibilidade
    }
}

// Navegação entre categorias com Enter e setas
function iniciarNavegacaoEntreCategorias() {
    const categorias = Array.from(document.querySelectorAll('.categoria'));

    categorias.forEach(categoria => {
        categoria.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const carrossel = categoria.querySelector('.carrossel');
                const primeiroItem = carrossel.querySelector('.item-filme');
                if (primeiroItem) {
                    primeiroItem.focus();
                }
            } else if (e.key === 'ArrowDown') {
                const proximaCategoria = categorias[categorias.indexOf(categoria) + 1];
                if (proximaCategoria) {
                    proximaCategoria.focus();
                }
            } else if (e.key === 'ArrowUp') {
                const categoriaAnterior = categorias[categorias.indexOf(categoria) - 1];
                if (categoriaAnterior) {
                    categoriaAnterior.focus();
                }
            }
        };
    });
}

// Função para reproduzir vídeo
function abrirIframeFilme(url) {
    // Cria um iframe para o filme
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
}

// Inicializa o sistema
listarCategorias();
