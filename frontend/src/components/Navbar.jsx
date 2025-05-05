import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Tasks', path: '/tasks', icon: '📝' },
    { name: 'Flashcards', path: '/flashcards', icon: '📚' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'Pomodoro', path: '/pomodoro', icon: '⏰' },
  ];

  return (
    <nav className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} 
      sticky top-0 z-40 border-b shadow-sm transition-all duration-300 py-2`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center mr-6 transition-transform hover:scale-105">
              <Link to="/dashboard" className="flex items-center">
                <span className={`text-2xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mr-2 transition-transform hover:rotate-5`}>
                  📚
                </span>
                <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  StudyHub
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex sm:items-center sm:ml-4 sm:space-x-4">
              {navLinks.map((link) => (
                <div key={link.path} className="transition-transform hover:-translate-y-0.5">
                  <Link
                    to={link.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${isActive(link.path)
                        ? darkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-indigo-50 text-indigo-700'
                        : darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <span className="mr-2 h-4 w-4">{link.icon}</span>
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Side - Add Task, Dark Mode & Logout */}
          <div className="flex items-center">
            {/* Add Task button */}
            <Link
              to="/add-task"
              className={`hidden sm:flex items-center mr-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105
                ${darkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
            >
              <svg className="mr-1.5 -ml-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Link>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full mx-2 transition-all duration-200 hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105
                ${darkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
            >
              <svg className="mr-1.5 -ml-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md transition-all duration-200 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg 
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                  stroke="currentColor" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
                <svg 
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                  stroke="currentColor" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`sm:hidden transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Add Task button for mobile */}
            <Link
              to="/add-task"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                darkMode 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Link>
            
            {/* Regular nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? darkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-indigo-50 text-indigo-700'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="mr-3 h-5 w-5">{link.icon}</span>
                  {link.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
