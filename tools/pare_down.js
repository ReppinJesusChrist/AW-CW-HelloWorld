const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, "../data/nephi_bom.json");
const outputFile = path.join(__dirname, "../data/bom_only.json");

try{
// Read the input JSON file
const raw = fs.readFileSync(inputFile, 'utf8');
const data = JSON.parse(raw);

// Pare down data to BOM only
const bomOnly = data.filter(entry => entry.volume_title === 'Book of Mormon');

/*
// Remove unneeded fields
const simplified = bomOnly.map(entry => ({
    reference : entry.verse_title,
    text: entry.scripture_text
}));
*/

fs.writeFileSync(outputFile, JSON.stringify(bomOnly, null, 2), "utf-8");

console.log(`Pare-Down Complete! Wrote ${bomOnly.length} verses from BOM to ${outputFile}`);
}catch(err){
    console.error("Error during pare-down process:", err.message);
}