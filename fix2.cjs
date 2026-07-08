const fs = require('fs');
let code = fs.readFileSync('src/lib/htmlParser.ts', 'utf8');

const replacement = `      let correctIdx = extractAnswerIndexFromJsonItem(item, options);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= Math.max(1, options.length)) {
        correctIdx = 0;
      }
      return {
        id: \`json-\${Date.now()}-\${idx}-\${Math.random().toString(36).substr(2, 4)}\`,`;

const startStr = `      let correctIdx = 0;
      if (item.correctAnswerIndex !== undefined && item.correctAnswerIndex !== null) {
        correctIdx = Number(item.correctAnswerIndex);
      } else if (item.correctAnswer !== undefined && typeof item.correctAnswer === 'number') {
        correctIdx = Number(item.correctAnswer);
      } else if (item.answerIndex !== undefined && item.answerIndex !== null) {
        correctIdx = Number(item.answerIndex);
      } else if (item.answer !== undefined && typeof item.answer === 'number') {
        // e.g. answer: 1 means index 0 if it is 1-based, or index 1 if 0-based. Let's assume 0-based if 0, 1-based if >= 1
        if (item.answer === 0) correctIdx = 0;
        else correctIdx = item.answer - 1;
      } else if (typeof item.answer === 'string') {
        const oIdx = findMatchingOptionIndex(options, item.answer);
        if (oIdx !== -1) correctIdx = oIdx;
      } else if (typeof item.correctAnswer === 'string') {
        const oIdx = findMatchingOptionIndex(options, item.correctAnswer);
        if (oIdx !== -1) correctIdx = oIdx;
      }

      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= Math.max(1, options.length)) {
        correctIdx = 0;
      }
      return {
        id: \`json-\${Date.now()}-\${idx}-\${Math.random().toString(36).substr(2, 4)}\`,`;

if (code.includes(startStr)) {
    code = code.replace(startStr, replacement);
    fs.writeFileSync('src/lib/htmlParser.ts', code);
    console.log("Fixed parseJSONQuestions.");
} else {
    console.log("Could not find start string.");
}

