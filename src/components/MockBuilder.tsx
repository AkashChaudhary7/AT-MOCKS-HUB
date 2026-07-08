import { ChevronDown, Sliders, Layers, Clock } from 'lucide-react';

interface MockBuilderProps {
  availableTargetExams: string[];
  availableSubjects: string[];
  subjectQuestionCounts: Record<string, number>;
  quizTargetExam: string;
  setQuizTargetExam: (val: string) => void;
  quizSubject: string;
  setQuizSubject: (val: string) => void;
  quizCount: number;
  setQuizCount: (val: number) => void;
  timerMinutes: number;
  setTimerMinutes: (val: number) => void;
}

export function MockBuilder({
  availableTargetExams,
  availableSubjects,
  subjectQuestionCounts,
  quizTargetExam,
  setQuizTargetExam,
  quizSubject,
  setQuizSubject,
  quizCount,
  setQuizCount,
  timerMinutes,
  setTimerMinutes,
}: MockBuilderProps) {
  return (
    <div className="space-y-6 animate-fade-in bg-slate-50/55 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-left" id="mock-builder-container">
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <Sliders className="h-4.5 w-4.5 text-indigo-500" />
        <h4 className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-250 tracking-wider">Custom Exam Builder</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Practice Custom Exam Tag */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Practice Custom Exam Tag</label>
          <div className="relative">
            <select 
              value={quizTargetExam}
              onChange={(e) => setQuizTargetExam(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-indigo-550/20 text-slate-800 dark:text-slate-100"
            >
              <option value="All Tag Sets" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Tag Sets (Sourced from Uploader)</option>
              {availableTargetExams.map(tag => (
                <option key={tag} value={tag} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{tag}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Practice Subject */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Practice Subject</label>
          <div className="relative">
            <select 
              value={quizSubject}
              onChange={(e) => setQuizSubject(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-755 px-4 py-3 rounded-xl text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-indigo-550/20 text-slate-800 dark:text-slate-100"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Subjects</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {sub} ({subjectQuestionCounts[sub] || 0} Qs)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Question Count */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Question Count
          </label>
          <input 
            type="number"
            value={quizCount}
            min={1}
            onChange={(e) => setQuizCount(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-550/20 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Time Minutes */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Time (Minutes)
          </label>
          <input 
            type="number"
            value={timerMinutes}
            max={180}
            min={1}
            onChange={(e) => setTimerMinutes(Math.min(180, Math.max(1, parseInt(e.target.value) || 0)))}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-550/20 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
}

export default MockBuilder;
