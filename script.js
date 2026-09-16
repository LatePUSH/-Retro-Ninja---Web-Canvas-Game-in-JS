// Sélection des éléments du DOM
const playButton = document.getElementById('startGameBtn');
const startGameContainer = document.getElementById('startGame');
const inGameContainer = document.getElementById('inGameContainer');

// Importation des sons
const gameStartSound = new Audio('./ressourceson/ninja.wav')
const gameEndSound = new Audio('./ressourceson/gameover.wav')
const bombTouchSound = new Audio('./ressourceson/bombesound.wav')
const timeBeepSound = new Audio('./ressourceson/mk.wav')
const buttonPushSound = new Audio('./ressourceson/quitter.wav')
const MenuSound = new Audio('./ressourceson/menu.wav');


let isSwordSoundPlaying = false;
// Effet sonore d'épée
const playSwordSound = () => {
    // Génération d'un audio aléatoire en fonction du nom du son source
    let swordAudio = new Audio(`./ressourceson/couteauson/Sword-swipe-${Math.floor(Math.random() * 6) + 1}.wav`);
    swordAudio.play();
    // Réglage sur true pour éviter de jouer plus d'audio avant la fin de celui-ci
    isSwordSoundPlaying = true;
    swordAudio.addEventListener('ended', () => {
        isSwordSoundPlaying = false;
    })
}

// Utilisation du changement de visibilité pour empêcher le rendu des balles lorsque l'onglet est inactif
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        isGamePause = false;
    } else {
        isGamePause = true;
    }
})

// Bouton de démarrage sur l'écran d'accueil
playButton.addEventListener('click', () => {
    startGameContainer.style.display = 'none';
    inGameContainer.style.display = 'flex';
    alertTimer();
    // Réinitialiser le score à 0
    score = 0;
    updateScore(0);
    gameStartSound.play();
    isGameStarted = true;
    isGameEnd = false;

    // Utilisation de setTimeout pour commencer le rendu des balles après la fin de la fonction de minuterie d'alerte
    setTimeout(() => {
        animate();
        startRenderingBallsInterval();
        startGameTimer();
    }, 4000)
})

// Fonction de compte à rebours
const alertTimer = () => {
    const countDownContainer = document.getElementById('countDownContainer');
    let currentSecond = 3;
    let timerInterval = setInterval(() => {
        countDownContainer.innerHTML = ``;
        countDownContainer.innerHTML = `<h1>${currentSecond}</h1>`;
        currentSecond -= 1;
        if (currentSecond < 0) {
            clearInterval(timerInterval);
            countDownContainer.innerHTML = ``;
            isGamePause = false;
            return
        }
        timeBeepSound.play()
    }, 1000)
}

// Fonction du minuteur de jeu
const startGameTimer = () => {
    if (!isGameStarted) {
        return
    }
    // Nombre de minutes pendant lesquelles le jeu doit fonctionner.
    let minutesInGame = 1;
    let totalTime = minutesInGame * 60;

    // Interval pour mettre à jour le minuteur
    let interval = setInterval(() => {
        let min = Math.floor(totalTime / 60);
        let sec = totalTime % 60;

        document.getElementById('gameMinuteAndSecond').innerHTML = `${min < 10 ? '0' + min : min} : ${sec < 10 ? '0' + sec : sec}`

        totalTime--;
        // Quand le temps est écoulé
        if (totalTime < 0) {
            clearInterval(interval);
            document.getElementById('gameMinuteAndSecond').innerHTML = `00 : 00`;
            endGameContainer.style.display = 'flex';
            document.getElementById('endGameScore').innerHTML = score;
            isGameEnd = true;
            isGameStarted = false;
            gameEndSound.play();

            // Effacement du canvas
            ballArray = [];
            ballParticlesArray = [];
            enemyBombArray = [];
        }
    }, 1000)
}

let score = 0;
// Tentative de récupération du meilleur score depuis le stockage local, sinon utilisation de 0
let highScore = localStorage.getItem('highScore') || 0;
document.getElementById('highScore').innerHTML = highScore;
document.getElementById('homeHighScore').innerHTML = highScore;

// Fonction pour mettre à jour le score
const updateScore = (noOfScore) => {
    // Si noOfScore est négatif
    if (noOfScore + score < 0) {
        score = 0;
        return
    }
    score = score + noOfScore;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        document.getElementById('highScore').innerHTML = score;
        document.getElementById('homeHighScore').innerHTML = score;
    }
    document.getElementById('score').innerHTML = score;
}

updateScore(0);

// Logique principale pour le canvas

const canvas = document.getElementById('canvas');

const context = canvas.getContext('2d');

// Définir le canvas en plein écran
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Tableaux de tous les éléments
let ballArray = [];
let ballParticlesArray = [];
let enemyBombArray = [];

// Classe de la balle
function Ball() {
    this.x = Math.floor(Math.random() * window.innerWidth);
    this.y = Math.floor(window.innerHeight);
    this.size = Math.floor((Math.random() * 10) + 35);
    
    const fruitImages = ['./ressourcesimages/banane.png', './ressourcesimages/pomme.png', './ressourcesimages/fraise.png'];
    this.image = new Image();
    this.image.src = fruitImages[Math.floor(Math.random() * fruitImages.length)];

    this.isSliced = false; // Nouvelle propriété pour suivre si la balle est tranchée

    this.speedY = 10;
    this.speedX = Math.round((Math.random() - 0.5) * 4);

    this.update = () => {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.speedY -= .1;
    }

    this.draw = () => {
        if (!this.isSliced) {
            context.drawImage(this.image, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else {
            context.drawImage(this.image, this.x - this.size, this.y - this.size, this.size * 2, this.size);
            context.drawImage(this.image, this.x - this.size, this.y, this.size * 2, this.size);
        }
    }
}

// Classe des particules de balle
function BallParticles(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.floor(Math.random() * 3 + 8);
    this.color = color;

    this.speedY = Math.random() * 2 - 2;
    this.speedX = Math.round((Math.random() - 0.5) * 10);

    // Mise à jour de la particule de balle
    this.update = () => {
        // Réduire la taille si this.size est supérieure à .2
        if (this.size > .2) {
            this.size -= .1;
        }
        this.y += this.speedY;
        this.x += this.speedX;
    }

    // Rendu ou dessin de la particule de balle sur le canvas
    this.draw = () => {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
    }
}


// Classe de la bombe ennemie
function EnemyBomb() {
    this.x = Math.floor(Math.random() * window.innerWidth);
    this.y = Math.floor(window.innerHeight);
    this.size = Math.floor((Math.random() * 10) + 40);
    this.image = new Image();
    this.image.src = './ressourcesimages/bombe.png'; 
    this.speedY = 10;
    this.speedX = Math.round((Math.random() - 0.5) * 4);

    // Mise à jour de la position de la bombe
    this.update = () => {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.speedY -= .1;
    }

    this.draw = () => {
        context.drawImage(this.image, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
}


let strikeCount = 1;
// Variable pour stocker quand la dernière balle a été tranchée
let lastBallSlice;

function renderBalls() {
    for (let i = 0; i < ballArray.length; i++) {
        ballArray[i].draw();
        ballArray[i].update();

        let distanceBetweenMouseAndBall = Math.hypot(mouseX - ballArray[i].x, mouseY - ballArray[i].y)

        if (distanceBetweenMouseAndBall - ballArray[i].size < 1) {
            for (let index = 0; index < 8; index++) {
                ballParticlesArray.push(new BallParticles(ballArray[i].x, ballArray[i].y, ballArray[i].color));
            }
            let timeNow = new Date().getTime()
            if (timeNow - lastBallSlice < 500) {
                strikeCount += 1;
                document.getElementById('strikeCountDiv').innerHTML = `<h1 class="strikeCount">${strikeCount}x</h1>`
            } else {
                strikeCount = 1;
                document.getElementById('strikeCountDiv').innerHTML = `<h1 class="strikeCount">${strikeCount}x</h1>`
            }
            lastBallSlice = new Date().getTime();

            ballArray[i].isSliced = true; 

            
            for (let index = 0; index < 8; index++) {
            const cyanColor = 'cyan'; // Couleur cyan particules
            ballParticlesArray.push(new BallParticles(ballArray[i].x, ballArray[i].y, cyanColor));
    }
            let scoreToUpdate = (ballArray[i].size < 40 ? 3 : 5) + strikeCount;
            updateScore(scoreToUpdate)
            ballArray.splice(i, 1);
            i--;
            return
        }
        if (ballArray[i].y > window.innerHeight + 10) {
            ballArray.splice(i, 1);
            i--;
        }
    }
}
function renderEnemyBombs() {
    for (let i = 0; i < enemyBombArray.length; i++) {
        enemyBombArray[i].draw();
        enemyBombArray[i].update();

        // Détection de la collision entre la position de la souris et la position de la bombe ennemie
        let distanceBetweenMouseAndEnemy = Math.hypot(mouseX - enemyBombArray[i].x, mouseY - enemyBombArray[i].y)

        // Si la souris est sur la bombe, c'est-à-dire collision
        if (distanceBetweenMouseAndEnemy - enemyBombArray[i].size < 1) {
            if (isGamePause) {
                return
            }
            // Effacement du canvas lorsque le joueur touche la bombe
            ballArray = [];
            ballParticlesArray = [];
            isGamePause = true;
            // Compte à rebours de 3 secondes
            alertTimer();
            updateScore(-7);
            bombTouchSound.play();
            // Supprimer la bombe du tableau
            enemyBombArray.splice(i, 1);
            i--;
            return
        }
        // Supprimer la bombe lorsqu'elle atteint le bas
        if (enemyBombArray[i].y > window.innerHeight + 10) {
            enemyBombArray.splice(i, 1);
            i--;
        }
    }
}

function renderBallParticles() {
    for (let i = 0; i < ballParticlesArray.length; i++) {
        ballParticlesArray[i].draw();
        ballParticlesArray[i].update();

        // Si la taille des particules de la balle est trop petite, les supprimer du tableau
        if (ballParticlesArray[i].size <= .2) {
            ballParticlesArray.splice(i, 1);
            i--;
        }
    }
}

let numberOfBallsToRender = [1, 2, 3, 4, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1];

// setInterval pour rendre les balles à intervalles de 1 seconde
const startRenderingBallsInterval = () => {
    let interval = setInterval(() => {
        // Effacer l'intervalle si le jeu est terminé.
        if (isGameEnd) {
            clearInterval(interval)
            return;
        }
        // Retourner si le jeu est en pause
        if (isGamePause) {
            return
        }
        const numberOfBalls = Math.round(Math.random() * numberOfBallsToRender.length);
        let indexOf = numberOfBallsToRender[numberOfBalls];

        // Si l'index généré est supérieur à la longueur du tableau numberOfBallsToRender, lancer une bombe
        if (numberOfBalls >= Math.floor(numberOfBallsToRender.length / 2)) {
            enemyBombArray.push(new EnemyBomb())
        }

        // Nombre de balles à rendre sur le canvas en utilisant une boucle for
        for (let i = 0; i < indexOf; i++) {
            ballArray.push(new Ball())
        }

    }, 1000)
}

// Variables d'état du jeu
let isGameStarted = false;
let isGamePause = false;
let isGameEnd = false;

let animationId;

// Fonction d'animation pour rendre chaque...
function animate() {
    context.fillStyle = 'rgba(7, 21, 31)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    renderBalls();
    renderBallParticles();
    renderEnemyBombs();
    renderMouseLines();
    // Annuler l'animation lorsque le jeu est terminé.
    if (isGameEnd) {
        cancelAnimationFrame(animationId);
        return
    }
    animationId = requestAnimationFrame(animate);
}



let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let isMouseClicked = false;

let linesArray = [];

function renderMouseLines() {
    for (let i = 0; i < linesArray.length; i++) {
        context.strokeStyle = 'white';
        context.beginPath();
        
        context.moveTo(linesArray[i].x, linesArray[i].y);
        context.lineTo(linesArray[i].pMouseX, linesArray[i].pMouseY);
        context.stroke();
        context.lineWidth = 4;
        context.closePath();
    }
    // Si la longueur de ce tableau est supérieure à 4, supprimer le premier objet de ce tableau en utilisant shift();
    if (linesArray.length > 4) {
        if (!isSwordSoundPlaying) {
            playSwordSound();  
        }
        linesArray.shift();
        linesArray.shift();
    }
}

// Écouteur d'événements pour détecter quand le bouton gauche de la souris est cliqué
canvas.addEventListener('mousedown', (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseClicked = true;
})

// Lorsque la souris est en mouvement
canvas.addEventListener('mousemove', (e) => {
    if (isMouseClicked) {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        linesArray.push({x: mouseX, y: mouseY, pMouseX: prevMouseX, pMouseY: prevMouseY})
    }
})

// Lorsque le bouton de la souris est relâché
canvas.addEventListener('mouseup', () => {
    mouseX = 0;
    mouseY = 0;
    linesArray = [];
    isMouseClicked = false;
})

// Lorsque la souris sort de l'onglet ou de la fenêtre
canvas.addEventListener('mouseout', () => {
    mouseX = 0;
    linesArray = [];
    mouseY = 0;
    isMouseClicked = false;
})

// Fonction et imports pour retourner à la page d'accueil lorsque le jeu est terminé.
const returnHomeButton = document.getElementById('returnHome');
const endGameContainer = document.getElementById('gameEndDiv');

returnHomeButton.addEventListener('click', () => {
    if (!isGameEnd) {
        return
    }
    buttonPushSound.play();
    endGameContainer.style.display = 'none';
    startGameContainer.style.display = 'flex';
    inGameContainer.style.display = 'none';
})
