const arquivosM3U = [
    'js/Lista/M3U/Filmes 4K.m3u',
    'js/Lista/M3U/Filmes Ação.m3u',
    'js/Lista/M3U/Filmes Animação.m3u',
    'js/Lista/M3U/Filmes Aventura.m3u',
    'js/Lista/M3U/Filmes Cinema.m3u',
    'js/Lista/M3U/Filmes Comedia.m3u',
    'js/Lista/M3U/Filmes Crime.m3u',
    'js/Lista/M3U/Filmes Drama.m3u',
    'js/Lista/M3U/Filmes Dublagem Não Oficial.m3u',
    'js/Lista/M3U/Filmes Familia.m3u',
    'js/Lista/M3U/Filmes Fantasia.m3u',
    'js/Lista/M3U/Filmes Faroeste.m3u',
    'js/Lista/M3U/Filmes Ficção.m3u',
    'js/Lista/M3U/Filmes Geral.m3u',
    'js/Lista/M3U/Filmes Guerra.m3u',
    'js/Lista/M3U/Filmes Infantis.m3u',
    'js/Lista/M3U/Filmes Lançamentos.m3u',
    'js/Lista/M3U/Filmes Legendados.m3u',
    'js/Lista/M3U/Filmes Nacionais.m3u',
    'js/Lista/M3U/Filmes Oscar 2024.m3u',
    'js/Lista/M3U/Filmes Religiosos.m3u',
    'js/Lista/M3U/Filmes Romance.m3u',
    'js/Lista/M3U/Filmes Suspense.m3u',
    'js/Lista/M3U/Filmes Terror.m3u'
    // Adicione mais arquivos aqui
  ];
  function removerExtensao(nomeArquivo) {
    // Verifica se o arquivo possui a extensão .m3u e remove-a
    return nomeArquivo.endsWith('.m3u') ? nomeArquivo.substring(0, nomeArquivo.length - 4) : nomeArquivo;
}
      // Função para listar os arquivos M3U no seletor
        function listarArquivos() {
            const filtroArquivo = document.getElementById("filtroArquivo");
            

            arquivosM3U.forEach(arquivo => {
                const option = document.createElement("option");
                option.value = arquivo;
                option.textContent = removerExtensao(arquivo.split('/').pop());
                filtroArquivo.appendChild(option);
            });
        }

        // Função para carregar e processar o arquivo M3U selecionado
        async function carregarArquivoM3U() {
            const arquivoSelecionado = document.getElementById("filtroArquivo").value;
            if (!arquivoSelecionado) return;

            try {
                const response = await fetch(arquivoSelecionado);
                const m3uText = await response.text();

                // Processa o conteúdo do arquivo M3U
                exibirCanais(m3uText);
            } catch (error) {
                console.error("Erro ao carregar o arquivo M3U:", error);
                document.getElementById("canalList").textContent = "Erro ao carregar canais.";
            }
        }

        // Função para processar e exibir os canais do arquivo M3U
        function exibirCanais(m3uText) {
            const linhas = m3uText.split("\n");
            const canalList = document.getElementById("canalList");
            canalList.innerHTML = ''; // Limpa a lista antes de exibir

            let nomeCanal = '';
            let grupo = '';
            let capa = '';
            let link = '';

            linhas.forEach(linha => {
                linha = linha.trim();

                if (linha.startsWith("#EXTINF")) {
                    // Extrai o nome do canal e o grupo
                    nomeCanal = linha.split(",")[1] || 'Canal Sem Nome';
                    grupo = linha.includes("group-title=") 
                            ? linha.split("group-title=")[1].split('"')[1]
                            : 'Outros';

                    // Extrai a capa (logo) se presente
                    capa = linha.includes("tvg-logo=") 
                           ? linha.split("tvg-logo=")[1].split('"')[1]
                           : '';

                } else if (linha && !linha.startsWith("#")) {
                    // Considera essa linha como o link do canal
                    link = linha;

                    // Cria o item na lista com as informações do canal
                    const listItem = document.createElement("div");
                    listItem.classList.add('Item-Geral');
                    const linkElement = document.createElement("a");
                    linkElement.href = link;
                    linkElement.textContent = nomeCanal;
                    linkElement.style = 'visibility:collapse';

                    // Adiciona capa (imagem) se existir
                    if (capa) {
                        const img = document.createElement("img");
                        img.src = capa;
                        img.alt = `Capa de ${nomeCanal}`;
                        img.classList.add('Capa-Geral');
                        listItem.appendChild(img);
                        img.href = link;
                        img.textContent = nomeCanal;
                        img.onclick = (e) =>{
                            e.preventDefault();
                            console.log(img.href);
                            reproduzirVideo(img.href);
                        }
                    }

                    // Adiciona o título e o link
                    //listItem.appendChild(linkElement);
                    //listItem.appendChild(document.createTextNode(` - Grupo: ${grupo}`));
                    canalList.appendChild(listItem);
                    
                    // Limpa as variáveis para o próximo canal
                    nomeCanal = '';
                    grupo = '';
                    capa = '';
                    link = '';
                }
            });
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