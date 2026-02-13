import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role } from '../types';
import { SURVEY_QUESTIONS, GOOGLE_SCRIPT_URL } from '../constants';

// Variants for animations
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
};

export const Survey: React.FC = () => {
  const [step, setStep] = useState<'check' | 'intro' | 'test' | 'end'>('check');
  const [hasParticipated, setHasParticipated] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [otherDetail, setOtherDetail] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const localCheck = localStorage.getItem('ki_survey_done');
    if (localCheck === 'true') {
      setHasParticipated(true);
    }
    setStep(localCheck === 'true' ? 'check' : 'intro');
  }, []);

  const startTest = () => {
    if (name && role) {
      if (role === Role.Other && !otherDetail) return;
      setStep('test');
    }
  };

  const handleAnswer = (isAIChoice: boolean) => {
    const currentQ = SURVEY_QUESTIONS[currentQuestionIndex];
    const isActuallyAI = currentQ.id % 2 === 0;
    const isCorrect = isAIChoice === isActuallyAI;

    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (currentQuestionIndex < SURVEY_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300); // Small delay for animation
    } else {
      submitResults(newAnswers);
    }
  };

  const submitResults = async (finalAnswers: boolean[]) => {
    setIsSubmitting(true);
    setStep('end');

    const score = finalAnswers.filter(a => a).length;
    const percentage = (score / SURVEY_QUESTIONS.length) * 100;
    
    const payload = {
      name,
      role,
      otherDetail: role === Role.Other ? otherDetail : '',
      score,
      percentage,
      rawAnswers: JSON.stringify(finalAnswers)
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      localStorage.setItem('ki_survey_done', 'true');
    } catch (error) {
      console.error("Submission error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasParticipated && step === 'check') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
         <motion.div 
           initial="hidden" animate="visible" variants={containerVariants}
           className="bg-black/60 backdrop-blur-xl border border-red-500/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)] max-w-md w-full text-center"
         >
           <div className="text-6xl mb-4 opacity-80">🛑</div>
           <h2 className="text-3xl font-bold font-orbitron text-red-500 mb-4 tracking-wider">ZUGRIFF VERWEIGERT</h2>
           <p className="text-gray-400 font-mono">ID bereits im System registriert. Eine erneute Teilnahme ist nicht möglich.</p>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative z-20">
      <AnimatePresence mode='wait'>
        
        {/* INTRO SCREEN */}
        {step === 'intro' && (
          <motion.div 
            key="intro"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="w-full max-w-lg bg-[#0a0a0f]/80 backdrop-blur-xl border border-cyan-500/30 p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(8,145,178,0.15)] relative overflow-hidden"
          >
            {/* Decor Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>

            <motion.div variants={textVariants} className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 glow-text">
                KI-DETEKTOR
              </h1>
              <p className="text-cyan-200/60 font-mono text-sm tracking-widest uppercase">Mensch oder Maschine? Teste deine Wahrnehmung.</p>
            </motion.div>
            
            <div className="space-y-6 relative z-10">
              <div className="group">
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 font-orbitron group-focus-within:text-cyan-300 transition-colors">
                  Codename / Name
                </label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Eingabe..."
                />
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 font-orbitron group-focus-within:text-cyan-300 transition-colors">
                  Rolle / Status
                </label>
                <div className="relative">
                    <select 
                      className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none font-mono cursor-pointer"
                      value={role}
                      onChange={e => setRole(e.target.value as Role)}
                    >
                      <option value="" disabled>Selektieren...</option>
                      {Object.values(Role).map(r => (
                        <option key={r} value={r} className="bg-gray-900">{r}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-cyan-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                    </div>
                </div>
              </div>

              <AnimatePresence>
                {role === Role.Other && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 font-orbitron">
                      Spezifizierung
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-black/50 border border-purple-500/50 rounded-lg p-4 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-all font-mono"
                      value={otherDetail}
                      onChange={e => setOtherDetail(e.target.value)}
                      placeholder="Details eingeben..."
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={startTest}
                disabled={!name || !role || (role === Role.Other && !otherDetail)}
                className="w-full py-4 mt-8 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black font-orbitron tracking-[0.2em] uppercase rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                INITIALISIEREN
              </button>
            </div>
          </motion.div>
        )}

        {/* TEST SCREEN */}
        {step === 'test' && (
          <motion.div 
            key="test"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="w-full max-w-4xl"
          >
            {/* Progress HUD */}
            <div className="flex justify-between items-end mb-6 px-2">
                <div className="font-mono text-cyan-400 text-sm">
                    <span className="opacity-50">SAMPLE:</span> 
                    <span className="font-bold text-lg ml-2">{currentQuestionIndex + 1}</span>
                    <span className="mx-1 opacity-50">/</span>
                    <span className="opacity-50">{SURVEY_QUESTIONS.length}</span>
                </div>
                <div className="flex-grow mx-6 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex) / SURVEY_QUESTIONS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="font-mono text-xs text-cyan-500/50 animate-pulse">ANALYSING STREAM...</div>
            </div>

            {/* Question Card */}
            <div className="relative bg-black/40 backdrop-blur-md border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl min-h-[300px] flex flex-col">
                {/* Decorative UI Overlay */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute inset-0 scanlines opacity-10 pointer-events-none"></div>

                <div className="p-8 md:p-12 flex-grow flex items-center justify-center">
                    <AnimatePresence mode='wait'>
                        <motion.p 
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(5px)' }}
                            transition={{ duration: 0.4 }}
                            className="text-xl md:text-2xl leading-relaxed font-sans text-gray-100 font-light tracking-wide text-center max-w-3xl"
                        >
                            "{SURVEY_QUESTIONS[currentQuestionIndex].text}"
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <button 
                  onClick={() => handleAnswer(true)}
                  className="group relative overflow-hidden py-6 rounded-xl border border-fuchsia-600/50 bg-fuchsia-900/10 hover:bg-fuchsia-900/30 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-fuchsia-600/10 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative z-10 flex flex-col items-center">
                        <span className="text-3xl mb-2 filter drop-shadow-[0_0_5px_rgba(192,38,211,0.8)]">🤖</span>
                        <span className="font-orbitron font-bold text-fuchsia-400 tracking-widest text-xl group-hover:text-fuchsia-300 group-hover:drop-shadow-[0_0_8px_rgba(192,38,211,0.8)]">DAS IST KI</span>
                    </span>
                </button>

                <button 
                  onClick={() => handleAnswer(false)}
                  className="group relative overflow-hidden py-6 rounded-xl border border-emerald-500/50 bg-emerald-900/10 hover:bg-emerald-900/30 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-emerald-500/10 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative z-10 flex flex-col items-center">
                        <span className="text-3xl mb-2 filter drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">👤</span>
                        <span className="font-orbitron font-bold text-emerald-400 tracking-widest text-xl group-hover:text-emerald-300 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">DAS IST MENSCH</span>
                    </span>
                </button>
            </div>
          </motion.div>
        )}

        {/* END SCREEN */}
        {step === 'end' && (
          <motion.div 
            key="end"
            variants={containerVariants}
            initial="hidden" animate="visible"
            className="text-center max-w-md w-full"
          >
            {isSubmitting ? (
              <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-cyan-500/30 p-12 rounded-3xl shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-orbitron text-cyan-400 animate-pulse">DATENÜBERTRAGUNG...</h2>
                <div className="font-mono text-xs text-cyan-600 mt-2">ENCRYPTING RESULTS</div>
              </div>
            ) : (
              <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-green-500/30 p-12 rounded-3xl shadow-[0_0_60px_rgba(34,197,94,0.15)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="text-6xl mb-6"
                >
                    🎉
                </motion.div>
                <h2 className="text-3xl font-black font-orbitron text-white mb-2">ANALYSE ABGESCHLOSSEN</h2>
                <p className="text-green-400 font-mono mb-8">Vielen Dank für deine Teilnahme.</p>
                <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-300 font-mono text-sm">
                    SESSION TERMINATED
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};