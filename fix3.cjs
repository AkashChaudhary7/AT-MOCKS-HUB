const fs = require('fs');
let code = fs.readFileSync('src/lib/htmlParser.ts', 'utf8');

const regex = /let correctIdx = 0;\s+if \(item\.correctAnswerIndex !== undefined && item\.correctAnswerIndex !== null\) {[\s\S]*?if \(isNaN\(correctIdx\) \|\| correctIdx < 0 \|\| correctIdx >= Math\.max\(1, options\.length\)\) {\s+correctIdx = 0;\s+}/g;

const replacement = `let correctIdx = extractAnswerIndexFromJsonItem(item, options);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= Math.max(1, options.length)) {
        correctIdx = 0;
      }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/lib/htmlParser.ts', code);
    console.log("Fixed parseJSONQuestions.");
} else {
    console.log("Could not find regex match.");
}
