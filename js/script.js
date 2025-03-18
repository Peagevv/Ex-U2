document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el botón de inicio
    document.getElementById('startGameBtn').addEventListener('click', function () {
        console.log('Juego iniciado');
        
        // Ocultar el botón de inicio
        document.getElementById('startGameBtn').style.display = 'none';

        // Mostrar el botón de reinicio
        document.getElementById('restartGameBtn').style.display = 'inline-block';

        // Inicializar el juego
        initializeGame();
    });

    // Inicializar el botón de reinicio
    document.getElementById('restartGameBtn').addEventListener('click', function () {
        console.log('Juego reiniciado');
        resetGame(); // Llamada a la función que reinicia el juego

        // Ocultar el botón de reinicio
        document.getElementById('restartGameBtn').style.display = 'none';

        // Mostrar el botón de inicio nuevamente
        document.getElementById('startGameBtn').style.display = 'inline-block';
    });
});


function initializeGame() {
    // Inicializar las plataformas
    generatePlatforms();

    // Inicializar enemigos
    startEnemySpawn();

    // Empezar el bucle del juego
    gameLoop();
}
// Configuración del canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const keys = {}; // Almacena las teclas presionadas
let level = 1;
let enemiesDefeated = 0;
const maxLevel = 9;
const enemies = [];
const platforms = [];

// Cargar imágenes asegurando que están listas antes de dibujar
const platformImg = new Image();
platformImg.src = "plat.png";

const lilyImage = new Image();
lilyImage.src = "lily.png";

const flowerImage = new Image();
flowerImage.src = "flor.png";

const flyImage = new Image();
flyImage.src = "mosca.png";

const backgroundImage = new Image();
backgroundImage.src = "b.jpeg";

// Clase para las plataformas
// Clase para las plataformas
class Platform {
    constructor(x, y, width, speedX = 0, leftLimit = 0, rightLimit = canvas.width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = width / (platformImg.width / platformImg.height); // Mantiene la proporción
        this.speedX = speedX; // Velocidad en el eje X (horizontal)
        this.leftLimit = leftLimit; // Límite izquierdo de la plataforma
        this.rightLimit = rightLimit; // Límite derecho de la plataforma
    }

    draw() {
        if (platformImg.complete) {  // Asegurarse de que la imagen esté cargada
            let scaleX = this.width / platformImg.width;
            let scaleY = this.height / platformImg.height;

            // Dibujar la imagen de la plataforma escalada
            ctx.drawImage(platformImg, this.x, this.y, platformImg.width * scaleX, platformImg.height * scaleY);
        } else {
            console.log("La imagen de la plataforma no está completamente cargada.");
        }
    }

    update() {
        this.x += this.speedX;

        // Verificar si la plataforma ha llegado al límite izquierdo o derecho
        if (this.x <= this.leftLimit || this.x >= this.rightLimit - this.width) {
            this.speedX = -this.speedX; // Invertir la dirección cuando llegue a los límites
        }
    }
}

// Crear plataformas cuando la imagen de plataforma esté cargada
platformImg.onload = function () {
    platforms.push(new Platform(890, 1650, 50, 1, 1)); // Movimiento horizontal hacia la derecha
    platforms.push(new Platform(1500, 900, 20, 2, -2)); // Movimiento horizontal hacia la izquierda
    platforms.push(new Platform(100, 1750, 18, 0, 0)); // Movimiento vertical hacia arriba
    platforms.push(new Platform(1100, 1850, 18, -5, 0)); // Movimiento en ambas direcciones
    platforms.push(new Platform(1650, 1300, 20, -3, 0)); // Movimiento diagonal
    platforms.push(new Platform(400, 500, 20, 0, 0)); // Estática
    platforms.push(new Platform(190, 1500, 10, 0, 0));
    platforms.push(new Platform(190, 700, 20, 8, 0));
    platforms.push(new Platform(190, 350, 18, -6, 0)); // Movimiento en ambas direcciones
};

// Clase para Lily (la rana)
class Lily {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;
        this.size = 30;  // Tamaño de la rana
        this.speed = 5;
        this.isJumping = false;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpForce = 10;
        this.jumps = 0;  // Contador de saltos
    }

    draw() {
        if (lilyImage.complete) {
            ctx.drawImage(lilyImage, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        }
    }

    move(direction) {
        if (direction === "left" && this.x > this.size) this.x -= this.speed;
        if (direction === "right" && this.x < canvas.width - this.size) this.x += this.speed;
    }

    jump() {
        // Permitir un salto si no está saltando o si ha realizado un salto antes
        if (this.jumps < 2) {
            this.isJumping = true;
            this.velocityY = -this.jumpForce;
            this.jumps++; // Aumentar el contador de saltos
        }
    }

    updateJump() {
        this.y += this.velocityY;
        this.velocityY += this.gravity;

        for (let platform of platforms) {
            if (
                this.x + this.size > platform.x &&
                this.x - this.size < platform.x + platform.width &&
                this.y + this.size > platform.y &&
                this.y + this.size < platform.y + 10 &&
                this.velocityY > 0
            ) {
                this.y = platform.y - this.size + 1;
                this.isJumping = false;
                this.velocityY = 0;
                this.jumps = 0;  // Resetear los saltos cuando toca una plataforma
            }
        }

        if (this.y >= canvas.height - this.size) {
            this.y = canvas.height - this.size;
            this.isJumping = false;
            this.velocityY = 0;
            this.jumps = 0;  // Resetear los saltos cuando toca el suelo
        }
    }

    eat(enemyIndex) {
        enemies.splice(enemyIndex, 1);
        enemiesDefeated++;

        if (enemiesDefeated % 5 === 0 && level < maxLevel) {
            level++;
            console.log(`¡Nivel ${level}! Enemigos más rápidos.`);
            enemies.forEach((enemy) => {
                enemy.speedX += 0.5;
                enemy.speedY += 0.5;
            });
        }
    }
}


// Clase para los enemigos
class Enemy {
    constructor(type) {
        this.type = type;
        this.size = 20;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        this.speed = 1 + level * 0.5; // Velocidad base + velocidad adicional por nivel
    }

    draw() {
        if (this.type === "flower" && flowerImage.complete) {
            ctx.drawImage(flowerImage, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else if (this.type === "fly" && flyImage.complete) {
            ctx.drawImage(flyImage, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        }
    }

    update() {
        // Calcular la dirección hacia Lily (usamos la distancia entre el enemigo y Lily)
        let dx = lily.x - this.x; // Diferencia en el eje X
        let dy = lily.y - this.y; // Diferencia en el eje Y

        // Normalizar la distancia (hacer que el enemigo siempre se mueva a la misma velocidad)
        let distance = Math.sqrt(dx * dx + dy * dy); // Calcular la distancia total
        let directionX = dx / distance; // Dirección en el eje X
        let directionY = dy / distance; // Dirección en el eje Y

        // Actualizar la posición del enemigo para moverse hacia Lily
        this.x += directionX * this.speed;
        this.y += directionY * this.speed;

        // Asegurarse de que el enemigo se quede dentro de los límites del canvas
        if (this.x <= this.size || this.x >= canvas.width - this.size) this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
        if (this.y <= this.size || this.y >= canvas.height - this.size) this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));

        // Detectar colisiones con otros enemigos
        this.checkCollisionWithOthers();

        // Detectar colisión con Lily
        this.checkCollisionWithLily();
    }

    checkCollisionWithLily() {
        let dx = this.x - lily.x;
        let dy = this.y - lily.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + lily.size) {
            resetGame(); // Si el enemigo colisiona con Lily, reinicia el juego
        }
    }

    checkCollisionWithOthers() {
        for (let otherEnemy of enemies) {
            if (otherEnemy === this) continue;

            let dx = this.x - otherEnemy.x;
            let dy = this.y - otherEnemy.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size + otherEnemy.size) {
                let angle = Math.atan2(dy, dx);
                let overlap = (this.size + otherEnemy.size) - distance;

                // Resolver la colisión empujando los enemigos el uno al otro
                this.x += Math.cos(angle) * overlap;
                this.y += Math.sin(angle) * overlap;

                otherEnemy.x -= Math.cos(angle) * overlap;
                otherEnemy.y -= Math.sin(angle) * overlap;

                // Invertir la velocidad para que se alejen
                this.speed = -this.speed;
                otherEnemy.speed = -otherEnemy.speed;
            }
        }
    }
}

// Función para reiniciar el juego
// Función para reiniciar el juego
function resetGame() {
    // Restablecer las variables
    level = 1;
    enemiesDefeated = 0;
    enemies.length = 0; // Vaciar el array de enemigos
    platforms.length = 0; // Vaciar las plataformas

    // Restablecer la posición de Lily
    lily.x = canvas.width / 2;
    lily.y = canvas.height - 50;

    // Regenerar las plataformas y enemigos
    generatePlatforms();
    startEnemySpawn();

    // Reiniciar el fondo
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Mostrar la pantalla de inicio nuevamente
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("restartGameBtn").style.display = "none";

    console.log("Juego reiniciado");
}

function generatePlatforms() {
    // Asegúrate de que las plataformas se generen sin depender de un evento `onload`
    platforms.push(new Platform(50, 200, 50, 1, 0, canvas.width));  // Plataforma en una posición válida
    platforms.push(new Platform(250, 300, 50, -1, 0, canvas.width)); // Otra plataforma a la derecha
    // Ejemplo de una plataforma estática
    platforms.push(new Platform(100, 200, 50, 0, 0));  // Plataforma estática
 // Movimiento en ambas direcciones
}

// Función para iniciar el juego
function startGame() {
    // Ocultar la pantalla de inicio
    document.getElementById("startScreen").style.display = "none";  // Ocultar correctamente la pantalla de inicio

    // Mostrar el canvas de juego
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("restartGameBtn").style.display = "inline-block"; // Mostrar el botón de reiniciar

    // Iniciar el juego
    initializeGame();
}

function startEnemySpawn() {
    // Detener el intervalo anterior de enemigos antes de comenzar uno nuevo
    if (window.enemyInterval) {
        clearInterval(window.enemyInterval);
    }

    // Crear enemigos según el nivel
    window.enemyInterval = setInterval(() => {
        if (enemies.length < level * 5) {
            const type = Math.random() < 0.5 ? "flower" : "fly";
            enemies.push(new Enemy(type));
        }
    }, 1000);
}

// Inicializar y comenzar el juego
const lily = new Lily(); // Asegúrate de que esta línea esté después de la definición de la clase Lily
generatePlatforms();
startEnemySpawn();
gameLoop();

setInterval(() => {
    // Genera enemigos según el nivel (nivel * 5 enemigos por nivel)
    if (enemies.length < level * 5) {
        const type = Math.random() < 0.5 ? "flower" : "fly"; // Probabilidad de tipo de enemigo
        enemies.push(new Enemy(type));
    }
}, 1000);

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space") lily.jump();
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function updateMovement() {
    if (keys["a"]) lily.move("left");
    if (keys["d"]) lily.move("right");
}

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dist = Math.sqrt((enemy.x - mouseX) ** 2 + (enemy.y - mouseY) ** 2);

        if (dist < enemy.size) {
            lily.eat(i);
            break;
        }
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    updateMovement();
    lily.updateJump();
    lily.draw();

    // Actualizar y dibujar las plataformas
    platforms.forEach((platform) => {
        platform.update();
        platform.draw();
    });

    // Dibujar y actualizar los enemigos
    enemies.forEach((enemy) => {
        enemy.update();
        enemy.draw();
    });

    // Mostrar nivel y enemigos derrotados
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Nivel: ${level}`, 10, 30);
    ctx.fillText(`Enemigos derrotados: ${enemiesDefeated}`, 10, 60);

    requestAnimationFrame(gameLoop);  // Esto asegura que el loop de juego siga corriendo
}

gameLoop();
