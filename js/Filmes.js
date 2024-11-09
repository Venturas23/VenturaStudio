const arquivosM3U = [
    'js/Lista/M3U/FILMES/Filmes 4K.m3u',
    'js/Lista/M3U/FILMES/Filmes Ação & Aventura.m3u',
    'js/Lista/M3U/FILMES/Filmes Cinema.m3u js/Lista/M3U/FILMES/Filmes Clássicos Legendados.m3u',
    'js/Lista/M3U/FILMES/Filmes Clássicos.m3u js/Lista/M3U/FILMES/Filmes Comédia.m3u',
    'js/Lista/M3U/FILMES/Filmes Crime.m3u js/Lista/M3U/FILMES/Filmes Dança.m3u',
    'js/Lista/M3U/FILMES/Filmes DC Universe.m3u js/Lista/M3U/FILMES/Filmes Drama & Suspense.m3u',
    'js/Lista/M3U/FILMES/Filmes Fantasia.m3u js/Lista/M3U/FILMES/Filmes Faroeste.m3u',
    'js/Lista/M3U/FILMES/Filmes Geral.m3u',
    'js/Lista/M3U/FILMES/Filmes Guerra.m3u',
    'js/Lista/M3U/FILMES/Filmes Infantil.m3u',
    'js/Lista/M3U/FILMES/Filmes Kids.m3u',
    'js/Lista/M3U/FILMES/Filmes Lançamentos 2022.m3u',
    'js/Lista/M3U/FILMES/Filmes Lançamentos 2023.m3u',
    'js/Lista/M3U/FILMES/Filmes Lançamentos 2024.m3u',
    'js/Lista/M3U/FILMES/Filmes Legendado.m3u',
    'js/Lista/M3U/FILMES/Filmes Marvel Universe.m3u',
    'js/Lista/M3U/FILMES/Filmes Nacional.m3u',
    'js/Lista/M3U/FILMES/Filmes Religioso.m3u',
    'js/Lista/M3U/FILMES/Filmes Romance.m3u',
    'js/Lista/M3U/FILMES/Filmes Shows.m3u',
    'js/Lista/M3U/FILMES/Filmes Standard, Documentário e +.m3u',
    'js/Lista/M3U/FILMES/Filmes Terror.m3u'
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
        async function carregarArquivoM3U() {
            const arquivoSelecionado = document.getElementById("filtroArquivo").value;
            const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();
            if (!arquivoSelecionado) return;

        try {
            const response = await fetch(arquivoSelecionado);
            if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
        
            const m3uText = await response.text();
            exibirCanais(m3uText, termoBusca);
        } catch (error) {
            console.error("Erro ao carregar o arquivo M3U:", error);
            document.getElementById("canalList").textContent = "Erro ao carregar canais.";
    }
        }

        // Função para processar e exibir os canais do arquivo M3U
        // Função para processar e exibir os canais do arquivo M3U
function exibirCanais(m3uText) {
    const linhas = m3uText.split("\n");
    const canalList = document.getElementById("canalList");
    const termoBusca = document.getElementById("barraDeBusca").value.toLowerCase();

    // Limpa a lista antes de exibir
    canalList.innerHTML = ''; 

    let nomeCanal = '';
    let grupo = '';
    let capa = '';
    let link = '';

    // Itera sobre cada linha do arquivo M3U
    linhas.forEach(linha => {
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

            // Aplica o filtro de busca no conteúdo do canal
            if (nomeCanal.toLowerCase().includes(termoBusca) ||
                grupo.toLowerCase().includes(termoBusca) ||
                link.toLowerCase().includes(termoBusca)) {

                const listItem = document.createElement("div");
                listItem.classList.add('Item-Geral');

                const linkElement = document.createElement("a");
                linkElement.href = link;
                linkElement.textContent = nomeCanal;
                linkElement.style = 'visibility:collapse';

                // Adiciona imagem de capa, se disponível
                if (capa) {
                    const img = document.createElement("img");
                    img.src = capa;
                    img.alt = `Capa de ${nomeCanal}`;
                    img.classList.add('Capa-Geral');
                    img.href = link;
                    listItem.appendChild(img);
                    
                    img.onclick = (e) => {
                        e.preventDefault();
                        reproduzirVideo(linha);
                    };
                }

                listItem.appendChild(linkElement);
                canalList.appendChild(listItem);
            }

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