const arquivosM3U = [
    'js/Lista/M3U/Series Amazon Prime Video.m3u',
    'js/Lista/M3U/Series AMC Plus.m3u',
    'js/Lista/M3U/Series Apple TV Plus.m3u',
    'js/Lista/M3U/Series Brasil Paralelo.m3u',
    'js/Lista/M3U/Series Claro Video.m3u',
    'js/Lista/M3U/Series Crunchyroll.m3u',
    'js/Lista/M3U/Series Geral.m3u',
    'js/Lista/M3U/Series Legendadas.m3u',
    'js/Lista/M3U/Series Lionsgate.m3u',
    'js/Lista/M3U/Series Max.m3u',
    'js/Lista/M3U/Series Netflix.m3u',
    'js/Lista/M3U/Series Outras Produtoras.m3u',
    'js/Lista/M3U/Series Paramount.m3u',
    'js/Lista/M3U/Series Play Plus.m3u',
    'js/Lista/M3U/Series SBT.m3u',
    'js/Lista/M3U/Series Star Plus.m3u',
    'js/Lista/M3U/Series Univer.m3u'
    // Adicione mais arquivos aqui
  ];

  const seriesAgrupadas = {}; // Definindo como variável global

  function removerExtensao(nomeArquivo) {
      return nomeArquivo.endsWith('.m3u') ? nomeArquivo.substring(0, nomeArquivo.length - 4) : nomeArquivo;
  }
  
  function listarArquivos() {
      const filtroArquivo = document.getElementById("filtroArquivo");
      arquivosM3U.forEach(arquivo => {
          const option = document.createElement("option");
          option.value = arquivo;
          option.textContent = removerExtensao(arquivo.split('/').pop());
          filtroArquivo.appendChild(option);
      });
  }
  
  async function carregarArquivoM3U() {
      const arquivoSelecionado = document.getElementById("filtroArquivo").value;
      if (!arquivoSelecionado) return;
      
      try {
          const response = await fetch(arquivoSelecionado);
          const m3uText = await response.text();
          exibirSeries(m3uText);
      } catch (error) {
          console.error("Erro ao carregar o arquivo M3U:", error);
          document.getElementById("serieList").textContent = "Erro ao carregar séries.";
      }
  }
  
  function exibirSeries(m3uText) {
      const linhas = m3uText.split("\n");
  
      linhas.forEach(linha => {
          linha = linha.trim();
          
          if (linha.startsWith("#EXTINF")) {
              const [info, nome] = linha.split(",");
              const resultado = nome ? nome.match(/(.*) (S\d+E\d+)/) : null;
  
              if (resultado) {
                  const [_, serieNome, temporadaEp] = resultado;
                  const capa = info.includes("tvg-logo=") ? info.split("tvg-logo=")[1].split('"')[1] : '';
  
                  if (!seriesAgrupadas[serieNome]) {
                      seriesAgrupadas[serieNome] = { capa, episodios: [] };
                  }
  
                  seriesAgrupadas[serieNome].episodios.push({ nome: temporadaEp, link: '' });
              }
          } else if (linha && !linha.startsWith("#")) {
              const serieNomeAtual = Object.keys(seriesAgrupadas).slice(-1)[0];
              if (serieNomeAtual) {
                  seriesAgrupadas[serieNomeAtual].episodios.slice(-1)[0].link = linha;
              }
          }
      });
  
      exibirSeriesNaPagina(seriesAgrupadas);
  }
  
  function exibirSeriesNaPagina(seriesAgrupadas) {
      const serieList = document.getElementById("serieList");
      serieList.innerHTML = '';
  
      for (const [serieNome, { capa, episodios }] of Object.entries(seriesAgrupadas)) {
          const serieDiv = document.createElement("div");
          serieDiv.classList.add("Item-Geral");
  
          const tituloSerie = document.createElement("h3");
          tituloSerie.classList.add('Titulo-Geral');
          tituloSerie.textContent = serieNome;
          serieDiv.appendChild(tituloSerie);
  
          // Link para a capa que leva ao último episódio assistido
          const linkElement = document.createElement("a");
          linkElement.href = "#";
          linkElement.addEventListener("click", (e) => {
              e.preventDefault();
              const ultimoEpisodio = localStorage.getItem(`ultimoEpisodio-${serieNome}`);
              if (ultimoEpisodio) {
                  reproduzirVideo(ultimoEpisodio);
              } else {
                  // Se não houver progresso salvo, começa pelo primeiro episódio
                  reproduzirVideo(episodios[0].link);
              }
          });
  
          if (capa) {
              const imgCapa = document.createElement("img");
              imgCapa.src = capa;
              imgCapa.alt = `Capa de ${serieNome}`;
              imgCapa.classList.add("Capa-Geral");
              linkElement.appendChild(imgCapa);
              serieDiv.appendChild(linkElement);
          }
  
          episodios.forEach(({ nome, link }) => {
              const episodioLink = document.createElement("a");
              episodioLink.href = link;
              episodioLink.textContent = nome;
              episodioLink.classList.add("episodio");
              episodioLink.addEventListener("click", (e) => {
                  e.preventDefault();
                  salvarUltimoEpisodio(serieNome, link);
                  reproduzirVideo(link);
              });
              serieDiv.appendChild(episodioLink);
          });
  
          serieList.appendChild(serieDiv);
      }
  }
  
  function salvarUltimoEpisodio(serieNome, link) {
      localStorage.setItem(`ultimoEpisodio-${serieNome}`, link);
  }
  
  function reproduzirVideo(url) {
      const player = videojs('videoPlayer');
      player.src({ type: 'video/mp4', src: url });
      
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
  
      // Avança automaticamente para o próximo episódio ao finalizar
      player.on('ended', () => {
          const proximoEpisodio = obterProximoEpisodio(url);
          if (proximoEpisodio) {
              const serieNome = obterNomeSerie(url);
              salvarUltimoEpisodio(serieNome, proximoEpisodio);
              reproduzirVideo(proximoEpisodio);
          }
      });
  }
  
  // Função para obter o próximo episódio
  function obterProximoEpisodio(urlAtual) {
      for (const { episodios } of Object.values(seriesAgrupadas)) {
          for (let i = 0; i < episodios.length - 1; i++) {
              if (episodios[i].link === urlAtual) {
                  return episodios[i + 1].link; // Retorna o link do próximo episódio
              }
          }
      }
      return null; // Retorna null se não houver próximo episódio
  }
  
  // Função auxiliar para obter o nome da série a partir da URL do episódio atual
  function obterNomeSerie(url) {
      for (const [serieNome, { episodios }] of Object.entries(seriesAgrupadas)) {
          if (episodios.some(episodio => episodio.link === url)) {
              return serieNome;
          }
      }
      return null;
  }
  
  // Inicializar a lista de arquivos ao carregar a página
  listarArquivos();
