const ANIMATION_TIME_MS = 600; // Time in ms for runner animation
const TIMER_DURATIONS = {
  unlimited: Infinity,
  leisurely: 180,
  relaxed: 60,
  easy: 30,
  medium: 20,
  hard: 10
}; // Timer durations for different difficulties
const THRESHOLD_ARRAYS = {
  otest: [25, 50, 100, 250],
  barn: [12, 25, 50, 100],
  wider: [7, 12, 25, 50],
  wide: [4, 7, 12, 25],
  average: [2, 4, 7, 12],
  narrow: [1, 2, 4, 7],
  pinhead: [0, 1, 2, 4]
}

const STANDARD_WORKS_FILE_NAMES = {
  bofm: 'data/bofm.json',
  ot: 'data/ot.json',
  nt: 'data/nt.json',
  dc: 'data/dc.json',
  gc: 'data/gc.json'
};

const GAME_STATES = {
  MENU: 'menu',
  IN_GAME: 'in_game',
  GAME_OVER: 'game_over',
  SETTINGS: 'settings'
}

import { startTimer, stopTimer } from "./timer.js";
import { makeScriptureLink, sleep } from "./helper_functions.js";

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
let includedBooks = new Set(); // Books to include in selection
let currentVolume = 'bofm'; // Default volume
let thresholdSetting = 'average';
let numDisplayVerses = 5;

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

  positionBases();

  // Load verses from bom.json when the page loads
  fetchScriptures();
  

  document.getElementById('volume-select-value').addEventListener('change', function () {
    populateIncludeExcludeOptions();
  });

  document.getElementById('threshold-value').addEventListener('change', function() {
    thresholdSetting = document.getElementById('threshold-value').value;
  });

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
      const url = makeScriptureLink(currentVolume, cs);
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

  document.getElementById('settings-button').addEventListener('click', function () {
    showScreen(GAME_STATES.SETTINGS);
  });

  document.getElementById('check-all-inex').addEventListener('click', function (){
    let targetDiv = document.getElementById("include-exclude-values");
    toggleAllBoxes(targetDiv, true);
    populateIncludeExcludeOptions();
  });

  document.getElementById('uncheck-all-inex').addEventListener('click', function (){
    let targetDiv = document.getElementById("include-exclude-values");
    toggleAllBoxes(targetDiv, false);
    includedBooks.clear();
  });

  document.querySelectorAll('.main-menu-button').forEach(button => {
    button.addEventListener('click', function () {
      showScreen(GAME_STATES.MENU);
      stopTimer();
      // Reset game state. Eventually move to new resetGame() function
      strikes = 0;
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
});

function fetchScriptures() {
  fetch(`${STANDARD_WORKS_FILE_NAMES[currentVolume]}`)
    .then(response => response.json())
    .then(data => {
      scriptures = data;
      buildVerseList(scriptures);
      buildChapterIndex(scriptures);
      populateGuessOptions();
      populateIncludeExcludeOptions();
    })
    .catch(err => console.error('Error loading verses:', err));
}

function populateGuessOptions() {
  const bookSelect = document.getElementById('bookSelect');
  bookSelect.innerHTML = ''; // Clear previous options
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

function populateIncludeExcludeOptions() {
  const vSelect = document.getElementById('volume-select-value');
  const toggle = document.getElementById('include-exclude-toggle');
  const IESelect = document.getElementById('include-exclude-values');
  const dropdown = document.getElementById('include-exclude-dropdown');
  IESelect.innerHTML = ''; // Clear previous options

  toggle.addEventListener('click', (e)=>{
    e.stopPropagation(); // Study this further to understand
    dropdown.classList.toggle('open');
  })

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
  });

    Object.keys(scriptures).forEach(bookName => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'block';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `inex-${bookName}`;
      checkbox.value = bookName;
      checkbox.textContent = bookName;
      checkbox.checked = true; // Default to include all books
      includedBooks.add(bookName); // Update set to reflect ^^^

      const label = document.createElement('label');
      label.setAttribute('for', `inex-${bookName}`);
      label.textContent = bookName;

      checkbox.addEventListener('change', () => {
        if(checkbox.checked){
          includedBooks.add(bookName);
        } else {
          includedBooks.delete(bookName);
        }
        console.log(`Included books:`, includedBooks);
      });

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      IESelect.appendChild(wrapper);
    });


  vSelect.addEventListener('change', () =>{
    currentVolume = vSelect.value;
    fetchScriptures();
    populateIncludeExcludeOptions();
  });
}

/**
 * 
 * @param {HTMLElement} targetDiv - the element to iterate through 
 * @param {boolean} check - true = check all boxes, false = uncheck all boxes 
 */
function toggleAllBoxes(targetDiv, check){
  if(!targetDiv) return;

  const checkboxes = targetDiv.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(box => {
    box.checked = check;
  });
}

function getRandomVerses() {
  const maxStartIndex = allVerses.length - numDisplayVerses;
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));

  const selectedVerses = allVerses.slice(startIndex, startIndex + numDisplayVerses);

  const firstVerse = selectedVerses[0];
  const lastVerse = selectedVerses[selectedVerses.length - 1];
  if (firstVerse.book !== lastVerse.book || 
    firstVerse.chapter !== lastVerse.chapter ||
    !includedBooks.has(firstVerse.book)) {
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
  chapterIndexMap = {};
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
  updateStrikeBoxes();
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

    const [homeRunThreshold, tripleThreshold, doubleThreshold, singleThreshold] = THRESHOLD_ARRAYS[thresholdSetting];

    advanceRunners(distance <= homeRunThreshold ? 4 :
                   distance <= tripleThreshold ? 3 :
                   distance <= doubleThreshold ? 2 :
                   distance <= singleThreshold ? 1 : 0);
    updateBases();
    if (distance <= homeRunThreshold){
      resultEl.textContent = `HOME RUN!!! (Within ${homeRunThreshold} chapters).`;
    } else if(distance <= tripleThreshold){
      resultEl.textContent = `TRIPLE! (Within ${tripleThreshold} chapters).`;
    } else if(distance <= doubleThreshold){
      resultEl.textContent = `Double! (Within ${doubleThreshold} chapters). `;
    } else if(distance <= singleThreshold){
      resultEl.textContent = `Single! (Within ${singleThreshold} chapters). `;
    } else {
      resultEl.textContent = `STRIKE! (Off by at least ${singleThreshold + 1} chapters). `;
      addStrike();
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
  addStrike();
  console.log("Time's Up! That's strike #" + strikes);
}

function showScreen(state){
  gameState = state;
  document.getElementById('menu-screen').style.display = (state === GAME_STATES.MENU) ? 'block' : 'none';
  document.getElementById('game-screen').style.display = (state === GAME_STATES.IN_GAME) ? 'block' : 'none';
  document.getElementById('game-over-screen').style.display = (state === GAME_STATES.GAME_OVER) ? 'block' : 'none';
  document.getElementById('settings-screen').style.display = (state === GAME_STATES.SETTINGS) ? 'block' : 'none';
}

function addStrike(){
  ++strikes;
  updateScoreboard();
  if(strikes >= 3){
    document.getElementById('final-score').textContent = score;
    endGame();
  }
}

function updateStrikeBoxes(){
  for(let i = 1; i <=3; ++i){
    const box = document.getElementById(`strike-box-${i}`);
    box.textContent = i <= strikes ? 'X' : '';
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

async function endGame(){
  document.getElementById('final-score').textContent = score;
  sleep(1000).then(() => {
    showScreen(GAME_STATES.GAME_OVER);
    stopTimer();
  }); 
}