const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "../data/bom.json");

try{
    const raw = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(raw);
    const structuredData = {};

    let minVerseCount = Infinity;

    for (const book in data) {
        for (const chapter in data[book]) {
            if(chapter.length < minVerseCount){
                minVerseCount = currVerseCount;
                console.log(`minVerseCount updated: ${currVerseCount}\nBook: ${book}, Chapter: ${chapter}`);
            }
        }
    }

    console.log(`Minimum verse count found: ${minVerseCount}`);
} catch(err) {
    console.error("Error during grouping process:", err.message);
}