import { Question } from '../types';

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    questionText: "Which of the following elements has the highest thermal conductivity?",
    options: [
      "Silver",
      "Copper",
      "Gold",
      "Diamond"
    ],
    correctAnswerIndex: 3,
    explanation: "Diamond has the highest thermal conductivity of any known substance at room temperature, conductng about 5 times more than copper.",
    subject: "Science"
  },
  {
    id: "q2",
    questionText: "भारतीय संविधान का कौन सा अनुच्छेद समानता के अधिकार से संबंधित है? (Which Article of the Indian Constitution relates to the Right to Equality?)",
    options: [
      "अनुच्छेद 12 (Article 12)",
      "अनुच्छेद 14 (Article 14)",
      "अनुच्छेद 19 (Article 19)",
      "अनुच्छेद 21 (Article 21)"
    ],
    correctAnswerIndex: 1,
    explanation: "Article 14 of the Constitution of India provides for equality before the law or equal protection of the laws within the territory of India.",
    subject: "Polity"
  },
  {
    id: "q3",
    questionText: "If the radius of a circle is doubled, by what factor does its area increase?",
    options: [
      "2 times",
      "4 times",
      "8 times",
      "16 times"
    ],
    correctAnswerIndex: 1,
    explanation: "The area of a circle is A = πr². If the radius r becomes 2r, the new area is π(2r)² = 4πr², which is 4 times the original area.",
    subject: "Mathematics"
  },
  {
    id: "q4",
    questionText: "Who was the first Indian woman to win an Olympic medal?",
    options: [
      "Karnam Malleswari",
      "Saina Nehwal",
      "Mary Kom",
      "P.V. Sindhu"
    ],
    correctAnswerIndex: 0,
    explanation: "Karnam Malleswari won a bronze medal in weightlifting at the 2000 Sydney Olympics, becoming the first Indian woman to win an Olympic medal.",
    subject: "Sports"
  }
];
