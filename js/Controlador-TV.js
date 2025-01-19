document.addEventListener("keydown", function (event) {
    const focusedElement = document.activeElement;
    const items = document.querySelectorAll(".Item-Geral");
    const itemIndex = Array.from(items).indexOf(focusedElement);
  
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
  