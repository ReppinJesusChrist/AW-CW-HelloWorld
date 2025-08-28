const NUM_VERSES = 5;

const HOME_RUN_THRESHOLD = 3; // Number of chapters away for a "home run"
const TRIPLE_THRESHOLD = 7; // Number of chapters away for a "triple"
const DOUBLE_THRESHOLD = 15; // Number of chapters away for a "double"  
const SINGLE_THRESHOLD = 30; // Number of chapters away for a "single"

let scriptures = null;
let currentSelection = null;
let allVerses = [];
let chapterIndexMap = {};


document.addEventListener('DOMContentLoaded', function () {
  // Load verses from bom.json when the page loads
  fetch('data/bom.json')
    .then(response => response.json())
    .then(data => {
      scriptures = data;
      buildVerseList(scriptures);
      buildChapterIndex(scriptures);
      showVerses();
      populateGuessOptions();
      document.getElementById('revealReference').disabled = false;
    })
    .catch(err => console.error('Error loading verses:', err));

  document.getElementById('revealReference').addEventListener('click', function () {
    const refEl = document.getElementById('reference');
    console.log('Reveal button clicked');
    // SIMPLE REVEAL: just show once
    if (!refEl.textContent && currentSelection) {
      refEl.textContent = currentSelection.reference;
    }
  });

  document.getElementById('newRound').addEventListener('click', function () {
    showVerses();
  });

  document.getElementById('finalizeGuess').addEventListener('click', function () {
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

    if (distance <= HOME_RUN_THRESHOLD){
      resultEl.textContent = "HOME RUN!!!";
    } else if(distance <= TRIPLE_THRESHOLD){
      resultEl.textContent = `TRIPLE! (Off by ${distance} chapters). `;
    } else if(distance <= DOUBLE_THRESHOLD){
      resultEl.textContent = `Double! (Off by ${distance} chapters). `;
    } else if(distance <= SINGLE_THRESHOLD){
      resultEl.textContent = `Single! (Off by ${distance} chapters). `;
    } else {
      resultEl.textContent = `STRIKE! (Off by ${distance} chapters). `;
    }
  });

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

  const bookSelect = document.getElementById('bookSelect');
  const chapterSelect = document.getElementById('chapterSelect');
  const resultEl = document.getElementById('result');

  bookSelect.value = '';
  chapterSelect.innerHTML = '';
  resultEl.textContent = '';

  container.innerHTML = ''; // Clear previous verses
  referenceElement.textContent = ''; // Clear previous reference
  revealButton.textContent = 'Reveal Reference';

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