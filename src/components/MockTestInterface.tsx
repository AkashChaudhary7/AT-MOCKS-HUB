// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, XCircle, Trash2, Flag, BookOpen } from 'lucide-react';
import { Question, QuizSettings, TestAttempt, UserAnswer } from '../types';
import FormattedText from './FormattedText';
import CountdownTimer from './CountdownTimer';

interface MockTestInterfaceProps {
  questions: Question[];
  settings: QuizSettings;
  onFinish: (attempt: TestAttempt) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export default function MockTestInterface({
  questions,
  settings,
  onFinish,
  onCancel,
  isDarkMode,
}: MockTestInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );

  // States to keep track of visited questions for color mapping
  const [visited, setVisited] = useState<boolean[]>(
    new Array(questions.length).fill(false).map((v, i) => i === 0)
  );
  const [flagged, setFlagged] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );
  
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showGridMap, setShowGridMap] = useState(false);

  // Track time
  const totalSeconds = settings.hasTimer ? settings.durationMinutes * 60 : 0;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    setVisited((prev) => {
      const next = [...prev];
      next[currentIndex] = true;
      return next;
    });
  }, [currentIndex]);

  // Timer interval for stopwatch (only when there is no timer setting)
  useEffect(() => {
    if (settings.hasTimer) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.hasTimer]);

  const selectOption = (optIndex: number) => {
    const nextAnswers = [...selectedAnswers];
    if (nextAnswers[currentIndex] === optIndex) {
      nextAnswers[currentIndex] = null; // Toggle off if clicked again
    } else {
      nextAnswers[currentIndex] = optIndex;
    }
    setSelectedAnswers(nextAnswers);
    
    // Auto advance if enabled and we selected an option (didn't unselect)
    if (autoAdvance && nextAnswers[currentIndex] !== null) {
      setTimeout(() => {
         if (currentIndex < questions.length - 1) {
           setCurrentIndex(prev => prev + 1);
         }
      }, 400);
    }
  };
  
  const toggleFlag = () => {
    const nextFlagged = [...flagged];
    nextFlagged[currentIndex] = !nextFlagged[currentIndex];
    setFlagged(nextFlagged);
  };

  const getQuestionStatus = (idx: number): 'current' | 'answered' | 'unvisited' | 'skipped-visited' | 'flagged' => {
    if (idx === currentIndex) return 'current';
    if (flagged[idx]) return 'flagged';
    if (selectedAnswers[idx] !== null) return 'answered';
    if (visited[idx]) return 'skipped-visited';
    return 'unvisited';
  };

  const triggerSubmit = () => {
    try {

    const answers: UserAnswer[] = questions.map((q, idx) => {
      const selIndex = selectedAnswers[idx];
      return {
        questionId: q.id,
        selectedIndex: selIndex,
        isCorrect: selIndex === q.correctAnswerIndex,
      };
    });

    const correctCount = answers.filter((a) => a.selectedIndex !== null && a.isCorrect).length;
    const incorrectCount = answers.filter((a) => a.selectedIndex !== null && !a.isCorrect).length;
    const unattemptedCount = answers.filter((a) => a.selectedIndex === null).length;

    const finalTimeTaken = settings.hasTimer
      ? totalSeconds - Math.max(0, secondsRemaining)
      : secondsElapsed;

    const correctMarks = settings.correctAnswerMarks ?? 4;
    const penaltyMarks = settings.negativeMarking ?? -1;
    const calculatedScore = (correctCount * correctMarks) + (incorrectCount * penaltyMarks);
    const maxScore = questions.length * correctMarks;
    const scorePercentage = maxScore > 0 ? Math.round((calculatedScore / maxScore) * 100) : 0;

    const attempt: TestAttempt = {
      id: "att_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      subject: settings.subject,
      date: new Date().toISOString(),
      score: calculatedScore,
      scorePercentage: scorePercentage,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeTaken: finalTimeTaken,
      answers,
    };

    
      onFinish(attempt);
    } catch(err) {
      console.error("Finish failed:", err);
      alert("Error finishing quiz: " + err.message);
    }
  };

  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const letters = ['A', 'B', 'C', 'D'];
  const attemptedNum = selectedAnswers.filter((ans) => ans !== null).length;
  const skippedNum = visited.filter((v, i) => v && selectedAnswers[i] === null).length;
  const flaggedNum = flagged.filter(f => f).length;
  const isAnswerSelected = selectedAnswers[currentIndex] !== null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isDarkMode ? 'bg-[#0F1117] text-slate-200' : 'bg-white text-slate-800'
    }`}>
      {/* Test Banner Header */}
      <header className={`sticky top-0 z-40 transition-colors h-16 flex items-center justify-between px-3 sm:px-6 border-b shadow-sm ${
        isDarkMode ? 'bg-[#151821] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
           <button
             onClick={() => {
               // Using simple state change or just directly cancel for now. 
               // For a real app, you might want a custom modal. 
               onCancel();
             }}
             className={`p-1.5 sm:p-2 rounded-xl transition border ${
               isDarkMode ? 'hover:bg-slate-800 border-slate-700 text-slate-400' : 'hover:bg-slate-50 border-slate-200 text-slate-500'
             }`}
           >
             <ArrowLeft className="h-5 w-5" />
           </button>
           <div className="ml-1 sm:ml-3">
             <h1 className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
               {settings.subject.toUpperCase() || 'CUSTOM PRACTICE'}
             </h1>
             <p className={`text-[9px] sm:text-[10px] font-bold leading-none mt-1 uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               TEST • {questions.length} QUESTIONS
             </p>
           </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
           {settings.hasTimer ? (
             <CountdownTimer 
               durationMinutes={settings.durationMinutes} 
               onTimeUp={triggerSubmit} 
               onTick={(sec) => setSecondsRemaining(sec)} 
               isDarkMode={isDarkMode} 
             />
           ) : (
             <div className={`flex items-center space-x-1.5 rounded-full border px-2 sm:px-3 py-1 font-mono text-xs font-bold select-none ${
               isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
             }`}>
               <Timer className="h-3.5 w-3.5" />
               <span>{formatTime(secondsElapsed)}</span>
             </div>
           )}
           
           <button
             onClick={triggerSubmit}
             className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-black px-3 sm:px-5 py-1.5 rounded-full uppercase tracking-widest transition-all cursor-pointer shadow-sm"
           >
             Submit
             <span className="hidden sm:inline ml-1">Test</span>
           </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 flex flex-col">
         {/* Question Header */}
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-[11px] font-black uppercase tracking-wider">
               <BookOpen className="h-3.5 w-3.5" />
               <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
            
            <button 
              onClick={toggleFlag}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                 flagged[currentIndex] 
                   ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' 
                   : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-transparent dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
               <Flag className={`h-3.5 w-3.5 ${flagged[currentIndex] ? 'fill-current' : ''}`} />
               <span>Mark for Review</span>
            </button>
         </div>
         
         {currentQuestion.topic && (
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
               {currentQuestion.topic}
            </div>
         )}
         
         <div className="text-base sm:text-lg font-medium leading-relaxed mb-6 text-slate-900 dark:text-slate-100">
            <FormattedText text={currentQuestion.questionText} />
         </div>
         
         <div className="space-y-3 mb-8">
            {currentQuestion.options.map((optionText, idx) => {
               const isSelected = selectedAnswers[currentIndex] === idx;
               return (
                  <button
                     key={idx}
                     onClick={() => selectOption(idx)}
                     className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center space-x-4 ${
                        isSelected
                           ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-900/20'
                           : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-[#151821] dark:hover:border-slate-600'
                     }`}
                  >
                     <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        isSelected 
                           ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
                           : 'border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500'
                     }`}>
                        {letters[idx]}
                     </div>
                     <div className={`flex-1 ${isSelected ? 'text-indigo-950 font-semibold dark:text-indigo-100' : 'text-slate-700 font-medium dark:text-slate-300'}`}>
                        <FormattedText text={optionText} />
                     </div>
                  </button>
               );
            })}
         </div>

         {/* Extra space pushing footer down */}
         <div className="flex-1"></div>
         
         {/* Action Bar */}
         <div className="flex flex-col space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Top row actions */}
            <div className="flex items-center justify-between px-2">
               <button
                  onClick={() => {
                     const nextAns = [...selectedAnswers];
                     nextAns[currentIndex] = null;
                     setSelectedAnswers(nextAns);
                  }}
                  disabled={!isAnswerSelected}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                     isAnswerSelected 
                        ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' 
                        : 'text-slate-300 cursor-not-allowed dark:text-slate-700'
                  }`}
               >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Selection</span>
               </button>
               
               <label className="flex items-center space-x-2 cursor-pointer">
                  <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                     autoAdvance 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                  }`}>
                     {autoAdvance && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Auto-Advance</span>
                  <input 
                     type="checkbox" 
                     className="hidden" 
                     checked={autoAdvance} 
                     onChange={() => setAutoAdvance(!autoAdvance)}
                  />
               </label>
            </div>
            
            {/* Bottom row nav */}
            <div className="flex items-center justify-between">
               <button
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  disabled={currentIndex === 0}
                  className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                     currentIndex === 0
                        ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-500 dark:border-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#151821] dark:border-slate-700 dark:text-slate-300'
                  }`}
               >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Prev</span>
               </button>
               
               <button className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400">
                  <Flag className="h-3.5 w-3.5" />
                  <span>FONT ERROR</span>
               </button>
               
               {currentIndex === questions.length - 1 ? (
                 <button
                   onClick={() => {
                       triggerSubmit();
                   }}
                   className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                 >
                   <span>Finish</span>
                   <CheckCircle2 className="h-4 w-4" />
                 </button>
               ) : (
                 <button
                    onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="flex items-center space-x-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#151821] dark:border-slate-700 dark:text-slate-300"
                 >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                 </button>
               )}
            </div>
         </div>
      </main>
      
      {/* Footer Stats Bar */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111319] py-2 px-4 flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
         <div className="flex items-center space-x-3 sm:space-x-4">
            <span>Total: {questions.length}</span>
            <span className="text-emerald-600 dark:text-emerald-400">Answered: {attemptedNum}</span>
            <span className="text-amber-600 dark:text-amber-400">Skipped: {skippedNum}</span>
            <span className="text-rose-600 dark:text-rose-400">Flagged: {flaggedNum}</span>
         </div>
         <button 
           onClick={() => setShowGridMap(!showGridMap)}
           className="px-3 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
         >
            {showGridMap ? 'Hide Grid Map' : 'View Grid Map'}
         </button>
      </footer>
      
      {/* Grid Map Overlay */}
      {showGridMap && (
         <div className="fixed inset-x-0 bottom-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 z-30 max-h-[50vh] overflow-y-auto">
            <div className="max-w-4xl mx-auto">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Question Grid Map</h3>
               <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {questions.map((_, idx) => {
                     const status = getQuestionStatus(idx);
                     return (
                        <button
                           key={idx}
                           onClick={() => {
                              setCurrentIndex(idx);
                              setShowGridMap(false);
                           }}
                           className={`h-10 w-full text-xs rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer border ${
                              status === 'current'
                                 ? 'bg-indigo-600 text-white border-indigo-600'
                                 : status === 'answered'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                                    : status === 'flagged'
                                       ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400'
                                       : status === 'skipped-visited'
                                          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400'
                                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700'
                           }`}
                        >
                           {idx + 1}
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

