import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SpacedRepetition = () => {
  const { darkMode } = useContext(ThemeContext);
  
  const [reviewTasks, setReviewTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Load review tasks on component mount
  useEffect(() => {
    fetchDueReviewTasks();
  }, []);
  
  // Fetch due review tasks on component mount
  const fetchDueReviewTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to view review tasks');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/tasks/reviews/due', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReviewTasks(response.data);
      setLoading(false);
      
      if (response.data.length > 0) {
        setIsReviewMode(true);
      }
    } catch (error) {
      console.error('Error fetching review tasks:', error);
      setError('Failed to load review tasks');
      setLoading(false);
    }
  };
  
  // Handle completing a review
  const handleCompleteReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentTask = reviewTasks[currentTaskIndex];
      
      if (!token || !currentTask) {
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/tasks/reviews/complete',
        {
          taskId: currentTask._id,
          difficultyRating
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Show success message with next review date
      toast.success(`Review completed! Next review in ${response.data.nextReviewIn} days`);
      
      // Move to next task or finish
      if (currentTaskIndex < reviewTasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
        setShowAnswer(false);
        setDifficultyRating(3);
      } else {
        // All tasks reviewed
        setIsReviewMode(false);
        toast.info('All review tasks completed!');
      }
    } catch (error) {
      console.error('Error completing review:', error);
      toast.error('Failed to complete review');
    }
  };
  
  // Create a new review task
  const handleCreateReviewTask = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      // Add isReviewTask flag to form data
      const reviewTaskData = {
        ...formData,
        isReviewTask: true
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/tasks/reviews',
        reviewTaskData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Review task created successfully!');
      return response.data;
    } catch (error) {
      console.error('Error creating review task:', error);
      toast.error('Failed to create review task');
      throw error;
    }
  };
  
  // Add this function to update progress
  const updateProgress = async () => {
    try {
      await axios.post('/api/progress/flashcards-reviewed');
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  // Modify the handleDifficultyChange function
  const handleDifficultyChange = async (value) => {
    setDifficultyRating(value);
    // Update progress when a flashcard is reviewed
    await updateProgress();
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <ToastContainer />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Spaced Repetition</h1>
          <Link 
            to="/add-review-task" 
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            + Add Flashcard
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-4 ${darkMode ? 'bg-red-900/30 text-red-300 border-red-800' : 'bg-red-100 text-red-800 border-red-400'} rounded border mb-4`}>
            {error}
          </div>
        ) : isReviewMode && reviewTasks.length > 0 ? (
          // Review mode - show flashcards
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-8 border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Review Card {currentTaskIndex + 1} of {reviewTasks.length}
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                  {Math.round((currentTaskIndex / reviewTasks.length) * 100)}% Complete
                </div>
              </div>
              
              {/* Card content */}
              <div className={`mb-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 shadow-inner min-h-[200px]`}>
                <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reviewTasks[currentTaskIndex]?.subject}
                </h3>
                
                {showAnswer ? (
                  <div className="mt-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-md`}>
                      <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                        {reviewTasks[currentTaskIndex]?.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32">
                    <button
                      onClick={() => setShowAnswer(true)}
                      className={`px-4 py-2 ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md`}
                    >
                      Show Answer
                    </button>
                  </div>
                )}
              </div>
              
              {/* Rating controls - only show when answer is revealed */}
              {showAnswer && (
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    How difficult was it to recall?
                  </h3>
                  
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleDifficultyChange(rating)}
                        className={`px-4 py-2 rounded flex-1 ${
                          difficultyRating === rating
                            ? darkMode 
                              ? 'bg-blue-700 text-white' 
                              : 'bg-blue-500 text-white'
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleCompleteReview}
                      className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      {currentTaskIndex < reviewTasks.length - 1 ? 'Next Card' : 'Finish Review'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-5 border h-fit`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Review Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cards Left:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {reviewTasks.length - currentTaskIndex}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Difficulty:</span>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {reviewTasks[currentTaskIndex]?.difficultyRating}/5
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                    <span className="font-bold">Tip:</span> Rate items based on how difficult they were to recall. 
                    Harder items will be shown more frequently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No tasks to review - Show task creation form
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`md:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`}>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                No Review Tasks Due
              </h2>
              
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You have no tasks due for review right now. Create new review tasks or check back later.
              </p>
              
              <div className="flex space-x-4">
                <Link
                  to="/add-review-task"
                  className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  Create New Review Task
                </Link>
                
                <button
                  onClick={fetchDueReviewTasks}
                  className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-${darkMode ? 'white' : 'gray-800'}`}
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-5 border`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>About Spaced Repetition</h2>
              
              <div className="space-y-4">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Spaced repetition is a learning technique that involves reviewing information at increasing intervals.
                </p>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-blue-800'}`}>
                    How it works:
                  </h3>
                  <ul className={`list-disc list-inside text-sm ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                    <li>Create review tasks for material you want to remember</li>
                    <li>Review the material when prompted</li>
                    <li>Rate how difficult it was to recall</li>
                    <li>The system schedules the next review based on your rating</li>
                    <li>Hard items are shown more frequently</li>
                    <li>Easy items are shown less frequently</li>
                  </ul>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <span className="font-bold">Tip:</span> Create at least 5-10 review tasks 
                    for optimal learning benefits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetition;
