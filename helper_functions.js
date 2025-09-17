export function makeScriptureLink(book, chapter, startVerse, endVerse){
    const bookMap = {
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

    const versePart = (startVerse === endVerse) ? startVerse : `${startVerse}-${endVerse}`;

    return `https://www.churchofjesuschrist.org/study/scriptures/bofm/${bookId}/${chapter}?lang=eng&verse=${versePart}#p${startVerse}`;
}