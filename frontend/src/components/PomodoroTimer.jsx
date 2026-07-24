import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import ReactConfetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import useWindowSize from 'react-use/lib/useWindowSize';
import axios from 'axios';

const PomodoroTimer = () => {
  const { darkMode } = useContext(ThemeContext);
  const { width, height } = useWindowSize();

  // Timer settings
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);

  // Timer state
  const [mode, setMode] = useState('work'); // 'work', 'break', 'longBreak'
  const [timeRemaining, setTimeRemaining] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Animation states
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFlowers, setShowFlowers] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // In-component notification
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  // Persistent AudioContext — created and unlocked on the first Start click
  const audioCtxRef = useRef(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  // Web Audio API beep — reuses the already-unlocked AudioContext
  const playBeep = useCallback((isWorkComplete) => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      // Resume in case browser suspended it (shouldn't happen after Start click)
      const doPlay = () => {
        // Work complete → 3 ascending tones (C5 → E5 → G5)
        // Break complete → 2 descending tones (G5 → E5)
        const tones = isWorkComplete
          ? [{ freq: 523, t: 0 }, { freq: 659, t: 0.22 }, { freq: 784, t: 0.44 }]
          : [{ freq: 784, t: 0 }, { freq: 523, t: 0.25 }];

        tones.forEach(({ freq, t }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
          gain.gain.setValueAtTime(0.45, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.35);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.35);
        });
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(doPlay);
      } else {
        doPlay();
      }
    } catch (e) {
      console.log('Audio failed:', e);
    }
  }, []);

  const showNotification = useCallback((config) => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNotification(config);
    notificationTimerRef.current = setTimeout(() => setNotification(null), 7000);
  }, []);

  // Cleanup notification timer on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, []);

  // Initialize timer when work minutes change
  useEffect(() => {
    if (mode === 'work') {
      setTimeRemaining(workMinutes * 60);
    }
  }, [workMinutes, mode]);

  // Initialize timer when break minutes change
  useEffect(() => {
    if (mode === 'break') {
      setTimeRemaining(breakMinutes * 60);
    } else if (mode === 'longBreak') {
      setTimeRemaining(longBreakMinutes * 60);
    }
  }, [breakMinutes, longBreakMinutes, mode]);

  const updateProgress = async () => {
    try {
      await axios.post('/api/progress/completed-pomodoros');
      await axios.post('/api/progress/study-time', { minutes: workMinutes });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(seconds => seconds - 1);
        if (timeRemaining % 60 === 0) {
          setPulseAnimation(true);
          setTimeout(() => setPulseAnimation(false), 1000);
        }
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      if (mode === 'work') {
        playBeep(true);

        setShowConfetti(true);
        setShowFlowers(true);
        setTimeout(() => { setShowConfetti(false); setShowFlowers(false); }, 5000);

        const newSession = { type: 'work', duration: workMinutes, completedAt: new Date().toISOString() };
        setSessionHistory(prev => [newSession, ...prev]);
        updateProgress();

        const newCompletedSessions = completedSessions + 1;
        setCompletedSessions(newCompletedSessions);

        if (newCompletedSessions % sessionsBeforeLongBreak === 0) {
          setMode('longBreak');
          setTimeRemaining(longBreakMinutes * 60);
          showNotification({
            icon: '🎉',
            title: 'Work Session Complete!',
            message: `Excellent focus! You've earned a long break (${longBreakMinutes} min).`,
            color: 'emerald',
          });
        } else {
          setMode('break');
          setTimeRemaining(breakMinutes * 60);
          showNotification({
            icon: '✅',
            title: 'Work Session Complete!',
            message: `Great work! Take a short break (${breakMinutes} min).`,
            color: 'blue',
          });
        }
      } else {
        playBeep(false);

        const newSession = {
          type: mode === 'break' ? 'shortBreak' : 'longBreak',
          duration: mode === 'break' ? breakMinutes : longBreakMinutes,
          completedAt: new Date().toISOString(),
        };
        setSessionHistory(prev => [newSession, ...prev]);
        setMode('work');
        setTimeRemaining(workMinutes * 60);
        showNotification({
          icon: '⏰',
          title: 'Break Complete!',
          message: "You're refreshed — time to focus again!",
          color: 'red',
        });
      }

      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, mode, workMinutes, breakMinutes, longBreakMinutes, completedSessions, sessionsBeforeLongBreak, playBeep, showNotification]);

  const toggleTimer = () => {
    if (!isActive) {
      // Create and unlock AudioContext on the user gesture so the beep
      // can play later from inside a useEffect (where gestures don't reach).
      const ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') setTimeRemaining(workMinutes * 60);
    else if (mode === 'break') setTimeRemaining(breakMinutes * 60);
    else setTimeRemaining(longBreakMinutes * 60);
  };

  const skipTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      if ((completedSessions + 1) % sessionsBeforeLongBreak === 0) {
        setMode('longBreak');
        setTimeRemaining(longBreakMinutes * 60);
      } else {
        setMode('break');
        setTimeRemaining(breakMinutes * 60);
      }
    } else {
      setMode('work');
      setTimeRemaining(workMinutes * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalSeconds =
      mode === 'work' ? workMinutes * 60 :
      mode === 'break' ? breakMinutes * 60 :
      longBreakMinutes * 60;
    return (1 - timeRemaining / totalSeconds) * 100;
  };

  const getModeColor = () => {
    if (darkMode) {
      if (mode === 'work') return { bg: 'bg-red-900/20', text: 'text-red-400', border: 'border-red-800', button: 'bg-red-700 hover:bg-red-600' };
      if (mode === 'break') return { bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-800', button: 'bg-green-700 hover:bg-green-600' };
      return { bg: 'bg-blue-900/20', text: 'text-blue-400', border: 'border-blue-800', button: 'bg-blue-700 hover:bg-blue-600' };
    } else {
      if (mode === 'work') return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', button: 'bg-red-500 hover:bg-red-400' };
      if (mode === 'break') return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', button: 'bg-green-500 hover:bg-green-400' };
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', button: 'bg-blue-500 hover:bg-blue-400' };
    }
  };

  const FlowerAnimation = () => {
    const flowerElements = [];
    for (let i = 0; i < 5; i++) {
      const size = Math.random() * 30 + 20;
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      flowerElements.push(
        <motion.div
          key={i}
          initial={{ y: -100, x: `${left}vw`, opacity: 0, rotate: 0 }}
          animate={{ y: '100vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 6, delay, ease: 'easeInOut' }}
          className="fixed top-0 z-50 pointer-events-none"
          style={{ left: `${left}%` }}
        >
          <span style={{ fontSize: `${size}px` }}>
            {['🌸', '🌹', '🌻', '🌼', '🌺'][Math.floor(Math.random() * 5)]}
          </span>
        </motion.div>
      );
    }
    return <>{flowerElements}</>;
  };

  // Notification color maps
  const notifColors = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-400/40',
      title: 'text-emerald-700 dark:text-emerald-300',
      bar: 'bg-emerald-500',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-400/40',
      title: 'text-blue-700 dark:text-blue-300',
      bar: 'bg-blue-500',
    },
    red: {
      bg: 'bg-red-500/10 dark:bg-red-500/20 border-red-400/40',
      title: 'text-red-700 dark:text-red-300',
      bar: 'bg-red-500',
    },
  };

  const colors = getModeColor();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Confetti */}
        {showConfetti && (
          <ReactConfetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.15}
            colors={['#FF69B4', '#FFC67D', '#8BC34A', '#64B5F6', '#BA68C8']}
          />
        )}

        {/* Flower animation */}
        {showFlowers && <FlowerAnimation />}

        {/* Page header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Stay focused and productive with timed work sessions
          </p>
        </motion.div>

        {/* ── In-component notification banner ── */}
        <AnimatePresence>
          {notification && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`mb-6 rounded-2xl border overflow-hidden shadow-xl ${notifColors[notification.color].bg}`}
            >
              {/* Progress bar that shrinks over 7 s */}
              <motion.div
                className={`h-1 ${notifColors[notification.color].bar}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 7, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
              />

              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{notification.icon}</span>
                  <div>
                    <p className={`font-bold text-lg leading-tight ${notifColors[notification.color].title}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main timer card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden mb-8`}>

          {/* Timer display */}
          <motion.div
            className={`p-6 ${colors.bg} flex flex-col md:flex-row items-center justify-between border-b ${colors.border}`}
            animate={{ scale: pulseAnimation ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mode indicator */}
            <div className="mb-4 md:mb-0 md:mr-8 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} mb-2`}
              >
                {mode === 'work' ? '🎯 Work Session' : mode === 'break' ? '☕ Short Break' : '🌴 Long Break'}
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={mode}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-sm mt-1"
              >
                Session {completedSessions + 1}
              </motion.div>
            </div>

            {/* Circular countdown */}
            <div className="flex-1 flex justify-center items-center mb-4 md:mb-0">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className={`${darkMode ? 'stroke-gray-700' : 'stroke-gray-200'}`}
                    cx="50" cy="50" r="45"
                    fill="transparent" strokeWidth="8"
                  />
                  <motion.circle
                    className={`stroke-current ${colors.text}`}
                    cx="50" cy="50" r="45"
                    fill="transparent" strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progressPercentage / 100 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    strokeDasharray="283"
                    strokeDashoffset="0"
                  />
                </svg>
                <motion.div
                  className={`absolute text-4xl font-bold ${colors.text}`}
                  animate={{ scale: pulseAnimation ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`px-4 py-2 rounded-lg text-white ${colors.button} shadow-md transition-colors duration-300`}
              >
                {isActive ? (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-300`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={skipTimer}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-300`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Settings */}
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
              Timer Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Work Duration (minutes)', value: workMinutes, min: 1, max: 60, onChange: (v) => setWorkMinutes(v || 25) },
                { label: 'Break Duration (minutes)', value: breakMinutes, min: 1, max: 30, onChange: (v) => setBreakMinutes(v || 5) },
                { label: 'Long Break Duration (minutes)', value: longBreakMinutes, min: 5, max: 60, onChange: (v) => setLongBreakMinutes(v || 15) },
                { label: 'Sessions Before Long Break', value: sessionsBeforeLongBreak, min: 1, max: 10, onChange: (v) => setSessionsBeforeLongBreak(v || 1) },
              ].map(({ label, value, min, max, onChange }) => (
                <div key={label}>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md`}
                  />
                </div>
              ))}
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              className={`mt-6 p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg`}
            >
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-300' : 'text-blue-700'}>Completed Sessions</span>
                <motion.span
                  className={`font-semibold ${darkMode ? 'text-white' : 'text-blue-800'}`}
                  key={completedSessions}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {completedSessions}
                </motion.span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-5 border`}
          >
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
              Session History
            </h2>

            <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg`}>
              <table className="min-w-full divide-y divide-gray-700">
                <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                  <tr>
                    {['Type', 'Duration', 'Completed At'].map(h => (
                      <th key={h} scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                  {sessionHistory.map((session, index) => (
                    <motion.tr
                      key={index}
                      className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          session.type === 'work'
                            ? darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                            : session.type === 'shortBreak'
                              ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                              : darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {session.type === 'work' ? 'Work' : session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {session.duration} minutes
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(session.completedAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
