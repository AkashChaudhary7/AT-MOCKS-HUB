// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  ExternalLink, 
  Edit2, 
  Check, 
  HelpCircle, 
  FileText, 
  Search, 
  GraduationCap, 
  Cpu, 
  Calculator, 
  Compass, 
  Bookmark,
  ChevronRight,
  Info,
  Trash2,
  Plus,
  Table,
  FileCode,
  Sparkles,
  Home
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface StudyNote {
  id: string;
  examId: string;
  subject: string;
  topic: string;
  contentType: 'html' | 'csv' | 'txt';
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface StudyNotesProps {
  isDarkMode: boolean;
  onBackToHome: () => void;
  currentUser: string | null;
  isAdmin: boolean;
  onToggleReadingMode?: (isReading: boolean) => void;
}

const SEED_NOTES: Omit<StudyNote, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'seed-comp-arch',
    examId: 'exam-dsssb-it',
    subject: 'Computer Science',
    topic: 'Computer Architecture & OS Notes',
    contentType: 'html',
    content: `<h3><b>Computer Architecture & Operating Systems Essentials</b></h3>
<p>This study reference covers essential concepts for DSSSB IT / Computer Science exams, focusing on memory hierarchy, scheduling algorithms, and processes.</p>

<h4 style="margin-top: 16px; color: #4f46e5; font-weight: bold;">1. Memory Hierarchy & Cache Memory</h4>
<ul>
  <li><b>Registers:</b> Smallest, fastest storage elements inside the CPU.</li>
  <li><b>Cache Memory (L1, L2, L3):</b> High-speed SRAM which stores active instructions. Cache hit ratio is defined as: <br/><code>Hit Ratio = Hits / (Hits + Misses)</code></li>
  <li><b>Main Memory:</b> Physical DRAM that holds programs during execution.</li>
  <li><b>Secondary Storage:</b> Magnetic/SSD disks for persistent files.</li>
</ul>

<h4 style="margin-top: 16px; color: #4f46e5; font-weight: bold;">2. CPU Scheduling Algorithms</h4>
<p>Operating systems schedule processes to maximize CPU utilization. Essential algorithms include:</p>
<ul>
  <li><b>First-Come, First-Served (FCFS):</b> Non-preemptive, simple, but suffers from the Convoy Effect.</li>
  <li><b>Shortest Job First (SJF):</b> Optimal average waiting time. Can be preemptive (Shortest Remaining Time First).</li>
  <li><b>Round Robin (RR):</b> Uses a time quantum. Ideal for time-sharing environments.</li>
  <li><b>Priority Scheduling:</b> Executes higher-priority processes first. Can cause starvation (solved by Aging).</li>
</ul>

<h4 style="margin-top: 16px; color: #4f46e5; font-weight: bold;">3. Deadlocks & Bankers Algorithm</h4>
<p>A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.</p>
<p><b>Four Necessary Conditions:</b></p>
<ol>
  <li>Mutual Exclusion</li>
  <li>Hold and Wait</li>
  <li>No Preemption</li>
  <li>Circular Wait</li>
</ol>`
  },
  {
    id: 'seed-dbms-sql',
    examId: 'exam-dsssb-it',
    subject: 'Computer Science',
    topic: 'DBMS & SQL Reference Manual',
    contentType: 'csv',
    content: `Command,Clause Type,Purpose,Syntax Example
SELECT,DQL,Query data from tables,SELECT * FROM users WHERE active = 1;
INSERT,DML,Insert new records,"INSERT INTO slots (id, user) VALUES (1, 'Akash');"
UPDATE,DML,Modify existing records,"UPDATE users SET passcode = '8544' WHERE username = 'akash_chaudhary';"
DELETE,DML,Remove existing records,DELETE FROM flagged_questions WHERE id = 'q123';
CREATE,DDL,Create new database objects,"CREATE TABLE study_notes (id VARCHAR(50), content TEXT);"
ALTER,DDL,Modify structure of objects,ALTER TABLE users ADD COLUMN rating INT;`
  },
  {
    id: 'seed-dsa-vault',
    examId: 'exam-dsssb-it',
    subject: 'Computer Science',
    topic: 'Data Structures & Algorithms Vault',
    contentType: 'txt',
    content: `========================================================
DATA STRUCTURES & ALGORITHMS (DSA) CHEAT SHEET
========================================================

1. BIG-O TIME & SPACE COMPLEXITIES
--------------------------------------------------------
Algorithm          Time (Best)    Time (Worst)   Space (Worst)
--------------------------------------------------------
Binary Search      O(1)           O(log n)       O(1)
Bubble Sort        O(n)           O(n^2)         O(1)
Quick Sort         O(n log n)     O(n^2)         O(log n)
Merge Sort         O(n log n)     O(n log n)     O(n)

2. KEY DATA STRUCTURE CHARACTERISTICS
--------------------------------------------------------
- Arrays: Contiguous memory blocks, O(1) random access by index.
- Linked Lists: Dynamic size, nodes containing data and next pointers. O(n) access.
- Binary Trees: Hierarchical structure. Maximum of 2 children.
- Hash Tables: Key-value mapping using hashing. Average O(1) insertion and search.

3. COMMONLY USED GRAPH ALGORITHMS
--------------------------------------------------------
- BFS (Breadth-First Search): Uses a Queue (FIFO), finds shortest path in unweighted graphs.
- DFS (Depth-First Search): Uses a Stack (LIFO/Recursion), excellent for topological sorting.
- Dijkstra's Algorithm: Single-source shortest path for weighted graphs (non-negative weights).
- Kruskal's & Prim's: Minimum Spanning Tree (MST) compilation.`
  },
  {
    id: 'seed-math-progs',
    examId: 'exam-dsssb-tgt',
    subject: 'Mathematics',
    topic: 'Real Numbers & Progressions',
    contentType: 'txt',
    content: `========================================================
MATHEMATICS: REAL NUMBERS & PROGRESSIONS
========================================================

1. ARITHMETIC PROGRESSION (AP)
--------------------------------------------------------
An AP is a sequence of numbers in which the difference between consecutive terms is constant.
- General form: a, a+d, a+2d, a+3d, ...
- n-th term (Tn) = a + (n - 1) * d
- Sum of first n terms (Sn) = (n / 2) * [2a + (n - 1) * d] or Sn = (n / 2) * [a + L] (where L is last term)

2. GEOMETRIC PROGRESSION (GP)
--------------------------------------------------------
A GP is a sequence of numbers where each term after the first is found by multiplying the previous term by a non-zero number called the common ratio.
- General form: a, a*r, a*r^2, a*r^3, ...
- n-th term (Tn) = a * r^(n - 1)
- Sum of first n terms (Sn) = a * (1 - r^n) / (1 - r) for r < 1
- Sum to infinity (S_inf) = a / (1 - r) for |r| < 1

3. PROPERTIES OF REAL NUMBERS
--------------------------------------------------------
- Trichotomy Property: For any real numbers a and b, exactly one of the following is true: a < b, a = b, or a > b.
- Archimedean Property: If x and y are positive real numbers, there exists an integer n such that n*x > y.`
  },
  {
    id: 'seed-rajasthan-gk',
    examId: 'exam-rpsc-eo',
    subject: 'Rajasthan GK',
    topic: 'History, Art & Culture of Rajasthan',
    contentType: 'txt',
    content: `========================================================
RAJASTHAN GK: HISTORY, ART & CULTURE CHRONOLOGY
========================================================

1. HISTORICAL PERIODS OF RAJASTHAN
--------------------------------------------------------
- Kalibangan Civilisation: Harappan-era site located in Hanumangarh district. Highlighted by tilled agricultural fields.
- Mewar Dynasty: One of the oldest serving dynasties in the world, featuring historic kings like Maharana Sanga and Maharana Pratap.
- Battle of Haldighati (1576): Fought between Maharana Pratap and the Mughal forces led by Man Singh I of Amber.

2. FAMOUS FORTS AND PALACES (UNESCO SITES)
--------------------------------------------------------
- Chittorgarh Fort: The grandest fort of Rajasthan, spanning over 700 acres.
- Kumbhalgarh Fort: Boasts the second longest continuous wall in the world (36km) after the Great Wall of China.
- Mehrangarh Fort: Located in Jodhpur, beautifully perched on a cliff-face overlooking the Blue City.
- Amber Fort: Jaipur's crown jewel, showing a mixture of Rajput and Mughal design.

3. TRADITIONAL FOLK ART & DANCE
--------------------------------------------------------
- Ghoomar Dance: Elegant dance performed by women wearing flowing skirts.
- Kalbelia Dance: Included in UNESCO's representative list of Intangible Cultural Heritage. Performed by the snake charmer community.`
  },
  {
    id: 'seed-polity-const',
    examId: 'exam-rpsc-eo',
    subject: 'Polity',
    topic: 'Indian Constitution & Key Amendments',
    contentType: 'html',
    content: `<h3><b>Indian Constitution & Essential Democratic Framework</b></h3>
<p>This reference contains key sections, schedules, and landmark articles for Rajasthan Polity & Public Administration.</p>

<h4 style="margin-top: 16px; color: #4f46e5; font-weight: bold;">1. Fundamental Rights (Part III)</h4>
<p>Articles 12 to 35 secure the fundamental rights of Indian citizens. Key articles include:</p>
<ul>
  <li><b>Article 14:</b> Equality before law and equal protection of laws.</li>
  <li><b>Article 19:</b> Protection of certain rights regarding freedom of speech, assembly, and movement.</li>
  <li><b>Article 21:</b> Protection of life and personal liberty.</li>
  <li><b>Article 32:</b> Right to Constitutional Remedies (termed the 'Heart and Soul' of the Constitution by Dr. B.R. Ambedkar).</li>
</ul>

<h4 style="margin-top: 16px; color: #4f46e5; font-weight: bold;">2. Panchayati Raj & Local Self-Government</h4>
<p>Local administration is a major topic for municipal and executive exams:</p>
<ul>
  <li><b>73rd Amendment Act (1992):</b> Added Part IX (The Panchayats) and Eleventh Schedule to the Constitution.</li>
  <li><b>74th Amendment Act (1992):</b> Added Part IXA (The Municipalities) and Twelfth Schedule to the Constitution, defining 18 municipal functional domains.</li>
  <li><b>Article 243G:</b> Powers, authority, and responsibilities of Panchayats.</li>
  <li><b>Article 243W:</b> Powers, authority, and responsibilities of Municipalities.</li>
</ul>`
  }
];

export const StudyNotes: React.FC<StudyNotesProps> = ({ isDarkMode, onBackToHome, currentUser, isAdmin, onToggleReadingMode }) => {
  const [activeExamId, setActiveExamId] = useState<string>('exam-dsssb-it');
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const cached = localStorage.getItem('MOCK_STUDY_NOTES');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  
  // Embedded Reader State
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);

  useEffect(() => {
    if (onToggleReadingMode) {
      onToggleReadingMode(!!viewingNote);
    }
    return () => {
      if (onToggleReadingMode) {
        onToggleReadingMode(false);
      }
    };
  }, [viewingNote, onToggleReadingMode]);
  const [readerSearchQuery, setReaderSearchQuery] = useState<string>('');
  
  // Admin Upload State
  const [isUploadingNote, setIsUploadingNote] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState({
    examId: 'exam-dsssb-it',
    subject: '',
    topic: '',
    contentType: 'html' as 'html' | 'csv' | 'txt'
  });
  const [uploadFileContent, setUploadFileContent] = useState<string>('');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Auto detect content type based on extension
    if (file.name.endsWith('.csv')) {
      setUploadForm(prev => ({ ...prev, contentType: 'csv' }));
    } else if (file.name.endsWith('.txt')) {
      setUploadForm(prev => ({ ...prev, contentType: 'txt' }));
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      setUploadForm(prev => ({ ...prev, contentType: 'html' }));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };
  
  const submitNewNote = async () => {
    if (!uploadForm.subject || !uploadForm.topic || !uploadFileContent) {
      alert("Please fill all fields and upload a file.");
      return;
    }
    
    try {
      const newNoteRef = doc(collection(db, "study_notes"));
      const newNote: StudyNote = {
        id: newNoteRef.id,
        examId: uploadForm.examId,
        subject: uploadForm.subject,
        topic: uploadForm.topic,
        contentType: uploadForm.contentType,
        content: uploadFileContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(newNoteRef, {
        examId: uploadForm.examId,
        subject: uploadForm.subject,
        topic: uploadForm.topic,
        contentType: uploadForm.contentType,
        content: uploadFileContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('MOCK_STUDY_NOTES', JSON.stringify(updatedNotes));
      
      alert("Note uploaded successfully!");
      setIsUploadingNote(false);
      setUploadFileContent('');
      setUploadForm({ ...uploadForm, subject: '', topic: '' });
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    }
  };


  // Fetch Notes from Firestore with Local Cache optimization (0 Startup Reads)
  useEffect(() => {
    const loadNotes = async () => {
      const cached = localStorage.getItem('MOCK_STUDY_NOTES');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setNotes(parsed);
            console.log(`📦 Loaded ${parsed.length} study notes from local cache (saved 100% of startup reads)`);
            return;
          }
        } catch (e) {}
      }

      try {
        console.log("☁️ Fetching study notes from Firestore (Cache was empty)");
        const qSnap = await getDocs(collection(db, "study_notes"));
        const loadedNotes: StudyNote[] = [];
        qSnap.forEach(docSnap => {
          loadedNotes.push({
            id: docSnap.id,
            ...docSnap.data()
          } as StudyNote);
        });

        setNotes(loadedNotes);
        if (loadedNotes.length > 0) {
          localStorage.setItem('MOCK_STUDY_NOTES', JSON.stringify(loadedNotes));
          localStorage.setItem('MOCK_STUDY_NOTES_SEEDED', 'true');
        }

        // Trigger automatic seeding using a coordinated DB metadata flag to prevent infinite local re-uploads
        const locallySeeded = localStorage.getItem('MOCK_STUDY_NOTES_SEEDED') === 'true';
        if (loadedNotes.length === 0 && !isSeeding && !locallySeeded) {
          const sysDocRef = doc(db, "db_metadata", "system");
          const sysDoc = await getDoc(sysDocRef);
          const sysData = sysDoc.exists() ? sysDoc.data() : null;
          
          if (!sysData || !sysData.notesSeeded) {
            console.log("Notes collection is empty and has not been seeded yet. Triggering initial notes seeding...");
            setIsSeeding(true);
            const seededList: StudyNote[] = [];
            for (const note of SEED_NOTES) {
              const docRef = doc(db, "study_notes", note.id);
              const seededNote = {
                examId: note.examId,
                subject: note.subject,
                topic: note.topic,
                contentType: note.contentType,
                content: note.content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              await setDoc(docRef, seededNote);
              seededList.push({ id: note.id, ...seededNote } as StudyNote);
            }
            // Mark as seeded in Firestore to prevent other browsers from ever re-seeding if admin clears the list
            await setDoc(sysDocRef, { notesSeeded: true }, { merge: true });
            setNotes(seededList);
            localStorage.setItem('MOCK_STUDY_NOTES', JSON.stringify(seededList));
            localStorage.setItem('MOCK_STUDY_NOTES_SEEDED', 'true');
            setIsSeeding(false);
          }
        }
      } catch (err) {
        console.warn("Failed to load study notes from Firestore:", err);
      }
    };

    loadNotes();
  }, [isSeeding]);

  const triggerSeeding = async () => {
    setIsSeeding(true);
    localStorage.setItem('MOCK_STUDY_NOTES_SEEDED', 'true');
    try {
      const seededList: StudyNote[] = [];
      for (const note of SEED_NOTES) {
        const docRef = doc(db, "study_notes", note.id);
        const seededNote = {
          examId: note.examId,
          subject: note.subject,
          topic: note.topic,
          contentType: note.contentType,
          content: note.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, seededNote);
        seededList.push({ id: note.id, ...seededNote } as StudyNote);
      }
      setNotes(seededList);
      localStorage.setItem('MOCK_STUDY_NOTES', JSON.stringify(seededList));
    } catch (e) {
      console.error("Failed to seed default study notes:", e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this study note?")) {
      const updatedNotes = notes.filter(n => n.id !== noteId);
      // Optimistically remove from state so the note vanishes instantly from the screen
      setNotes(updatedNotes);
      localStorage.setItem('MOCK_STUDY_NOTES', JSON.stringify(updatedNotes));
      
      try {
        await deleteDoc(doc(db, "study_notes", noteId));
      } catch (err) {
        alert("Failed to delete note: " + err);
      }
    }
  };

  // Simple, high-fidelity CSV parser
  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.split(/\r?\n/);
    return lines
      .map(line => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      })
      .filter(row => row.length > 0 && row.some(cell => cell !== ''));
  };

  // Icon Resolver
  const renderSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    if (s.includes('computer') || s.includes('it') || s.includes('science')) return <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    if (s.includes('rajasthan') || s.includes('gk') || s.includes('culture')) return <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    if (s.includes('polity') || s.includes('constitution')) return <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    return <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
  };

  const examNames: Record<string, string> = {
    'exam-dsssb-it': 'DSSSB IT',
    'exam-dsssb-tgt': 'DSSSB TGT',
    'exam-rpsc-eo': 'RPSC EO'
  };

  // Filter notes by selected exam and global search query
  const filteredNotes = notes.filter(note => {
    if (note.examId !== activeExamId) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.subject.toLowerCase().includes(q) ||
      note.topic.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  // Group filtered notes by Subject
  const notesBySubject: Record<string, StudyNote[]> = {};
  filteredNotes.forEach(note => {
    if (!notesBySubject[note.subject]) {
      notesBySubject[note.subject] = [];
    }
    notesBySubject[note.subject].push(note);
  });

  const activeExamName = examNames[activeExamId] || activeExamId.toUpperCase();

  // Render highlighted search term
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-950/70 text-slate-900 dark:text-white px-0.5 rounded font-semibold">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      {/* HEADER SECTION */}
      {!viewingNote && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black font-display text-indigo-900 dark:text-indigo-400">Study Notes Hub</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onBackToHome}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 duration-150"
                title="Back to Home"
              >
                <Home className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setIsUploadingNote(true)}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-955/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-xl transition-colors cursor-pointer shadow-sm hover:scale-105 active:scale-95 duration-150 font-bold"
                  title="Upload New Note"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      
      {/* ADMIN UPLOAD MODAL */}
      {isAdmin && isUploadingNote && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-scale-up text-left">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Upload New Study Note
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Exam</label>
                <select 
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-bold"
                  value={uploadForm.examId}
                  onChange={e => setUploadForm({...uploadForm, examId: e.target.value})}
                >
                  <option value="exam-dsssb-it">DSSSB IT / PGT Computer Science</option>
                  <option value="exam-dsssb-tgt">DSSSB TGT General</option>
                  <option value="exam-rpsc-eo">RPSC EO/RO & RAS Pre</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mathematics"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-bold"
                    value={uploadForm.subject}
                    onChange={e => setUploadForm({...uploadForm, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Geometry"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-bold"
                    value={uploadForm.topic}
                    onChange={e => setUploadForm({...uploadForm, topic: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Upload File (HTML, CSV, TXT)</label>
                <input 
                  type="file" 
                  accept=".html,.csv,.txt,.htm"
                  onChange={handleFileUpload}
                  className="w-full text-sm p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploadFileContent && (
                  <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> File loaded ({uploadForm.contentType.toUpperCase()})
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => setIsUploadingNote(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitNewNote}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer flex justify-center items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PREMIUM NOTE READER */}
      {viewingNote ? (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 flex flex-col w-screen h-screen overflow-hidden animate-fade-in text-left font-sans">
          {/* Reader Header: Only back to home icon button */}
          <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 px-6 flex items-center justify-start shrink-0 shadow-sm">
            <button 
              onClick={() => {
                setViewingNote(null);
                setReaderSearchQuery('');
              }}
              className="p-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-700/50 shrink-0"
              title="Back to home"
            >
              <ArrowLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </button>
          </div>

          {/* Content Sandbox Scroller - Has massive padding-bottom pb-36 to avoid overlapping reading text with any elements/devices */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12 pb-36">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] p-6 md:p-10 shadow-lg">
              {/* Note meta and titles included inside the reading area directly */}
              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-2">
                  <span className="text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-md tracking-wider font-mono shadow-sm">
                    {viewingNote.subject}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2.5 py-1 rounded-md tracking-wider font-mono">
                    {examNames[viewingNote.examId] || viewingNote.examId.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-xl md:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-snug">
                  {viewingNote.topic}
                </h1>
              </div>

              {viewingNote.contentType === 'html' && (
                <div 
                  className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs md:text-sm space-y-4"
                  dangerouslySetInnerHTML={{ __html: viewingNote.content }}
                />
              )}

              {viewingNote.contentType === 'csv' && (() => {
                const data = parseCSV(viewingNote.content);
                if (data.length === 0) return <p className="text-xs text-slate-400 italic">Empty table file.</p>;
                const headers = data[0];
                const rows = data.slice(1);
                
                return (
                  <div className="space-y-4">
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 font-mono text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                          <tr>
                            {headers.map((h, i) => (
                              <th key={i} className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 select-none font-bold bg-slate-50/50 dark:bg-slate-900/50">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-150 dark:divide-slate-800/60">
                          {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 leading-normal">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {viewingNote.contentType === 'txt' && (
                <div className="relative">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed overflow-x-auto select-text">
                    {viewingNote.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* EXAM TABS SELECTOR & SEARCH SEARCHBAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            {/* Exam selector buttons */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(examNames).map((eId) => (
                <button
                  key={eId}
                  onClick={() => setActiveExamId(eId)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeExamId === eId
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {examNames[eId]}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search notes content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9.5 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-550/20 text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* MAIN NOTES AND CHAPTERS AREA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(notesBySubject).length > 0 ? (
              Object.keys(notesBySubject).map((subject) => {
                const subjectNotes = notesBySubject[subject];
                return (
                  <div 
                    key={subject}
                    className="bg-white dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800/80 rounded-[1.8rem] p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    {/* Subject Title Header */}
                    <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-xl">
                        {renderSubjectIcon(subject)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black font-display text-slate-800 dark:text-slate-100 uppercase tracking-tight">{subject}</h3>
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{subjectNotes.length} Note Sets Available</p>
                      </div>
                    </div>

                    {/* List of Note documents mapped to this subject */}
                    <div className="space-y-2.5">
                      {subjectNotes.map((note) => (
                        <div 
                          key={note.id}
                          onClick={() => setViewingNote(note)}
                          className="border border-slate-200 dark:border-slate-800/50 bg-slate-50/10 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-2xl p-4 transition-all duration-150 cursor-pointer group"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-indigo-600 transition">
                                  {note.topic}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1 min-w-0">
                                  <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded tracking-wider">
                                    {note.contentType}
                                  </span>
                                  <span className="text-[8.5px] font-mono text-slate-400 truncate max-w-xs select-none">
                                    Size: {Math.round(note.content.length / 1024 * 10) / 10} KB • Saved in cloud
                                  </span>
                                </div>
                              </div>

                              {/* Delete option if Admin is logged in */}
                              {isAdmin && (
                                <button
                                  onClick={(e) => handleDeleteNote(note.id, e)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer shrink-0"
                                  title="Delete note from Cloud"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>

                            {/* View details action */}
                            <div className="flex justify-end mt-1">
                              <span className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors">
                                Read Note →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-3">
                <FileCode className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">No study notes match your query</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isAdmin ? "Use the Study Notes Console inside the Admin Panel to publish HTML, CSV, or Text syllabus sheets." : "The syllabus sheets for this exam are currently being prepared by the administrator."}
                </p>
                {isAdmin && (
                  <button 
                    onClick={triggerSeeding}
                    disabled={isSeeding}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl hover:bg-indigo-700 transition"
                  >
                    {isSeeding ? "Seeding..." : "Load Premium Seed Notes"}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
