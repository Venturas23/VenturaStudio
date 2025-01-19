document.addEventListener("keydown", function (event) {
    const focusedElement = document.activeElement;
    const items = document.querySelectorAll("[tabindex]");
    const itemIndex = Array.from(items).indexOf(focusedElement);
      // Verifica se a tecla pressionada é Enter
      if (event.key === "Enter") {
        // Encontra o link dentro do elemento com foco
        const link = focusedElement.querySelector('a');
    
        // Se um link for encontrado, simula um clique nele
        if (link) {
          link.click();
        }
      }
    switch (event.key) {
      case "ArrowRight":
        if (itemIndex < items.length - 1) {
          items[itemIndex + 1].focus();
          console.log("Seta para Direita");
        }
        break;
  
      case "ArrowLeft":
        if (itemIndex > 0) {
          items[itemIndex - 1].focus();
          console.log("Seta para Esquerda");
        }
        break;
  
      case "ArrowDown":
        if (itemIndex + 3 < items.length) {
          items[itemIndex + 4].focus();
          console.log("Seta para Baixo");
        }
        break;
  
      case "ArrowUp":
        if (itemIndex - 3 >= 0) {
          items[itemIndex - 4].focus();
          console.log("Seta para Cima");
        }
        break;
    }
  });