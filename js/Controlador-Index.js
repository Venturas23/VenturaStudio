document.addEventListener("keydown", function (event) {
    const focusedElement = document.activeElement;
    const items = document.querySelectorAll("a");
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
    }
  });
  