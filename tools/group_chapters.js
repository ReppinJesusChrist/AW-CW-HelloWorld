const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "../data/gc_last_4.json");
const outputFile = path.join(__dirname, "../data/gc.json");

try{
    const raw = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(raw);

    const structuredData = {};

    data.forEach(entry => {
        const session = `${entry.season} ${entry.year}`;
        const speaker = entry.speaker.split(" ").slice(1).join(" ");

        if(!structuredData[session]) structuredData[session] = {};
        if(!structuredData[session][speaker]) structuredData[session][speaker] = [];
        
        entry.text.forEach((para, idx) => {
            structuredData[session][speaker].push({
                verse: idx + 1,
                text: para
            });
        });
    });

    fs.writeFileSync(outputFile, JSON.stringify(structuredData, null, 2), "utf-8");

    console.log(`SUCCESS! Grouped and wrote to ${outputFile}`);
} catch(err) {
    console.error("Error during grouping process:", err.message);
}