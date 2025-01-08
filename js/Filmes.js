const arquivosM3U = [
    'js/Lista/M3U/FILMES/4K.m3u',
    'js/Lista/M3U/FILMES/007 COLEÇÃO.m3u',
    'js/Lista/M3U/FILMES/2024 LANÇAMENTO.m3u',
    'js/Lista/M3U/FILMES/AÇÃO.m3u',
    'js/Lista/M3U/FILMES/ANIMAÇÃO.m3u',
    'js/Lista/M3U/FILMES/ANIME.m3u',
    'js/Lista/M3U/FILMES/APPLE TV+.m3u',
    'js/Lista/M3U/FILMES/AVENTURA.m3u',
    'js/Lista/M3U/FILMES/BRASIL PARALELO.m3u',
    'js/Lista/M3U/FILMES/COMEDIA.m3u',
    'js/Lista/M3U/FILMES/COPA DO MUNDO 2022.m3u',
    'js/Lista/M3U/FILMES/CRIME.m3u',
    'js/Lista/M3U/FILMES/DC COMICS.m3u',
    'js/Lista/M3U/FILMES/DESPERTAR UMA NOVA CONSCIÊNCIA.m3u',
    'js/Lista/M3U/FILMES/DISNEY+.m3u',
    'js/Lista/M3U/FILMES/DOCUMENTARIOS.m3u',
    'js/Lista/M3U/FILMES/DRAMA.m3u',
    'js/Lista/M3U/FILMES/ESPECIAL NATAL.m3u',
    'js/Lista/M3U/FILMES/FANTASIA.m3u',
    'js/Lista/M3U/FILMES/FAROESTE.m3u',
    'js/Lista/M3U/FILMES/FICÇÃO.m3u',
    'js/Lista/M3U/FILMES/GERAL.m3u',
    'js/Lista/M3U/FILMES/GLOBOPLAY.m3u',
    'js/Lista/M3U/FILMES/GUERRA.m3u',
    'js/Lista/M3U/FILMES/HBO MAX.m3u',
    'js/Lista/M3U/FILMES/INFANTIL.m3u',
    'js/Lista/M3U/FILMES/LEGENDADOS.m3u',
    'js/Lista/M3U/FILMES/MARVEL.m3u',
    'js/Lista/M3U/FILMES/NACIONAL.m3u',
    'js/Lista/M3U/FILMES/NETFLIX.m3u',
    'js/Lista/M3U/FILMES/NO CINEMA ( EM CARTAZ ).m3u',
    'js/Lista/M3U/FILMES/PARAMOUNT+.m3u',
    'js/Lista/M3U/FILMES/PEDIDO DE CLIENTES.m3u',
    'js/Lista/M3U/FILMES/PRIME VIDEO.m3u',
    'js/Lista/M3U/FILMES/RELIGIOSO.m3u',
    'js/Lista/M3U/FILMES/ROMANCE.m3u',
    'js/Lista/M3U/FILMES/SONS PARA DORMIR.m3u',
    'js/Lista/M3U/FILMES/STAR+.m3u',
    'js/Lista/M3U/FILMES/SUSPENSE.m3u',
    'js/Lista/M3U/FILMES/TERROR.m3u'
    // Adicione mais arquivos aqui
  ];
  function removerExtensao(nomeArquivo) {
    // Verifica se o arquivo possui a extensão .m3u e remove-a
    return nomeArquivo.endsWith('.m3u') ? nomeArquivo.substring(0, nomeArquivo.length - 4) : nomeArquivo;
}
      // Função para listar os arquivos M3U no seletor
        function listarArquivos() {
            const filtroArquivo = document.getElementById("filtroArquivo");
            
            // Adiciona a opção inicial "Selecione a Categoria"
            const option_null = document.createElement("option");
            option_null.value = "";
            option_null.textContent = 'Selecione a Categoria';
            filtroArquivo.appendChild(option_null);

            arquivosM3U.forEach(arquivo => {
                const option = document.createElement("option");
                option.value = arquivo;
                option.textContent = removerExtensao(arquivo.split('/').pop());
                filtroArquivo.appendChild(option);
            });
        }

        // Função para carregar e processar o arquivo M3U selecionado
        let itensPorPagina = 45;
        let paginaAtual = 1;
        let m3uTextGlobal = '';  // Variável global para armazenar o conteúdo do arquivo
        
        async function carregarArquivoM3U() {
            // Redefine a página atual para 1 ao selecionar um novo filtro
            paginaAtual = 1;
        
            const arquivoSelecionado = document.getElementById("filtroArquivo").value;
            const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();
            if (!arquivoSelecionado) return;
        
            try {
                const response = await fetch(arquivoSelecionado);
                if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
            
                m3uTextGlobal = await response.text();  // Armazena o conteúdo do arquivo M3U
                exibirCanais(m3uTextGlobal, termoBusca);  // Chama exibirCanais diretamente
            } catch (error) {
                console.error("Erro ao carregar o arquivo M3U:", error);
                document.getElementById("canalList").textContent = "Erro ao carregar canais.";
            }
        }
        
        function exibirCanais(m3uText, termoBusca) {
            const linhas = m3uText.split("\n");
            const canalList = document.getElementById("canalList");
            canalList.innerHTML = ''; 
        
            let nomeCanal = '';
            let grupo = '';
            let capa = '';
            let link = '';
        
            // Filtrar linhas que contêm o termo de busca
            const canaisFiltrados = linhas.reduce((result, linha) => {
                linha = linha.trim();
                if (linha.startsWith("#EXTINF")) {
                    nomeCanal = linha.split(",")[1] || 'Canal Sem Nome';
                    grupo = linha.includes("group-title=") 
                            ? linha.split("group-title=")[1].split('"')[1]
                            : 'Outros';
                    capa = linha.includes("tvg-logo=") 
                           ? linha.split("tvg-logo=")[1].split('"')[1]
                           : '';
                } else if (linha && !linha.startsWith("#")) {
                    link = linha;
                    if (nomeCanal.toLowerCase().includes(termoBusca) ||
                        grupo.toLowerCase().includes(termoBusca) ||
                        link.toLowerCase().includes(termoBusca)) {
                        result.push({ nomeCanal, grupo, capa, link });
                    }
                    nomeCanal = '';
                    grupo = '';
                    capa = '';
                    link = '';
                }
                return result;
            }, []);
        
            // Calcular o índice inicial e final para a página atual
            const inicio = (paginaAtual - 1) * itensPorPagina;
            const fim = inicio + itensPorPagina;
            const canaisPaginados = canaisFiltrados.slice(inicio, fim);
        
            // Exibir itens paginados
            canaisPaginados.forEach(canal => {
                const listItem = document.createElement("div");
                listItem.classList.add('Item-Geral');
                
                if (canal.capa) {
                    const img = document.createElement("img");
                    img.src = canal.capa;
                    img.alt = `Capa de ${canal.nomeCanal}`;
                    img.classList.add('Capa-Geral');
                    
                    // Ao clicar na imagem, abrir link em nova aba
                    img.onclick = () => {
                        window.open(canal.link, "_blank");
                    };
        
                    listItem.appendChild(img);
                }
        
                const linkElement = document.createElement("a");
                linkElement.href = canal.link;
                linkElement.textContent = canal.nomeCanal;
                linkElement.style = 'visibility:collapse'; // Oculta o texto para exibir apenas a capa
        
                listItem.appendChild(linkElement);
                canalList.appendChild(listItem);
            });
        
            // Exibir botões de navegação
            exibirBotoesPaginacao(canaisFiltrados.length);
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
            const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();
            exibirCanais(m3uTextGlobal, termoBusca);  // Exibe a nova página diretamente
        }
        
                

        
        function reproduzirVideo(url) {
            console.log(url);
            const player = videojs('videoPlayer');
            player.src({type: 'video/mp4', src: url });
            player.ready(() => {
                player.play();
                const videoElement = document.getElementById("videoPlayer");

                if (videoElement.requestFullscreen) {
                    videoElement.requestFullscreen();
                } else if (videoElement.mozRequestFullScreen) { // Firefox
                    videoElement.mozRequestFullScreen();
                } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari e Opera
                    videoElement.webkitRequestFullscreen();
                } else if (videoElement.msRequestFullscreen) { // IE/Edge
                    videoElement.msRequestFullscreen();
                }
            });
            
        }

        // Inicializa a lista de arquivos ao carregar a página
        listarArquivos();
