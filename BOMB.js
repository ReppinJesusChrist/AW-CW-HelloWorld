const NUM_VERSES = 5;
let scriptures = null;
let currentSelection = null;


document.addEventListener('DOMContentLoaded', function() {
  // Load verses from bom.json when the page loads
  fetch('data/bom.json')
    .then(response => response.json())
    .then(data => {
        scriptures = data;
        showVerses();
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
});


function getRandomVerses(){
    const books = Object.keys(scriptures);
    const randomBook = books[Math.floor(Math.random() * books.length)];

    const chapters = Object.keys(scriptures[randomBook]);
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];

    const verses = scriptures[randomBook][randomChapter];

    const maxStartIndex = verses.length - NUM_VERSES;
    const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));

    const selectedVerses = verses.slice(startIndex, startIndex + NUM_VERSES);

    const startVerseNum = selectedVerses[0].verse;
    const endVerseNum = selectedVerses[NUM_VERSES - 1].verse;
    const ref = `${randomBook} ${randomChapter}:${startVerseNum}-${endVerseNum}`;

    return {
        book: randomBook,
        chapter: randomChapter,
        startVerse: startVerseNum,
        endVerse: endVerseNum,
        verses: selectedVerses,
        text: selectedVerses.map(v => v.text).join(' '),
        reference: ref
    }
}

function showVerses() {
    const container = document.getElementById('verses');
    const referenceElement = document.getElementById('reference');
    const revealButton = document.getElementById('revealReference');

    container.innerHTML = ''; // Clear previous verses
    referenceElement.textContent = ''; // Clear previous reference
    revealButton.textContent = 'Reveal Reference';

    currentSelection = getRandomVerses();
    console.log('Selected verses:', currentSelection);

    // Three seperate paragraphs (one for each verse)
    currentSelection.verses.forEach(verse => {
        const p = document.createElement('p');
        p.textContent = verse.text;
        container.appendChild(p);
    });
}