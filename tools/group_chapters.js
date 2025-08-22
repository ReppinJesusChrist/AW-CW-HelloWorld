const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "../data/bom_only.json");
const outputFile = path.join(__dirname, "../data/bom.json");

try{
    const raw = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(raw);

    const structuredData = {};

    data.forEach(entry => {
        const book = entry.book_title;
        const chapter = entry.chapter_number;
        const verse = entry.verse_number;

        if(!structuredData[book]) structuredData[book] = {};
        if(!structuredData[book][chapter]) structuredData[book][chapter] = [];

        structuredData[book][chapter].push({
            verse: verse,
            text: entry.scripture_text
        });
    });

    fs.writeFileSync(outputFile, JSON.stringify(structuredData, null, 2), "utf-8");

    console.log(`SUCCESS! Grouped and wrote to ${outputFile}`);
} catch(err) {
    console.error("Error during grouping process:", err.message);
}