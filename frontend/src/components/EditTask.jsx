import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config/api";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "Medium",
    targetDateTime: "",
    status: "Not Started",
    category: "Study",
    tags: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const task = response.data;
      
      // Format date for datetime-local input
      let formattedDate = "";
      if (task.targetDateTime) {
        const date = new Date(task.targetDateTime);
        // Adjust to local timezone for input
        const offset = date.getTimezoneOffset() * 60000;
        formattedDate = new Date(date.getTime() - offset).toISOString().slice(0, 16);
      }

      setFormData({
        subject: task.subject || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        targetDateTime: formattedDate,
        status: task.status || "Not Started",
        category: task.category || "Study",
        tags: task.tags ? task.tags.join(", ") : ""
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError("Failed to load task details.");
      setLoading(false);
      toast.error("Failed to load task details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];
      
      const taskData = {
        ...formData,
        tags: tagsArray
      };
      
      await axios.put(
        `${API_BASE_URL}/tasks/${id}`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      toast.success("Task updated successfully!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error updating task:", err);
      const errorMessage = err.response?.data?.error || "An error occurred while updating the task.";
      setError(errorMessage);
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: "Study", label: "Study 📚" },
    { value: "Project", label: "Project 🛠️" },
    { value: "Assignment", label: "Assignment 📝" },
    { value: "Exam", label: "Exam 📄" },
    { value: "Reading", label: "Reading 📖" },
    { value: "Research", label: "Research 🔍" },
    { value: "Other", label: "Other 📌" }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} p-4`}>
      <ToastContainer position="top-right" theme={darkMode ? "dark" : "light"} />
      
      <div className="max-w-3xl mx-auto">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-lg shadow-md border transition-all`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Task</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Subject */}
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Task Name *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Enter task name"
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                  } border`}
                />
              </div>

              {/* Left Column */}
              <div className="space-y-5">
                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700'
                    } border`}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Priority
                  </label>
                  <div className="flex space-x-2">
                    <label className={`flex-1 flex items-center p-2 border rounded-lg cursor-pointer ${
                      formData.priority === 'Low' 
                        ? darkMode 
                          ? 'bg-green-900 border-green-700' 
                          : 'bg-green-100 border-green-200'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="priority"
                        value="Low"
                        checked={formData.priority === 'Low'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="ml-2 text-center w-full">🟢 Low</span>
                    </label>
                    <label className={`flex-1 flex items-center p-2 border rounded-lg cursor-pointer ${
                      formData.priority === 'Medium' 
                        ? darkMode 
                          ? 'bg-yellow-900 border-yellow-700' 
                          : 'bg-yellow-100 border-yellow-200'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="priority"
                        value="Medium"
                        checked={formData.priority === 'Medium'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="ml-2 text-center w-full">🟡 Medium</span>
                    </label>
                    <label className={`flex-1 flex items-center p-2 border rounded-lg cursor-pointer ${
                      formData.priority === 'High' 
                        ? darkMode 
                          ? 'bg-red-900 border-red-700' 
                          : 'bg-red-100 border-red-200'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="priority"
                        value="High"
                        checked={formData.priority === 'High'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="ml-2 text-center w-full">🔴 High</span>
                    </label>
                  </div>
                </div>

                {/* Target Date and Time */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="targetDateTime"
                    value={formData.targetDateTime}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700'
                    } border`}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700'
                    } border`}
                  >
                    <option value="Not Started">⚪ Not Started</option>
                    <option value="In Progress">🔄 In Progress</option>
                    <option value="Completed">✅ Completed</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Enter task description..."
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                    } border`}
                  ></textarea>
                </div>

                {/* Tags */}
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. math, homework, chapter1"
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                    } border`}
                  />
                </div>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                } ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Task...
                  </span>
                ) : (
                  'Update Task'
                )}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
