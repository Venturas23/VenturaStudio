const arquivosM3U = [
    'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/TV-AO-VIVO/Canais Escolhidos.m3u',
    'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/TV-AO-VIVO/Canais TV Aberta.m3u'
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
                    // Verifica se a linha atual é um link e armazena
                    link = linha;
        
                    if (link) {
                        // Cria o item na lista com as informações do canal
                        const listItem = document.createElement("div");
                        listItem.classList.add('Item-Geral');
        
                        // Adiciona capa (imagem) se existir
                        if (capa) {
                            const img = document.createElement("img");
                            img.src = capa;
                            img.alt = `Capa de ${nomeCanal}`;
                            img.classList.add('Capa-Geral');
        
                            // Configura o evento de clique para abrir o link
                            img.onclick = () => {
                                console.log(linha);
                                window.open(linha, '_blank'); // Abre em nova aba
                            };
        
                            listItem.appendChild(img);
                        }
        
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
        // Inicializa a lista de arquivos ao carregar a página
        listarArquivos();