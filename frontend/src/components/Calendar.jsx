import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, parseISO } from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Calendar = () => {
  const { darkMode } = useContext(ThemeContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  // Get all days in the current month
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(monthStart);
    
    // Create array with empty spaces for days before the start of the month
    const blanks = Array.from({ length: startDay }, (_, i) => null);
    
    return [...blanks, ...days];
  };
  
  // Get tasks for a specific day
  const getTasksForDay = (date) => {
    if (!date) return [];
    
    // Convert date to midnight to match only the date part
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.targetDateTime) return false;
      
      // Parse the task date and set to midnight for date-only comparison
      const taskDate = parseISO(task.targetDateTime);
      taskDate.setHours(0, 0, 0, 0);
      
      return isSameDay(day, taskDate);
    });
  };
  
  // Determine the color indicator for a day based on tasks
  const getDayIndicator = (date) => {
    if (!date) return null;
    
    const tasksOnDay = getTasksForDay(date);
    
    if (tasksOnDay.length === 0) return null;
    
    // Check if there are high priority tasks
    const hasHighPriority = tasksOnDay.some(task => task.priority === 'High');
    
    // Check if there are overdue tasks
    const hasOverdue = tasksOnDay.some(task => {
      const taskDate = new Date(task.targetDateTime);
      return taskDate < new Date() && task.status !== 'Completed';
    });
    
    if (hasOverdue) return 'red';
    if (hasHighPriority) return 'orange';
    return 'green';
  };
  
  // Calendar grid
  const daysInMonth = getDaysInMonth();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate the number of rows needed (ceiling of days + blanks / 7)
  const rows = Math.ceil(daysInMonth.length / 7);
  
  // Tasks for the selected date
  const selectedDateTasks = selectedDate ? getTasksForDay(selectedDate) : [];
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-lg shadow-md border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button
            onClick={goToNextMonth}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Today
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div 
              key={index} 
              className={`text-center text-xs font-medium py-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className={`grid grid-cols-7 gap-1 ${loading ? 'opacity-50' : ''}`}>
          {daysInMonth.map((day, i) => {
            // Indicator color for tasks
            const indicator = day ? getDayIndicator(day) : null;
            
            // Determine if this day is selected
            const isSelected = selectedDate && day ? isSameDay(day, selectedDate) : false;
            
            // Get tasks for this day for the tooltip
            const tasksForDay = day ? getTasksForDay(day) : [];
            
            return (
              <div
                key={i}
                className={`relative h-12 sm:h-16 rounded-lg border 
                  ${!day ? 'border-transparent' : darkMode ? 'border-gray-700' : 'border-gray-200'}
                  ${isSelected ? (darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-100 border-blue-500') : ''}
                  ${isToday(day || new Date()) ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') : ''}
                `}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className={`
                      absolute top-1 left-1 text-xs font-medium
                      ${isToday(day) ? (darkMode ? 'text-green-400' : 'text-green-800') : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Task indicator */}
                    {indicator && (
                      <div 
                        className={`absolute bottom-1 right-1 w-3 h-3 rounded-full
                          ${indicator === 'red' ? 'bg-red-500' : 
                            indicator === 'orange' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }
                        `}
                        title={`${tasksForDay.length} task${tasksForDay.length !== 1 ? 's' : ''}`}
                      ></div>
                    )}
                    
                    {/* Task count (on larger screens) */}
                    {tasksForDay.length > 0 && (
                      <div className="hidden sm:block absolute bottom-1 left-1 text-xs">
                        {tasksForDay.length > 1 ? `${tasksForDay.length} tasks` : '1 task'}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Day Tasks */}
      {selectedDate && (
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <Link 
              to="/add-task" 
              className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              + Add Task
            </Link>
          </div>
          
          {selectedDateTasks.length > 0 ? (
            <div className={`max-h-60 overflow-y-auto pr-2 space-y-2 ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              {selectedDateTasks.map((task, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{task.subject}</div>
                      <div className="text-xs mt-1">
                        {task.targetDateTime && (
                          <span>{format(parseISO(task.targetDateTime), 'h:mm a')}</span>
                        )}
                      </div>
                    </div>
                    <div 
                      className={`px-1.5 py-0.5 rounded-full text-xs ${
                        task.priority === 'High' 
                          ? darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                            ? darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                            : darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority}
                    </div>
                  </div>
                  <div 
                    className={`mt-1 px-1.5 py-0.5 rounded-full text-xs inline-block ${
                      task.status === 'Completed'
                        ? darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                        : task.status === 'In Progress'
                          ? darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                          : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No tasks scheduled for this day
            </div>
          )}
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx="true">{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 4px;
        }
        
        .scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 4px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background-color: #D1D5DB;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
