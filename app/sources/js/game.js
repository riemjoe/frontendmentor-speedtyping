/**
 * Speedwriting Game Logic
 * Webdesign Riemer
 */

// Konfiguration und State
const DATA_URL = './app/resources/easy/data.json';
let gameData = null;
let currentText = "";
let timer = null;
let timeLeft = 60;
let timeElapsed = 0; 
let isPlaying = false;
let charIndex = 0;
let mistakes = 0;
let startTime = null;

// DOM Elemente
const labelWpm = document.getElementById('label_current_wpm');
const labelAccuracy = document.getElementById('label_current_accuracy');
const labelTime = document.getElementById('label_current_time');
const labelPersonalBest = document.getElementById('label_personal_record');
const labelWinningScreen = document.getElementById('label_winning_screen');
const typingPreview = document.querySelector('.typing-preview');
const startingScreen = document.getElementById('starting_screen');
const winningScreen = document.querySelector('.winning_screen');
const controlsSection = document.getElementById('controlls_section');
const toolbar = document.querySelector('.toolbar');

// Winning Screen Stats
const finalWpmValue = document.getElementById('final_wpm');
const finalAccuracyValue = document.getElementById('final_accuracy');
const finalCorrect = document.getElementById('final_characters_correct');
const finalWrong = document.getElementById('final_characters_wrong');

// Buttons & Selects
const btnStart = document.getElementById('button_start_test');
const btnRestart = document.getElementById('button_restart');
const btnGoAgain = document.getElementById('button_go_again');
const btnGenerateCertificate = document.getElementById('button_generate_certificate');

const difficultyButtons = document.querySelectorAll('button[name="option_difficulty"]');
const difficultySelect = document.getElementById('option_difficulty');

const modeButtons = document.querySelectorAll('button[name="option_mode"]');
const modeSelect = document.getElementById('option_mode');

async function init() {
    winningScreen.classList.add('hidden');
    try {
        const response = await fetch(DATA_URL);
        gameData = await response.json();
        
        btnStart.addEventListener('click', startGame);
        btnRestart.addEventListener('click', resetGame);
        btnGoAgain.addEventListener('click', resetGame);
        
        difficultyButtons.forEach(btn => btn.addEventListener('click', changeDifficulty));
        difficultySelect.addEventListener('change', changeDifficulty);

        modeButtons.forEach(btn => btn.addEventListener('click', changeMode));
        modeSelect.addEventListener('change', changeMode);

        const pb = localStorage.getItem('speedwriting_pb') || 0;
        labelPersonalBest.innerText = `${pb} WPM`;
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
    }
}

function syncSettingsUI(name, value) {
    if (name === "option_difficulty") {
        difficultyButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.difficulty === value);
        });
        difficultySelect.value = value;
    } else if (name === "option_mode") {
        modeButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.mode === value);
        });
        modeSelect.value = value;
    }
}

function changeDifficulty(e) {
    const value = e.target.value || e.target.dataset.difficulty;
    syncSettingsUI("option_difficulty", value);
    if (!isPlaying) resetGame();
}

function changeMode(e) {
    const value = e.target.value || e.target.dataset.mode;
    syncSettingsUI("option_mode", value);
    if (!isPlaying) resetGame();
}

function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    charIndex = 0;
    mistakes = 0;
    timeLeft = 60;
    timeElapsed = 0;
    startTime = null;

    const activeDiff = difficultySelect.value;
    const texts = gameData[activeDiff];
    currentText = texts[Math.floor(Math.random() * texts.length)].text;

    startingScreen.classList.add('hidden');
    winningScreen.classList.add('hidden');
    typingPreview.classList.remove('hidden');
    toolbar.classList.remove('hidden');
    controlsSection.classList.remove('hidden');
    
    renderText();
    window.addEventListener('keydown', handleTyping);
    startTimer();
}

function renderText() {
    typingPreview.innerHTML = '';
    currentText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        if (char === ' ') span.classList.add('empty-space');
        span.textContent = char; 
        if (index === 0) span.classList.add('current');
        typingPreview.appendChild(span);
    });
}

function handleTyping(e) {
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Tab' || e.key === 'CapsLock') return;

    const characters = typingPreview.querySelectorAll('span');
    
    if (charIndex < characters.length) {
        if (charIndex === 0 && !startTime) startTime = new Date();

        const expectedChar = characters[charIndex].textContent;
        const typedChar = e.key;

        if (typedChar === expectedChar) {
            characters[charIndex].classList.add('correct');
        } else {
            characters[charIndex].classList.add('incorrect');
            mistakes++;
        }

        characters[charIndex].classList.remove('current');
        charIndex++;

        if (charIndex < characters.length) {
            characters[charIndex].classList.add('current');
        } else {
            endGame();
        }
        calculateStats();
    }
}

function calculateStats() {
    const activeMode = modeSelect.value;
    
    let timeInMinutes;
    if (activeMode === 'time') {
        timeInMinutes = (60 - timeLeft) / 60;
    } else {
        timeInMinutes = timeElapsed / 60;
    }

    const wpm = Math.round(((charIndex - mistakes) / 5) / (timeInMinutes || 0.01));
    const accuracy = charIndex > 0 ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 100;

    labelWpm.innerText = wpm > 0 ? wpm : 0;
    labelAccuracy.innerText = `${accuracy}%`;
}

function startTimer() {
    const activeMode = modeSelect.value;
    labelTime.innerText = activeMode === 'time' ? "0:60" : "0:00";

    timer = setInterval(() => {
        if (activeMode === 'time') {
            if (timeLeft > 0) {
                timeLeft--;
                labelTime.innerText = `0:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
                calculateStats();
            } else {
                endGame();
            }
        } else {
            timeElapsed++;
            let mins = Math.floor(timeElapsed / 60);
            let secs = timeElapsed % 60;
            labelTime.innerText = `${mins}:${secs < 10 ? '0' + secs : secs}`;
            calculateStats();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timer);
    isPlaying = false;
    window.removeEventListener('keydown', handleTyping);
    
    typingPreview.classList.add('hidden');
    controlsSection.classList.add('hidden');
    toolbar.classList.add('hidden');
    winningScreen.classList.remove('hidden');

    finalWpmValue.innerText = labelWpm.innerText;
    finalAccuracyValue.innerText = labelAccuracy.innerText;
    finalCorrect.innerText = charIndex - mistakes;
    finalWrong.innerText = mistakes;

    const currentPb = parseInt(localStorage.getItem('speedwriting_pb') || 0);
    const score = parseInt(labelWpm.innerText);
    if (score > currentPb) {
        localStorage.setItem('speedwriting_pb', score);
        labelPersonalBest.innerText = `${score} WPM`;
        labelWinningScreen.innerText = "New Personal Best! Amazing!";
    } else {
        labelWinningScreen.innerText = "Solid run! Keep pushing to beat your high score.";
    }

    // Total characters available
    let totalChars = currentText.length;
    let typedChars = charIndex;
    let correctChars = typedChars - mistakes;

    if ((totalChars / 1.5) < correctChars)
    {
        btnGenerateCertificate.classList.remove('hidden');
        labelWinningScreen.innerText = "Solid run! Keep pushing to beat your high score. You qualified for a certificate!";
    }
    else
    {
        btnGenerateCertificate.classList.add('hidden');
        labelWinningScreen.innerText = "Solid run! Keep pushing to beat your high score. Practice more to qualify for a certificate.";
    }
    
    btnGenerateCertificate.onclick = function() {
        const name = prompt("Please enter your name for the certificate:");
        if (name && name.trim() !== "") {
            const difficulty = difficultySelect.value;
            const wpm = labelWpm.innerText;
            const accuracy = labelAccuracy.innerText.replace('%', '');
            redirectToCertificate(name.trim(), difficulty, wpm, accuracy, charIndex - mistakes, timeElapsed);
            btnGenerateCertificate.classList.add('hidden');
        }
    };
}

function resetGame() {
    clearInterval(timer);
    isPlaying = false;
    charIndex = 0;
    mistakes = 0;
    timeLeft = 60;
    timeElapsed = 0;
    startTime = null;
    
    labelWpm.innerText = "0";
    labelAccuracy.innerText = "0%";
    labelTime.innerText = "0:00";
    
    winningScreen.classList.add('hidden');
    typingPreview.classList.remove('hidden');
    typingPreview.innerHTML = '';
    typingPreview.appendChild(startingScreen);
    startingScreen.classList.remove('hidden');
    controlsSection.classList.add('hidden');
    toolbar.classList.remove('hidden');
    
    window.removeEventListener('keydown', handleTyping);
}

init();