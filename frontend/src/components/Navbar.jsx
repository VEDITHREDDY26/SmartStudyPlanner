import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Tasks', path: '/tasks', icon: '📝' },
    { name: 'Flashcards', path: '/flashcards', icon: '📚' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'Pomodoro', path: '/pomodoro', icon: '⏰' },
  ];

  // Shared styles
  const navShellBase =
    'max-w-7xl mx-auto px-4 py-3 rounded-2xl transition-all duration-300 backdrop-blur-xl border flex items-center justify-between shadow-lg';

  const navShellTop = darkMode
    ? 'bg-slate-900/70 border-white/10 shadow-lg'
    : 'bg-white/70 border-slate-200/60 shadow-md';

  const navShellScrolled = darkMode
    ? 'bg-slate-900/90 border-white/20 shadow-2xl'
    : 'bg-white/95 border-slate-200/80 shadow-2xl';

  const profilePanelBg = darkMode
    ? 'bg-slate-900/95 border border-white/10'
    : 'bg-white border border-slate-200 shadow-xl';

  const mobileMenuBg = darkMode
    ? 'bg-slate-900/95 border border-white/10'
    : 'bg-white border border-slate-200 shadow-lg';

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-8"
    >
      <div
        className={`${navShellBase} ${scrolled ? navShellScrolled : navShellTop
          }`}
      >
        {/* Logo + Desktop Nav */}
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center group">
            <motion.span
              className="text-2xl mr-2"
              whileHover={{ rotate: 20 }}
            >
              📚
            </motion.span>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              SmartStudyPlanner
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:ml-8 md:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group"
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span
                    className={`relative flex items-center ${active
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'
                      }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Add Task button (Desktop) */}
          <Link
            to="/add-task"
            className="hidden sm:flex items-center rounded-full border border-indigo-500/50 bg-indigo-500/90 hover:bg-indigo-400 text-white px-4 py-2 text-sm font-semibold shadow-md transition-colors"
          >
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Task
          </Link>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`p-2 rounded-full border transition-colors shadow-sm ${darkMode
              ? 'bg-slate-800 text-yellow-300 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </motion.button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className={`absolute right-0 mt-2 w-60 rounded-xl overflow-hidden ${profilePanelBg} z-50`}
                >
                  <div className="px-4 py-3 border-b border-white/5 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.name || 'Student'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || 'your-email@example.com'}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings/notifications"
                    className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Notification Settings
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-slate-500 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden mt-2"
          >
            <div className={`rounded-2xl px-3 pt-2 pb-3 space-y-1 backdrop-blur-xl ${mobileMenuBg}`}>
              <Link
                to="/add-task"
                className="flex items-center px-3 py-2 rounded-xl text-base font-medium bg-indigo-600/90 text-white shadow-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  className="mr-3 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Task
              </Link>

              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${active
                      ? 'bg-indigo-500/90 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;