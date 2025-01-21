const baseFolderUrl = 'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/FILMES/';

// Função para listar arquivos de categorias
async function fetchM3UFiles() {
    try {
        const response = await fetch(baseFolderUrl + 'file-list.json');
        if (!response.ok) throw new Error(`Erro ao obter lista de arquivos: ${response.statusText}`);
        const fileNames = await response.json();
        return fileNames.map(fileName => baseFolderUrl + fileName);
    } catch (error) {
        console.error("Erro ao buscar arquivos M3U:", error);
        return [];
    }
}

async function listarCategorias() {
    const categoriasContainer = document.getElementById('categoriasContainer');
    categoriasContainer.innerHTML = '';

    const arquivosM3U = await fetchM3UFiles();
    let categoriaIndex = 1; // Índice para cada categoria

    for (const arquivo of arquivosM3U) {
        const categoriaNome = arquivo.split('/').pop().replace('.m3u', '');
        const filmes = await carregarFilmes(arquivo);

        // Cria o elemento para a categoria
        const categoriaDiv = document.createElement('div');
        categoriaDiv.classList.add('categoria');
        categoriaDiv.setAttribute('tabindex', 0); // Torna a categoria focável
        categoriaDiv.setAttribute('aria-label', `Categoria ${categoriaNome}`);
        categoriaDiv.dataset.index = categoriaIndex;

        const titulo = document.createElement('h2');
        titulo.classList.add('titulo-categoria');
        titulo.textContent = categoriaNome;

        const carrossel = document.createElement('div');
        carrossel.classList.add('carrossel');
        carrossel.dataset.categoria = categoriaIndex;

        // Adiciona os itens ao carrossel com suporte ao teclado
        filmes.forEach((filme, index) => {
            const filmeItem = document.createElement('div');
            filmeItem.classList.add('item-filme');
            filmeItem.setAttribute('tabindex', -1); // Foco desativado inicialmente
            filmeItem.setAttribute('role', 'button'); // Indica que é clicável
            filmeItem.setAttribute('aria-label', `Filme: ${filme.nomeCanal}`);
            filmeItem.dataset.index = index;
            filmeItem.dataset.capa = filme.capa || 'placeholder.jpg';
            filmeItem.dataset.nomeCanal = filme.nomeCanal;
            filmeItem.dataset.link = filme.link;

            // Lazy rendering: Renderiza os dois primeiros itens diretamente
            if (index < 2) {
                const img = document.createElement('img');
                img.src = filme.capa || 'placeholder.jpg';
                img.alt = filme.nomeCanal;

                filmeItem.appendChild(img);
            }

            // Adiciona eventos de teclado para interação
            filmeItem.onclick = () => reproduzirVideo(filme.link);
            filmeItem.onkeydown = (e) => {
                if (e.key === 'Space' || e.key === ' ') {
                    abrirIframeFilme(filme.link);
                } else if (e.key === 'ArrowRight') {
                    navegarCarrossel(carrossel, filmeItem, 1); // Próximo item
                } else if (e.key === 'ArrowLeft') {
                    navegarCarrossel(carrossel, filmeItem, -1); // Item anterior
                }
            };

            carrossel.appendChild(filmeItem);
        });

        categoriaDiv.appendChild(titulo);
        categoriaDiv.appendChild(carrossel);
        categoriasContainer.appendChild(categoriaDiv);

        categoriaIndex++;
    }

    iniciarNavegacaoEntreCategorias(); // Configura navegação por categorias com as setas e Enter
    iniciarLazyLoading(); // Inicia o lazy loading após carregar os carrosséis
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
                nomeCanal = linha.split(",")[1] || 'Sem Nome';
                capa = linha.includes("tvg-logo=") ? linha.split("tvg-logo=")[1].split('"')[1] : '';
            } else if (linha && !linha.startsWith("#")) {
                link = linha;
                filmes.push({ nomeCanal, capa, link });
            }
        }
        return filmes;
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        return [];
    }
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

// Navegação entre categorias com Enter
function iniciarNavegacaoEntreCategorias() {
    const categorias = Array.from(document.querySelectorAll('.categoria'));

    categorias.forEach(categoria => {
        categoria.onkeydown = (e) => {
            if (e.key === 'Enter') {
                // Move o foco para o primeiro item do carrossel dentro da categoria
                const carrossel = categoria.querySelector('.carrossel');
                const primeiroItem = carrossel.querySelector('.item-filme');
                if (primeiroItem) {
                    primeiroItem.focus();
                }
            } else if (e.key === 'ArrowDown') {
                // Próxima categoria
                const proximaCategoria = categorias[categorias.indexOf(categoria) + 1];
                if (proximaCategoria) {
                    proximaCategoria.focus();
                }
            } else if (e.key === 'ArrowUp') {
                // Categoria anterior
                const categoriaAnterior = categorias[categorias.indexOf(categoria) - 1];
                if (categoriaAnterior) {
                    categoriaAnterior.focus();
                }
            }
        };
    });
}
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
// Lazy loading com descarregamento de imagens fora de visão
function iniciarLazyLoading() {
    const itensFilme = document.querySelectorAll('.item-filme');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const item = entry.target;

                if (entry.isIntersecting) {
                    // Se o item está visível, carrega a imagem
                    if (!item.querySelector('img')) {
                        const img = document.createElement('img');
                        img.src = item.dataset.capa;
                        img.alt = item.dataset.nomeCanal;
                        img.loading = "lazy"; // Melhora o carregamento de imagens
                        item.appendChild(img);
                    }
                }
            });
        },
        {
            root: null, // Usa o viewport como referência
            rootMargin: '0px 400px' // Margem para pré-carregar e descarregar
        }
    );

    itensFilme.forEach(item => observer.observe(item));
}



// Inicializa as categorias
listarCategorias();