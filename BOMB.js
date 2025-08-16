let verses = [];

// Load verses from bom.json when the page loads
fetch('bom.json')
    .then(response => response.json())
    .then(data => {
        verses = data.verses;
        showVerses();
    })
    .catch(err => console.error('Error loading verses:', err));

function getRandomVerses(){
    const start = Math.floor(Math.random() * (verses.length - 2));
    return verses.slice(start, start + 3);
}

function showVerses() {
    const container = document.getElementById('verses');
    container.innerHTML = ''; // Clear previous verses

    const randomVerses = getRandomVerses();
    randomVerses.forEach(verse => {
        const p = document.createElement('p');
        p.textContent = verse.text;
        container.appendChild(p);
    });
}