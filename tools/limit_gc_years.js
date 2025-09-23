const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, "../data/conference_talks.json");
const outputFile = path.join(__dirname, "../data/gc_last_4.json");

try{
// Read the input JSON file
const raw = fs.readFileSync(inputFile, 'utf8');
const data = JSON.parse(raw);

// Pare down data to BOM only
const targetSessionsOnly = data.filter(entry => entry.year >= 2024);

/*
// Remove unneeded fields
const simplified = oldTestOnly.map(entry => ({
    reference : entry.verse_title,
    text: entry.scripture_text
}));
*/


fs.writeFileSync(outputFile, JSON.stringify(targetSessionsOnly, null, 2), "utf-8");

console.log(`Pare-Down Complete! Wrote ${targetSessionsOnly.length} verses from GC to ${outputFile}`);
}catch(err){
    console.error("Error during pare-down process:", err.message);
}