export function makeScriptureLink(volume, cs){
    let book = cs.book;
    let chapter = cs.chapter;
    let startVerse = cs.verses[0].verse;
    let endVerse = cs.verses[cs.verses.length - 1].verse;

    const versePart = (startVerse === endVerse) ? startVerse : `${startVerse}-${endVerse}`;
    if(volume === 'bofm' | volume === 'nt' | volume === 'ot'){
        const bookMap = {
            // Old Testament
            "Genesis": "gen",
            "Exodus": "ex",
            "Leviticus": "lev",
            "Numbers": "num",
            "Deuteronomy": "deut",
            "Joshua": "josh",
            "Judges": "judg",
            "Ruth": "ruth",
            "1 Samuel": "1-sam",
            "2 Samuel": "2-sam",
            "1 Kings": "1-kgs",
            "2 Kings": "2-kgs",
            "1 Chronicles": "1-chr",
            "2 Chronicles": "2-chr",
            "Ezra": "ezra",
            "Nehemiah": "neh",
            "Esther": "esth",
            "Job": "job",
            "Psalms": "ps",
            "Proverbs": "prov",
            "Ecclesiastes": "eccl",
            "Song of Solomon": "song",
            "Isaiah": "isa",
            "Jeremiah": "jer",
            "Lamentations": "lam",
            "Ezekiel": "ezek",
            "Daniel": "dan",
            "Hosea": "hosea",
            "Joel": "joel",
            "Amos": "amos",
            "Obadiah": "obad",
            "Jonah": "jonah",
            "Micah": "micah",
            "Nahum": "nahum",
            "Habakkuk": "hab",
            "Zephaniah": "zeph",
            "Haggai": "hag",
            "Zechariah": "zech",
            "Malachi": "mal",

            // New Testament
            "Matthew": "matt",
            "Mark": "mark",
            "Luke": "luke",
            "John": "john",
            "Acts": "acts",
            "Romans": "rom",
            "1 Corinthians": "1-cor",
            "2 Corinthians": "2-cor",
            "Galatians": "gal",
            "Ephesians": "eph",
            "Philippians": "philip",
            "Colossians": "col",
            "1 Thessalonians": "1-thes",
            "2 Thessalonians": "2-thes",
            "1 Timothy": "1-tim",
            "2 Timothy": "2-tim",
            "Titus": "titus",
            "Philemon": "philem",
            "Hebrews": "heb",
            "James": "james",
            "1 Peter": "1-pet",
            "2 Peter": "2-pet",
            "1 John": "1-jn",
            "2 John": "2-jn",
            "3 John": "3-jn",
            "Jude": "jude",
            "Revelation": "rev",

            // Book of Mormon
            "1 Nephi": "1-ne",
            "2 Nephi": "2-ne",
            "Jacob": "jacob",
            "Enos": "enos",
            "Jarom": "jarom",
            "Omni": "omni",
            "Words of Mormon": "w-of-m",
            "Mosiah": "mosiah",
            "Alma": "alma",
            "Helaman": "hel",
            "3 Nephi": "3-ne",
            "4 Nephi": "4-ne",
            "Mormon": "morm",
            "Ether": "ether",
            "Moroni": "moro"
        };
        const bookId = bookMap[book];
        if(!bookId) throw new Error(`Unknown book: ${book}`);

        return `https://www.churchofjesuschrist.org/study/scriptures/${volume}/${bookId}/${chapter}?lang=eng&verse=${versePart}#p${startVerse}`;
    } else if(volume === 'dc'){
        return `https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/${chapter}?lang=eng&verse=${versePart}#p${startVerse}`;
    } else if(volume === 'gc'){
        // https://www.churchofjesuschrist.org/study/general-conference/2025/04/13holland?lang=eng (Ideal link)
        // https://www.churchofjesuschrist.org/study/general-conference/2025/April/41holland?lang=eng (My current link generated)
        return `https://www.churchofjesuschrist.org/study/general-conference/${formatSessionName(book).year}/${formatSessionName(book).monthNum}/41holland?lang=eng`
    }
    
}

function formatSessionName(session){
    let year = session.split(" ").slice(1).join(" ");
    let monthNum = session.split(" ").slice(0,1).join(" ");
    return {year, monthNum};
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}