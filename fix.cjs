const fs = require('fs');
let code = fs.readFileSync('src/lib/htmlParser.ts', 'utf8');

const replacement = `            if (optE) options.push(stripHtmlToText(optE));
            while (options.length < 4) options.push(\`Option \${options.length + 1}\`);

            let correctIdx = 0;
            const ansMatch = cleanTextOnly(cleanedHtmlInput.substring(currentQuestionStart, limit)).match(/(?:Ans|Answer|Correct|Key|उत्तर|सही उत्तर)[\\s\\.\\-\\:\]*(.*)/i);
            if (ansMatch) {
              const val = ansMatch[1].trim();
              const upperVal = val.substring(0, 1).toUpperCase();
              if (["A", "1", "अ", "क"].includes(upperVal)) correctIdx = 0;
              else if (["B", "2", "ब", "ख"].includes(upperVal)) correctIdx = 1;
              else if (["C", "3", "स", "ग"].includes(upperVal)) correctIdx = 2;
              else if (["D", "4", "द", "घ"].includes(upperVal)) correctIdx = 3;
              else if (["E", "5", "य", "ङ"].includes(upperVal)) correctIdx = 4;
              else {
                 const oIdx = findMatchingOptionIndex(options, val);
                 if (oIdx !== -1) correctIdx = oIdx;
              }
            }

            parsedList.push({
              id: \`pro-\${Date.now()}-\${i}-\${Math.random().toString(36).substring(4)}\`,
              questionText: qParsed, options, correctAnswerIndex: correctIdx,
              explanation: "Preserved master dynamic layouts sheets mapping configuration.",`;

// find the exact start and end of the corrupted block
const startStr = '            const options = [stripHtmlToText(optA), stripHtmlToText(optB), stripHtmlToText(optC), stripHtmlToText(optD)].filter(Boolean);\n';
const endStr = '              subject: classifyTextSubject(cleanTextOnly(qParsed)), topic: "Rajasthan GK", subtopic: "",';

let idxStart = code.indexOf(startStr);
let idxEnd = code.indexOf(endStr, idxStart);

if (idxStart !== -1 && idxEnd !== -1) {
    const toReplace = code.substring(idxStart + startStr.length, idxEnd);
    code = code.replace(toReplace, replacement + '\n');
    fs.writeFileSync('src/lib/htmlParser.ts', code);
    console.log("Fixed corrupted section.");
} else {
    console.log("Could not find start or end strings.");
}

