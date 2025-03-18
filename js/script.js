
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fondo = new Image();
fondo.src = "fondo.jpeg"; 

const plataformaImg = new Image();
plataformaImg.src = "plat.png";  // Ruta de la imagen que usarás para la plataforma


// Dimensiones del canvas
const window_height = window.innerHeight / 2;
const window_width = window.innerWidth / 2;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#000";

// Cargar imagen de abeja
const abejaImg = new Image();
abejaImg.src = "mosca.png"; 
const ranaImg = new Image();
ranaImg.src = "lily.png";

// Contadores de eliminación y nivel
let totalCreated = 10;
let totalDeleted = 0;
let level = 1;
let speedMultiplier = 1;

// Elementos de la tarjeta Bootstrap
const nivelElement = document.getElementById("nivel");
const eliminadasElement = document.getElementById("eliminadas");
const porcentajeElement = document.getElementById("porcentaje");

// Cargar el audio
const clickSound = new Audio("cho.mp3");

class Game {
    constructor() {
        this.nivel = 1; // Nivel inicial
        this.abejas = []; // Arreglo para almacenar las moscas
        this.numAbejasPorNivel = 5; // Número inicial de moscas en el primer nivel
        this.maxAbejasPorNivel = 10; // Máximo número de moscas en los niveles más altos
    }

    // Función que genera las moscas según el nivel
    generarAbejas() {
        this.abejas = []; // Reinicia las moscas al inicio de cada nivel
        let abejasAparecer = this.numAbejasPorNivel;

        for (let i = 0; i < abejasAparecer; i++) {
            let speed = (Math.random() * 1.5 + 0.5) * (this.nivel * 0.2);  // Modifica la velocidad según el nivel
            let abeja = new Abeja(Math.random() * window_width, speed);  // Creación de una nueva mosca
            this.abejas.push(abeja);  // Agrega la mosca al arreglo
        }
    }

    // Función que aumenta el nivel y ajusta la cantidad de moscas
    siguienteNivel() {
        this.nivel++;
        // Aumenta la cantidad de moscas según el nivel (hasta un máximo)
        this.numAbejasPorNivel = Math.min(this.numAbejasPorNivel + 2, this.maxAbejasPorNivel);
        this.generarAbejas();  // Genera las moscas para el siguiente nivel
    }

    // Función que actualiza la posición de las moscas
    actualizarAbejas() {
        this.abejas.forEach((abeja) => {
            abeja.update();
        });
    }
}


// Clase Abeja
class Abeja {
    constructor(x, speed) {
        this.x = Math.random() * window_width; // Posición aleatoria en el eje X
        this.y = Math.random() * window_height; // Posición aleatoria en el eje Y
        this.x = x;
        this.y = window_height + 40;
        this.width = 80;
        this.height = 80;
        this.speedY = speed * speedMultiplier;
        this.speedX = (Math.random() - 0.5) * 2;
        this.opacity = 1;
        this.fading = false;
        this.clicked = false;
        this.glow = 0;
        this.hovered = false;
    }
    update() {
        // Las moscas se mueven aleatoriamente en el área
        this.x += Math.random() * this.speed - this.speed / 2; // Movimiento aleatorio en el eje X
        this.y += Math.random() * this.speed - this.speed / 2; // Movimiento aleatorio en el eje Y

        // Se asegura de que la mosca no salga de la pantalla
        if (this.x < 0) this.x = 0;
        if (this.x > window_width) this.x = window_width;
        if (this.y < 0) this.y = 0;
        if (this.y > window_height) this.y = window_height;
    }


    draw(context) {
        context.save();
        context.globalAlpha = this.opacity;

        if (this.hovered) {
            context.shadowBlur = 15;
            context.shadowColor = "white";
        }

        if (this.glow > 0) {
            context.shadowBlur = Math.max(context.shadowBlur, this.glow);
            context.shadowColor = "yellow";
        }

        context.drawImage(abejaImg, this.x, this.y, this.width, this.height);

        context.shadowBlur = 0;
        context.restore();
    }

    move() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.fading) {
            this.opacity -= 0.02;
            if (this.opacity <= 0) {
                this.opacity = 0;
            }
        }

        if (this.glow > 0) {
            this.glow -= 1;
        }
    }

    contains(mouseX, mouseY) {
        return (
            mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y &&
            mouseY < this.y + this.height
        );
    }

    isColliding(otherAbeja) {
        return (
            this.x < otherAbeja.x + otherAbeja.width &&
            this.x + this.width > otherAbeja.x &&
            this.y < otherAbeja.y + otherAbeja.height &&
            this.y + this.height > otherAbeja.y
        );
    }
}

const game = new Game();
game.generarAbejas();
game.siguienteNivel(); 
// Clase Rana
class Rana {
    constructor() {
        this.x = window_width / 2;
        this.y = window_height - 100;
        this.width = 100;
        this.height = 100;
        this.speed = 5.5;
        this.movingLeft = false;
        this.movingRight = false;

        // Variables para el salto
        this.isJumping = false;  // Indica si la rana está saltando
        this.jumpHeight = 1;      // Altura del salto
        this.jumpSpeed = 10;      // Velocidad del salto
        this.gravity = 0.5;       // Gravedad
        this.gravityAcceleration = 0.2; // Aceleración de la gravedad
    }

    draw(context) {
        context.drawImage(ranaImg, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === "left" && this.x > 0) this.x -= this.speed;
        if (direction === "right" && this.x + this.width < window_width) this.x += this.speed;
    }
    
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpHeight = this.jumpSpeed;
        }
    }
    
    update(plataformas) {
        if (this.isJumping) {
            this.y -= this.jumpHeight;  // Mueve la rana hacia arriba
            this.jumpHeight -= this.gravity;  // Reduce la altura del saltothis.y -= this.jumpHeight;  

            // Si la rana ha alcanzado la altura máxima o ha caído, comienza a bajar
            if (this.jumpHeight <= 0) {
                this.gravity += this.gravityAcceleration;  // Aumenta la gravedad
                this.isJumping = false;  // Deja de saltar
            }
        } else {
            // Si no está saltando, la rana cae por la gravedad
            let landedOnPlatform = false;
            
         
        // Comprobamos colisiones con plataformas
        for (let i = 0; i < plataformas.length; i++) {
            if (
                this.x + this.width > plataformas[i].x &&
                this.x < plataformas[i].x + plataformas[i].width &&
                this.y + this.height <= plataformas[i].y + 5 &&  // Detecta si está justo encima de la plataforma
                this.y + this.height + this.gravity >= plataformas[i].y
            ) {
                this.y = plataformas[i].y - this.height;  // Coloca la rana sobre la plataforma
                landedOnPlatform = true;
                break;
            }
        }

        // Si no está sobre una plataforma, sigue cayendo
        if (!landedOnPlatform) {
            this.y += this.gravity;  // Caída por gravedad
        } else {
            // Si la rana está en el suelo, la velocidad de caída es 0
            this.jumpHeight = 0;
        }

        // Si la rana llega al suelo o a una plataforma, no puede seguir cayendo más
        if (this.y + this.height > window_height - 100) {
            this.y = window_height - 100;
            this.jumpHeight = 0;  // Deja de saltar al llegar al suelo
            this.gravity = 0.5;    // Reinicia la gravedad
        }
    }
}

    eatMosca() {
        abejas.forEach((abeja, index) => {
            if (
                this.x < abeja.x + abeja.width &&
                this.x + this.width > abeja.x &&
                this.y < abeja.y + abeja.height &&
                this.y + this.height > abeja.y
            ) {
                abejas.splice(index, 1);
                totalDeleted++;
                updateStats();
            }
        });
    }
}
class Plataforma {
    constructor(y) {
        this.x = Math.random() * (window_width - 100);  // Posición inicial aleatoria
        this.y = y;  // Altura de la plataforma
        this.width = 100;  // Ancho de la plataforma
        this.height = 20;  // Altura de la plataforma
        this.speedX = 1.5;  // Velocidad de movimiento
        this.direction = 1;  // 1: derecha, -1: izquierda
    }

    move() {
        this.x += this.speedX * this.direction;

        // Si la plataforma llega al borde, cambia de dirección
        if (this.x <= 0 || this.x + this.width >= window_width) {
            this.direction *= -1;
        }
    }

    draw(context) {
        // Dibuja la imagen de la plataforma en lugar de un rectángulo
        context.drawImage(plataformaImg, this.x, this.y, this.width, this.height);
    }

    contains(mouseX, mouseY) {
        return (
            mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y &&
            mouseY < this.y + this.height
        );
    }
}

const plataformas = [];
const numberOfPlataformas = 5;  // Número de plataformas

function createPlataformas() {
    for (let i = 0; i < numberOfPlataformas; i++) {
        const y = Math.random() * (window_height - 100);  // Posición aleatoria de las plataformas
        plataformas.push(new Plataforma(y));
    }
}

createPlataformas();

const rana = new Rana();

const abejas = [];
const numberOfAbejas = 10;

function createAbejas() {
    for (let i = 0; i < numberOfAbejas; i++) {
        const x = Math.random() * (window_width - 40);
        const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        abejas.push(new Abeja(x, speed));
    }
}

createAbejas();


let moveLeft = false;
let moveRight = false;
// Listener para cuando se presiona una tecla
window.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A") {
        moveLeft = true;  // Empieza a mover a la izquierda
    } else if (event.key === "d" || event.key === "D") {
        moveRight = true;  // Empieza a mover a la derecha
    } else if (event.key === " " || event.key === "Spacebar") {
        rana.jump();  // Hace que la rana salte
    }
});

// Listener para cuando se suelta una tecla
window.addEventListener("keyup", (event) => {
    if (event.key === "a" || event.key === "A") {
        moveLeft = false;  // Detiene el movimiento hacia la izquierda
    } else if (event.key === "d" || event.key === "D") {
        moveRight = false;  // Detiene el movimiento hacia la derecha
    }
});

// Actualiza el movimiento de la rana en el ciclo de animación
function updateMovement() {
    if (moveLeft && rana.x > 0) {
        rana.move("left");  // Mueve la rana hacia la izquierda
    }
    if (moveRight && rana.x + rana.width < window_width) {
        rana.move("right");  // Mueve la rana hacia la derecha
    }
}
// Actualiza la tarjeta Bootstrap con los valores actuales
function updateStats() {
    let percentageDeleted = ((totalDeleted / totalCreated) * 100).toFixed(2);
    nivelElement.innerText = level;
    eliminadasElement.innerText = totalDeleted;
    porcentajeElement.innerText = percentageDeleted + "%";
}
canvas.addEventListener("click", (event) => {
    const { offsetX, offsetY } = event;
    
    abejas.forEach((abeja, index) => {
        if (abeja.contains(offsetX, offsetY) && !abeja.clicked) {
            abeja.clicked = true; // Marca la abeja como "clickeada"
            abeja.fading = true;  // Empieza el proceso de desaparición
            totalDeleted++;       // Incrementa el contador de abejas eliminadas
            clickSound.play();    // Reproduce el sonido
            abejas.splice(index, 1);  // Elimina la abeja del array
            updateStats();        // Actualiza las estadísticas
            levelUp();            // Verifica si sube de nivel
        }
    });
});
// Agregar el eventListener para el teclado
window.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Spacebar") { // Verifica si se presionó la barra de espacio
        rana.jump(); // Hace que la rana salte
    }
});
let lastDeleted = 0;  // Variable para rastrear el número de eliminaciones
// Sube de nivel cada 10 eliminaciones
function levelUp() {
    console.log(`Intentando subir de nivel: totalDeleted = ${totalDeleted}, lastDeleted = ${lastDeleted}`);

    if (totalDeleted >= (lastDeleted + 10)) {
        level++;
        lastDeleted = totalDeleted;  // Asegura que `lastDeleted` se actualiza bien
        console.log(`🆙 Nivel subido a: ${level}`);

        speedMultiplier += 0.01;
        abejas.forEach((abeja) => {
            abeja.speedY *= 1.2;
        });

        for (let i = 0; i < 3; i++) {
            const x = Math.random() * (window_width - 40);
            const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
            abejas.push(new Abeja(x, speed));
            totalCreated++;
        }

        updateStats();
    }
}
function eliminarAbeja(abeja) {
    let index = abejas.indexOf(abeja);
    if (index !== -1) {
        abejas.splice(index, 1);
        totalDeleted++;
        console.log(`Abeja eliminada. totalDeleted ahora es ${totalDeleted}`);
        levelUp();
    } else {
        console.warn("Intentando eliminar una abeja que no está en el array.");
        console.log(`Verificando levelUp: totalDeleted = ${totalDeleted}, lastDeleted = ${lastDeleted}`);

    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    
    // Dibujar el fondo antes de las abejas
    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
     // Actualizar el movimiento de la rana
    updateMovement();

    abejas.forEach((abeja, index) => {
        abeja.move();
        abeja.draw(ctx);
    });
    
    rana.update(plataformas);
    rana.move();
    rana.draw(ctx);
    rana.eatMosca();

    plataformas.forEach((plataforma) => {
        plataforma.move();  // Mueve la plataforma
        plataforma.draw(ctx);  // Dibuja la plataforma
    });

    abejas.forEach((abeja, index) => {
        abeja.move();

        // Detectar colisiones y aplicar brillo
        for (let i = 0; i < abejas.length; i++) {
            for (let j = i + 1; j < abejas.length; j++) {
                if (abejas[i].isColliding(abejas[j])) {
                    abejas[i].glow = 20;
                    abejas[j].glow = 20;
                }
            }
        }

        if (abeja.y + abeja.height < 0 || abeja.opacity <= 0) {
            abejas.splice(index, 1);
            updateStats();
        }
    });

    while (abejas.length < numberOfAbejas) {
        const x = Math.random() * (window_width - 40);
        const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        abejas.push(new Abeja(x, speed));
        totalCreated++;
    }

    requestAnimationFrame(animate);
}

// Esperar a que el fondo cargue antes de iniciar la animación
fondo.onload = function () {
    abejaImg.onload = function() {
        ranaImg.onload = function() {
            animate();
        }
    }
};