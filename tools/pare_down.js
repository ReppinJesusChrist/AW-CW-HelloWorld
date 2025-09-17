const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, "../data/standard_works.json");
const outputFile = path.join(__dirname, "../data/oldtest_only.json");

try{
// Read the input JSON file
const raw = fs.readFileSync(inputFile, 'utf8');
const data = JSON.parse(raw);

// Pare down data to BOM only
const oldTestOnly = data.filter(entry => entry.volume_title === 'Old Testament');

/*
// Remove unneeded fields
const simplified = oldTestOnly.map(entry => ({
    reference : entry.verse_title,
    text: entry.scripture_text
}));
*/


fs.writeFileSync(outputFile, JSON.stringify(oldTestOnly, null, 2), "utf-8");

console.log(`Pare-Down Complete! Wrote ${oldTestOnly.length} verses from BOM to ${outputFile}`);
}catch(err){
    console.error("Error during pare-down process:", err.message);
}