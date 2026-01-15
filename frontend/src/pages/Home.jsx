import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';

const Home = () => {
  const { darkMode } = useContext(ThemeContext);

  const pageBg = darkMode
    ? 'bg-slate-950 text-white'
    : 'bg-slate-50 text-slate-900';

  const cardBg = darkMode
    ? 'bg-slate-900/80 border border-white/10'
    : 'bg-white/90 border border-slate-200/80';

  const featureCardBg = darkMode
    ? 'bg-slate-900/80 border border-white/10'
    : 'bg-white shadow-md border border-slate-200';

  const heroTextMuted = darkMode ? 'text-slate-100' : 'text-slate-700';

  const pillText = darkMode ? 'text-indigo-200' : 'text-indigo-700';

  return (
    <div className={`min-h-screen relative overflow-hidden ${pageBg}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient overlay to keep text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/95 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-[900px] h-[900px] bg-indigo-500/25 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-pink-500/25 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 px-4 sm:px-6 lg:px-8 py-6"
      >
        <div
          className={`max-w-7xl mx-auto flex justify-between items-center rounded-2xl px-6 py-3 backdrop-blur-xl shadow-lg ${cardBg}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold tracking-tight">
              SmartStudyPlanner
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold hover:underline underline-offset-4"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-md bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative z-10 pt-14 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold bg-black/20 border border-white/10 backdrop-blur-md mb-6"
          >
            <span className={pillText}>NEW</span>
            <span className={heroTextMuted}>
              Plan tasks · Focus deeply · Track your progress
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
          >
            <span className="block mb-1">
              Master Your
            </span>
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Study Journey
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className={`mt-3 max-w-2xl mx-auto text-lg md:text-xl font-medium ${heroTextMuted}`}
          >
            The ultimate study companion for students. Track tasks, stay focused
            with Pomodoro, and retain more with spaced repetition — all in one
            beautiful dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/signup"
              className="inline-flex justify-center items-center rounded-full px-8 py-3 text-base md:text-lg font-semibold shadow-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all hover:-translate-y-0.5"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="inline-flex justify-center items-center rounded-full px-8 py-3 text-base md:text-lg font-semibold border border-slate-400/60 bg-black/10 hover:bg-black/20 backdrop-blur-lg transition-all hover:-translate-y-0.5"
            >
              I already have an account
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-3 text-indigo-300">
              Features
            </h2>
            <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Everything you need to succeed
            </p>
            <p
              className={`mt-3 max-w-2xl mx-auto text-sm md:text-base ${heroTextMuted}`}
            >
              Built for busy students who want clarity, focus, and consistent
              progress — without the chaos of scattered notes and apps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '📝',
                title: 'Task Management',
                desc: 'Organize assignments, exams, and projects with due dates, priorities, and tags.',
              },
              {
                icon: '⏰',
                title: 'Pomodoro Timer',
                desc: 'Stay on track with focused study sessions and built-in break reminders.',
              },
              {
                icon: '🧠',
                title: 'Spaced Repetition',
                desc: 'Review flashcards at the right time so concepts stay in your long-term memory.',
              },
              {
                icon: '📊',
                title: 'Progress Tracking',
                desc: 'Visualize your streaks, completed tasks, and weekly study time.',
              },
              {
                icon: '🏆',
                title: 'Gamification',
                desc: 'Earn XP, unlock levels, and keep your motivation high with streaks and rewards.',
              },
              {
                icon: '📅',
                title: 'Smart Calendar',
                desc: 'See tasks and study blocks on a clean calendar so you never miss a deadline.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`rounded-2xl p-6 md:p-7 backdrop-blur-xl transition-all ${featureCardBg}`}
              >
                <div className="text-3xl md:text-4xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  {feature.title}
                </h3>
                <p className={`text-sm md:text-base ${heroTextMuted}`}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl py-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <p className={heroTextMuted}>
            &copy; {new Date().getFullYear()} SmartStudyPlanner. All rights
            reserved.
          </p>
          <p className={`text-xs ${heroTextMuted}`}>
            Built to help you stay organized, focused, and confident.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;