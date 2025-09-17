const NUM_VERSES = 5;

const HOME_RUN_THRESHOLD = 2; // Number of chapters away for a "home run"
const TRIPLE_THRESHOLD = 4; // Number of chapters away for a "triple"
const DOUBLE_THRESHOLD = 8; // Number of chapters away for a "double"  
const SINGLE_THRESHOLD = 16; // Number of chapters away for a "single"

const ANIMATION_TIME_MS = 600; // Time in ms for runner animation
const TIMER_DURATIONS = {
  easy: 30,
  medium: 20,
  hard: 10
}; // Timer durations for different difficulties

const STANDARD_WORKS_FILE_NAMES = {
  bom: 'data/bom.json',
  ot: 'data/o_test.json',
};

const GAME_STATES = {
  MENU: 'menu',
  IN_GAME: 'in_game',
  GAME_OVER: 'game_over'
}

import { startTimer, stopTimer } from "./timer.js";
import { makeScriptureLink } from "./helper_functions.js";

let scriptures = null;
let currentSelection = null;
let allVerses = [];
let chapterIndexMap = {};
let currGuessDistance = Infinity;
let bases = [false, false, false, false]; // Tracks whether each base is occupied
let runners = []; // Tracks runner elements for animation
let score = 0;
let strikes = 0;
let round = 0;
let gameState = GAME_STATES.MENU;
let difficulty = 'easy'; // Default difficulty

const basePositions = {
  home:  { left: 50,  top: 90 },
  first: { left: 90, top: 50  },
  second:{ left: 50,  top: 10   },
  third: { left: 10,   top: 50  },
  back_home: { left: 50,  top: 90 } // Back to home for scoring
};

document.addEventListener('DOMContentLoaded', function () {
  // Set CSS variables for animation time
  document.documentElement.style.setProperty('--runner-animation-time', `${ANIMATION_TIME_MS}ms`);

  // Load verses from bom.json when the page loads
  positionBases();
  
  fetch(`${STANDARD_WORKS_FILE_NAMES.bom}`)
    .then(response => response.json())
    .then(data => {
      scriptures = data;
      buildVerseList(scriptures);
      buildChapterIndex(scriptures);
      populateGuessOptions();
    })
    .catch(err => console.error('Error loading verses:', err));

  document.getElementById('revealDistance').addEventListener('click', function () {
    const refEl = document.getElementById('distance');
    console.log('Distance reveal button clicked');
    // SIMPLE REVEAL: just show once
    if (!refEl.textContent && currGuessDistance != Infinity) {
      if(currGuessDistance === 0) refEl.textContent = `(Exactly Correct! Great Job!)`;
      refEl.textContent = `(Off by ${currGuessDistance} chapters)`;
    }
  });

  document.getElementById('revealReference').addEventListener('click', function () {
    const refEl = document.getElementById('reference');
    console.log('Reveal button clicked');
    // SIMPLE REVEAL: just show once
    if (!refEl.textContent && currentSelection) {
      let cs = currentSelection;
      const url = makeScriptureLink(cs.book, cs.chapter, cs.verses[0].verse, cs.verses[cs.verses.length - 1].verse);
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = cs.reference;
      refEl.appendChild(link);
    }
  });

  document.getElementById('newRound').addEventListener('click', function () {
    startRound();
  });

  document.getElementById('finalizeGuess').addEventListener('click', function () {
    submitGuess();
    stopTimer();
  });

});

document.querySelectorAll('.start-restart-button').forEach(button => {
  button.addEventListener('click', function () {
    if(button.id === 'start-button'){
      let difEl = document.getElementById('difficulty-value');
      difficulty = difEl.value;
      console.log(`Difficulty: ${difficulty}; Timer: ${TIMER_DURATIONS[difficulty]}s`);
    }
    startGame();
  });
});

document.getElementById('main-menu-button').addEventListener('click', function () {
  showScreen(GAME_STATES.MENU);
  stopTimer();
  // Reset game state
  strikes = 0;
  console.log("Returning to menu");
});

function populateGuessOptions() {
  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');

  // Fill book options
  const books = Object.keys(scriptures);
  books.forEach(book => {
    const option = document.createElement('option');
    option.value = book;
    option.textContent = book;
    bookSelect.appendChild(option);
    bookSelect.value = ''; // Default to no selection
  });

  // Update chapters when a book is selected
  bookSelect.addEventListener('change', () => {
    chapterSelect.innerHTML = ''; // Clear previous options
    const chapters = Object.keys(scriptures[bookSelect.value]);
    chapters.forEach(chapter => {
      const option = document.createElement('option');
      option.value = chapter;
      option.textContent = chapter;
      chapterSelect.appendChild(option);
    });

    // Enable submit button when both selections are made
    document.getElementById('finalizeGuess').disabled = !(bookSelect.value && chapterSelect.value);
  });
}

function getRandomVerses() {
  const maxStartIndex = allVerses.length - NUM_VERSES;
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));

  const selectedVerses = allVerses.slice(startIndex, startIndex + NUM_VERSES);

  const firstVerse = selectedVerses[0];
  const lastVerse = selectedVerses[selectedVerses.length - 1];
  if (firstVerse.book !== lastVerse.book || firstVerse.chapter !== lastVerse.chapter) {
    return getRandomVerses(); // Try again recursively if spanning multiple chapters or books
  }

  const reference = `${firstVerse.book} ${firstVerse.chapter}:${firstVerse.verse}-${lastVerse.verse}`;

  return {
    book: firstVerse.book,
    chapter: firstVerse.chapter,
    verses: selectedVerses,
    reference: reference
  }
}

function showVerses() {
  const container = document.getElementById('verses');
  const referenceElement = document.getElementById('reference');
  const revealButton = document.getElementById('revealReference');
  const distanceButton = document.getElementById('revealDistance');

  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const resultEl = document.getElementById('result');
  const distanceEl = document.getElementById('distance');

  bookSelect.value = '';
  chapterSelect.innerHTML = '';
  resultEl.textContent = '';
  distanceEl.textContent = '';

  container.innerHTML = ''; // Clear previous verses
  referenceElement.textContent = ''; // Clear previous reference
  revealButton.textContent = 'Reveal Reference';

  currGuessDistance = Infinity;

  currentSelection = getRandomVerses();

  // Three seperate paragraphs (one for each verse)
  currentSelection.verses.forEach(verse => {
    const p = document.createElement('p');
    p.textContent = verse.text;
    container.appendChild(p);
  });
}

function  buildChapterIndex(scriptures) {
  let index = 0;
  for (const book in scriptures) {
    for (const chapter in scriptures[book]) {
      const key = `${book} ${chapter}`;
      chapterIndexMap[key] = index++;
    }
  }
}

function buildVerseList(scriptures) {
  allVerses = [];
  for (const book in scriptures) {
    for (const chapter in scriptures[book]) {
      const verses = scriptures[book][chapter];
      verses.forEach(verse => {
        allVerses.push({
          book,
          chapter,
          verse: verse.verse,
          text: verse.text
        });
      });
    }
  }
}

function nextFrame(){
  return new Promise(resolve => requestAnimationFrame(resolve));
}

async function advanceRunners(numBases){
  if(numBases > 0){
    spawnRunner();
    await nextFrame();
    await nextFrame();
  } else {
    return;
  } // No runners to advance

  // Move runners forward one base the correct number of times
  for(let i = 0; i < numBases; ++i){
    console.log(`Advancing runners: ${i} bases moved`);

    runners.forEach(runner => {
      console.log(`Runner on ${runner.base} advancing`);

      let newBase = getNextBase(runner.base); 
      setRunnerPosition(runner.el, newBase);
      runner.base = newBase;
    });

    await waitForAllRunners(runners, ANIMATION_TIME_MS);

    runners = runners.filter(runner => {
      if(runner.base === "back_home"){
        ++score;
        runner.el.remove();
        return false; // Remove from runners array
      }
      return true; // Keep in runners array
    });
  }
  
  updateScoreboard();
}

function spawnRunner(){
  console.log("Spawning runner");

  const runner = document.createElement('div');
  runner.classList.add('runner');
  document.getElementById('diamond').appendChild(runner);

  setRunnerPosition(runner, "home");

  runners.push({el: runner, base: "home"});
  return runner;
}

function waitForAllRunners(runners, duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

function updateBases() {
    document.getElementById("first").classList.toggle("active", bases[1]);
    document.getElementById("second").classList.toggle("active", bases[2]);
    document.getElementById("third").classList.toggle("active", bases[3]);
}

function updateScoreboard() {
  document.getElementById("score").textContent = `${score}`;
  document.getElementById("round").textContent = `${round}`;
  document.getElementById("strikes").textContent = `Strikes: ${strikes}`;
}

function setRunnerPosition(runner, base){
  const coords = basePositions[base];
  runner.style.left = coords.left + -2.5 + "%";
  runner.style.top = coords.top + -2.5 + "%";
  //runner.style.transform = `translate(${coords.left}%, ${coords.top}%)`; 
}

function getNextBase(currentBase){
  const order = ["home", "first", "second", "third", "back_home"];
  const index = order.indexOf(currentBase);
  let nextIndex = (index + 1);
  return order[nextIndex];
}

function positionBases(){
  for (const [base, pos] of Object.entries(basePositions)) {
    if(base === "back_home") continue; // No element for this one
    const baseEl = document.getElementById(base);
    baseEl.style.position = "absolute";
    baseEl.style.left = `${pos.left}%`;
    baseEl.style.top = `${pos.top}%`;
    baseEl.style.transform = "translate(-50%, -50%) rotate(45deg)"; // Center and rotate
  }
}

function submitGuess() {
    document.getElementById('revealDistance').disabled = false;
    document.getElementById('revealReference').disabled = false;
    const bookGuess = document.getElementById('bookSelect').value;
    const chapterGuess = document.getElementById('chapterSelect').value;

    const resultEl = document.getElementById('result');

    if (!currentSelection) {
      resultEl.textContent = "No verses loaded yet.";
      return;
    }


    const guessKey = `${bookGuess} ${chapterGuess}`;
    const answerKey = `${currentSelection.book} ${currentSelection.chapter}`;

    const guessIndex = chapterIndexMap[guessKey];
    const answerIndex = chapterIndexMap[answerKey];

    const distance = Math.abs(guessIndex - answerIndex);
    currGuessDistance = distance;

    advanceRunners(distance <= HOME_RUN_THRESHOLD ? 4 :
                   distance <= TRIPLE_THRESHOLD ? 3 :
                   distance <= DOUBLE_THRESHOLD ? 2 :
                   distance <= SINGLE_THRESHOLD ? 1 : 0);
    updateBases();
    if (distance <= HOME_RUN_THRESHOLD){
      resultEl.textContent = `HOME RUN!!! (Within ${HOME_RUN_THRESHOLD} chapters).`;
    } else if(distance <= TRIPLE_THRESHOLD){
      resultEl.textContent = `TRIPLE!. (Within ${TRIPLE_THRESHOLD} chapters).`;
    } else if(distance <= DOUBLE_THRESHOLD){
      resultEl.textContent = `Double! (Within ${DOUBLE_THRESHOLD} chapters). `;
    } else if(distance <= SINGLE_THRESHOLD){
      resultEl.textContent = `Single! (Within ${SINGLE_THRESHOLD} chapters). `;
    } else {
      resultEl.textContent = `STRIKE! (Off by at least ${SINGLE_THRESHOLD + 1} chapters). `;
      handleStrike();
    }

    document.getElementById('finalizeGuess').disabled = true;
}

function startRound(){
  showVerses();
  ++round;
  updateScoreboard();
  startTimer(handleTimeUp, TIMER_DURATIONS[difficulty]);
}

function handleTimeUp() {
  alert("Time's Up!");
}

function showScreen(state){
  gameState = state;
  document.getElementById('menu-screen').style.display = (state === GAME_STATES.MENU) ? 'block' : 'none';
  document.getElementById('game-screen').style.display = (state === GAME_STATES.IN_GAME) ? 'block' : 'none';
  document.getElementById('game-over-screen').style.display = (state === GAME_STATES.GAME_OVER) ? 'block' : 'none';
}

function handleStrike(){
  ++strikes;
  if(strikes >= 3){
    document.getElementById('final-score').textContent = score;
    endGame();
  }
}

function startGame(){
  strikes = 0;
  score = 0;
  round = 0;
  updateScoreboard();
  showScreen(GAME_STATES.IN_GAME);
  startRound();
}

function endGame(){
  document.getElementById('final-score').textContent = score;
  showScreen(GAME_STATES.GAME_OVER);
}