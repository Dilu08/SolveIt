// play.js

let level = 1;
let score = 0;
let timerDuration = 30; // Matches your HTML
let timerInterval;
let questionNumber = 1;
let attemptsLeft = 10; // Matches your HTML
const apiEndpoint = "api/banana_api.php";
const saveScoreEndpoint = "save-score.php";
let timeLeft;
let timerPaused = false;

document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
});

function initializeGame() {
    loadLevel(level);
    document.getElementById("submit-answer").addEventListener("click", () => {
        const userAnswer = document.getElementById("answer-input").value.trim();
        if (validateAnswer(userAnswer)) {
            checkAnswer(userAnswer);
        }
    });
    fetchQuestion();
}

function validateAnswer(answer) {
    if (!answer || answer.length < 1) {
        alert("Hey champ noooo!! Answer cannot be empty!");
        return false;
    }
    if (answer.length > 50) {
        alert("Answer is too long champ ! Please enter a shorter answer.");
        return false;
    }
    return true;
}

function loadLevel(currentLevel) {
    const levelNames = [...Array(10)].map((_, index) => (index + 1).toString());
    const currentLevelName = levelNames[currentLevel - 1] || "10";

    document.getElementById("level-indicator").innerText = `Level: ${currentLevelName}`;
    document.getElementById("current-score").innerText = score;
    document.getElementById("answer-input").value = "";

    // Dynamically calculate attempts based on level
    if (currentLevel <= 2) {
        attemptsLeft = 5;
    } else if (currentLevel <= 4) {
        attemptsLeft = 4;
    } else if (currentLevel <= 6) {
        attemptsLeft = 3;
    } else if (currentLevel <= 8) {
        attemptsLeft = 2;
    } else {
        attemptsLeft = 1;
    }

    document.getElementById("attempts-indicator").innerText = `Attempts: ${attemptsLeft}`;
    timerDuration = Math.max(10, 90 - (currentLevel - 1) * 10);
    startTimer();
    fetchQuestion();
}
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = timerDuration;

    document.getElementById("time-remaining").innerText = `${timeLeft} seconds`;

    timerInterval = setInterval(() => {
        if (!timerPaused) {
            timeLeft--;
            document.getElementById("time-remaining").innerText = `${timeLeft} seconds`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("Ohhh Time's up champ! You failed this level.");
                saveScore(function() {
                    window.location.href = "start.html";
                });
            }
        }
    }, 1000);
}

function fetchQuestion() {
    fetch(apiEndpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch the question. HTTP status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.question && data.solution !== undefined) {
                displayQuestion(data);
                document.getElementById("submit-answer").dataset.correctAnswer = data.solution;
            } else {
                throw new Error("Invalid question data received.");
            }
        })
        .catch((error) => {
            console.error("Error fetching question:", error);
            document.getElementById("question-grid").innerText = "Error loading question. Please try again later.";
        });
}

function checkAnswer(userAnswer) {
    const correctAnswer = document.getElementById("submit-answer").dataset.correctAnswer;

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        score += level * 20;
        document.getElementById("current-score").innerText = score;
        questionNumber++;

        if (questionNumber > 0) {
            level++;
            if (level > 10) {
                alert("Hey champ you're completed all levels! Congratulations!");
                saveScore(function() {
                    window.location.href = "start.html";
                });
            } else {
                loadLevel(level);
            }
        } else {
            fetchQuestion();
            document.getElementById("question-indicator").innerText = `Question: ${questionNumber}/3`;
            document.getElementById("answer-input").value = "";
        }
    } else {
        attemptsLeft--;
        document.getElementById("attempts-indicator").innerText = `Attempts: ${attemptsLeft}`;
        if (attemptsLeft <= 0) {
            showTriviaChoice(); // Show trivia choice when attempts run out
        } else {
            alert("Champ Incorrect answer. Try again!");
        }
    }
}

function displayQuestion(questionData) {
    const questionGrid = document.getElementById("question-grid");

    if (questionData.question.startsWith("http")) {
        questionGrid.innerHTML = `<img src="${questionData.question}" alt="Question Image" style="max-width: 100%; height: auto; border-radius: 5px;">`;
    } else {
        questionGrid.innerText = questionData.question;
    }
}

function saveScore(callback) {
    console.log("Saving score:", score, level, timeLeft);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "save-score.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log("Score saved successfully:", xhr.responseText);
            if (callback) {
                callback();
            }
        } else {
            console.error("Error saving score:", xhr.status, xhr.statusText);
            if (callback) {
                callback();
            }
        }
    };
    xhr.onerror = function() {
        console.error("Network error occurred while saving score.");
        if (callback) {
            callback();
        }
    };
    xhr.send(`score=${score}`);
}

function confirmLeave() {
    const userConfirmed = confirm("Really champ!! Are you sure you want to leave?");
    if (userConfirmed) {
        saveScore(function() {
            window.location.href = "start.html";
        });
    }
}

function showTriviaChoice() {
    const userChoice = confirm("Want to earn more attempts? Answer a trivia question!");
    if (userChoice) {
        showTrivia();
    } else {
        saveScore(function() {
            window.location.href = "start.html";
        });
    }
}

function showTrivia() {
    timerPaused = true; // Pause the timer
    const triviaModal = document.getElementById('trivia-modal');
    triviaModal.style.display = "flex";

    fetch('https://opentdb.com/api.php?amount=1&type=multiple')
        .then(response => response.json())
        .then(data => {
            const trivia = data.results[0];
            const question = decodeHtml(trivia.question);
            const answers = trivia.incorrect_answers.map(decodeHtml);
            answers.push(decodeHtml(trivia.correct_answer));
            answers.sort(() => Math.random() - 0.5);

            document.getElementById('trivia-question').textContent = question;
            const answersList = document.getElementById('trivia-answers');
            answersList.innerHTML = ''; // Clear previous answers
            answers.forEach(answer => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = answer;
                button.onclick = () => checkTriviaAnswer(answer, decodeHtml(trivia.correct_answer));
                li.appendChild(button);
                answersList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching trivia:', error));
}

function checkTriviaAnswer(userAnswer, correctAnswer) {
    const triviaModal = document.getElementById('trivia-modal');
    triviaModal.style.display = "none";

    if (userAnswer === correctAnswer) {
        alert("Correct! Extra Attempt!");
        attemptsLeft++;
        document.getElementById("attempts-indicator").innerText = `Attempts: ${attemptsLeft}`;
    } else {
        alert(`Incorrect. The correct answer was: ${correctAnswer}. Game Over.`);
        saveScore(function() {
            window.location.href = "start.html";
        });
    }

    timerPaused = false; // Resume the timer
}

function decodeHtml(html) {
    const temp = document.createElement('textarea');
    temp.innerHTML = html;
    return temp.value;
}