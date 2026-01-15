import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeContext } from '../context/ThemeContext';
import { API_BASE_URL } from '../config/api';

const AddReviewTask = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    isReviewTask: true
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.post(
        `${API_BASE_URL}/tasks/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Review task created successfully!');
      setFormData({
        subject: '',
        description: '',
        priority: 'Medium',
        isReviewTask: true
      });
      
      // Redirect to spaced repetition page after a brief delay
      setTimeout(() => {
        navigate('/spaced-repetition');
      }, 2000);
    } catch (error) {
      console.error('Error creating review task:', error);
      toast.error('Failed to create review task');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Create Review Task
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Add material you want to remember using spaced repetition.
          </p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`md:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`}>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="subject" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Question/Topic *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., What is the capital of France?"
                  className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Answer/Notes
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., Paris is the capital of France."
                  className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  This will be shown as the answer during review.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="priority" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Higher priority items will appear more prominently in your review queue.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/spaced-repetition')}
                  className={`mr-4 px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-${darkMode ? 'white' : 'gray-800'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Review Task'}
                </button>
              </div>
            </form>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-5 border`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Review Task Tips</h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-blue-800'}`}>
                  Effective Question Types:
                </h3>
                <ul className={`list-disc list-inside text-sm ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                  <li>Vocabulary terms and definitions</li>
                  <li>Formulas and their applications</li>
                  <li>Key concepts and explanations</li>
                  <li>Historical dates and events</li>
                  <li>Language phrases and translations</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <span className="font-bold">Tip:</span> Keep questions clear and specific. 
                  Break complex topics into multiple review tasks.
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-100'} border`}>
                <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                  <span className="font-bold">Best Practice:</span> Review daily for best results.
                  Consistent short reviews are more effective than occasional long sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReviewTask;
