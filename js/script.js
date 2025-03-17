const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const playerImg = new Image();
playerImg.src = "lily.png";

const redPredatorImg = new Image();
redPredatorImg.src = "flor.png";

const yellowPredatorImg = new Image();
yellowPredatorImg.src = "mosca.png";

const platformImg = new Image();
platformImg.src = "plat.png"; // Asegúrate de tener esta imagen en la misma carpeta o indicar la ruta correcta



// Protagonista
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    speed: 5,
    dy: 0,
    gravity: 0.5,
    jumpPower: -10,
    onGround: false,
    level: 1,  // Nivel del jugador
    yellowPredatorEaten: 0  // Contador de depredadores amarillos "comidos"
};

// Lista de depredadores
let predators = [];

// Lista de plataformas
let platforms = [
    { x: 100, y: 350, width: 150, height: 10 },
    { x: 300, y: 280, width: 100, height: 10 },
    { x: 500, y: 320, width: 120, height: 10 },
    { x: 650, y: 200, width: 120, height: 10 },
    { x: 400, y: 150, width: 100, height: 10 },
    { x: 200, y: 100, width: 120, height: 10 },
    { x: 700, y: 50, width: 100, height: 10 },
    { x: 150, y: 200, width: 100, height: 10 },
    { x: 50, y: 50, width: 100, height: 10 },
    { x: 30, y: 250, width: 100, height: 10 }
];

// Controles del jugador
let mousePos = { x: player.x, y: player.y }; // Posición del mouse
let isLeftMouseDown = false;  // Para detectar el clic izquierdo del mouse

// Detectar el movimiento del mouse
canvas.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX - canvas.offsetLeft;  // Posición horizontal del mouse
    mousePos.y = e.clientY - canvas.offsetTop;   // Posición vertical del mouse
});

// Detectar el botón izquierdo del mouse para atacar
canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {  // Botón izquierdo del mouse
        isLeftMouseDown = true;
        attack();  // Llamamos a la función de ataque
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (e.button === 0) {  // Botón izquierdo del mouse
        isLeftMouseDown = false;
    }
});
canvas.addEventListener("click", (e) => {
        const clickX = e.clientX - canvas.offsetLeft;
        const clickY = e.clientY - canvas.offsetTop;
    
        predators = predators.filter(p => {
            if (
                p.type === "yellow" &&
                clickX >= p.x && clickX <= p.x + p.width &&
                clickY >= p.y && clickY <= p.y + p.height
            ) {
                player.yellowPredatorEaten++; // Incrementar el contador
                if (player.yellowPredatorEaten >= 5 && player.level < 9) {
                    player.level++;
                    player.yellowPredatorEaten = 0;
                    alert("¡Subiste de nivel! Ahora estás en el nivel " + player.level);
                }
                return false; // Eliminar el depredador
            }
            return true; // Mantener el depredador
        });
    });

// Detectar teclas
let keys = {};
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

function movePlayer() {
     // Movimiento horizontal con "A" y "D"
     if (keys["KeyA"] && player.x > 0) { // Evitar que salga por el borde izquierdo
        player.x -= player.speed;
    }
    if (keys["KeyD"] && player.x + player.width < canvas.width) { // Evitar que salga por el borde derecho
        player.x += player.speed;
    }

    // Movimiento vertical con "W" (salto)
    if (keys["KeyW"] && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
    }

    player.dy += player.gravity;
    player.y += player.dy;

    // Limitar el movimiento en el borde inferior
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // Limitar el movimiento en el borde superior
    if (player.y < 0) {
        player.y = 0;
        player.dy = 0;
    }
}

// Generación aleatoria de depredadores
function spawnPredator() {
    let size = 30;
    let spawnY = Math.random() * (canvas.height - size); 
    let predatorType = Math.random() < 0.1 ? "red" : "yellow";

    predators.push({
        x: canvas.width,
        y: spawnY,
        width: size,
        height: size,
        speed: 2 + Math.random() * 2,
        type: predatorType
    });
}
setInterval(spawnPredator, 2000);

function movePredators() {
    predators.forEach((p, index) => {
        let dx = player.x - p.x;
        let dy = player.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (p.type === "yellow" && distance <= 5) {
            predators.splice(index, 1); // Eliminar el depredador del array
            player.yellowPredatorEaten++; // Incrementar el contador de depredadores amarillos
            console.log("Depredador amarillo eliminado automáticamente."); // Mensaje de depuración

            // Subir de nivel si el jugador ha eliminado 5 depredadores amarillos
            if (player.yellowPredatorEaten >= 5 && player.level < 9) {
                player.level++;
                player.yellowPredatorEaten = 0; // Reiniciar el contador
                alert("¡Subiste de nivel! Ahora estás en el nivel " + player.level);
            }
        }

         // Movimiento normal de los depredadores
         if (distance > 5) {
            p.x += (dx / distance) * p.speed;
            p.y += (dy / distance) * p.speed;
        }

        // Eliminar depredadores que salen de la pantalla por la izquierda
        if (p.x + p.width < 0) predators.splice(index, 1);
    });
}

// Función para atacar al depredador
function attack() {
    let closestPredator = null;
    let minDistance = 50;

    predators.forEach(p => {
        let distance = Math.sqrt(Math.pow(player.x - p.x, 2) + Math.pow(player.y - p.y, 2));
        if (distance < minDistance && p.type === "yellow") {
            minDistance = distance;
            closestPredator = p;
        }
    });

    if (closestPredator) {
        predators = predators.filter(p => p !== closestPredator);
        player.yellowPredatorEaten++;

        if (player.yellowPredatorEaten >= 5 && player.level < 9) {
            player.level++;
            player.yellowPredatorEaten = 0;
            alert("¡Subiste de nivel! Ahora estás en el nivel " + player.level);
        }
    }
}

function checkCollisions() {
    predators.forEach(p => {
        if (
            player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y
        ) {
            alert("¡Te atraparon!");
            document.location.reload();
        }
    });

    platforms.forEach(plat => {
        if (
            player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y + player.height > plat.y &&
            player.y + player.height - player.dy < plat.y + plat.height
        ) {
            player.y = plat.y - player.height;
            player.dy = 0;
            player.onGround = true;
        }
    });
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}


function drawPredators() {
    predators.forEach(p => {
        let img = p.type === "red" ? redPredatorImg : yellowPredatorImg;
        ctx.drawImage(img, p.x, p.y, p.width, p.height);
    });
}

function drawPlatforms() {
    platforms.forEach(plat => {
        ctx.drawImage(platformImg, plat.x, plat.y, plat.width, plat.height);
    });
}


// Función para mostrar el nivel del jugador
function drawLevel() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Nivel: " + player.level, 10, 30);
}

// Función para mostrar los depredadores amarillos eliminados
function drawYellowPredatorCounter() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Amarillos eliminados: " + player.yellowPredatorEaten, 10, 60);
}

// Actualización principal
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    movePredators();
    checkCollisions();
    drawPlatforms();
    drawPlayer();
    drawPredators();
    drawLevel();
    drawYellowPredatorCounter();
    requestAnimationFrame(update);
}

playerImg.onload = () => {
    redPredatorImg.onload = () => {
        yellowPredatorImg.onload = () => {
            update();
        };
    };
};
