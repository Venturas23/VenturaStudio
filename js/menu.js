
let pressTimer;
let keyPressed = false;

// Detecta quando a tecla Control é pressionada por 2 segundos
document.addEventListener('keydown', (event) => {
    if (event.key === "Control" && !keyPressed) {
        keyPressed = true;
        pressTimer = setTimeout(() => {
            window.location.href = 'index.html'; // Substitua pelo link desejado
        }, 500); // 2 segundos
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === "Control") {
        clearTimeout(pressTimer);
        keyPressed = false;
    }
});
