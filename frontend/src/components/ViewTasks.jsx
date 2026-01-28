import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeContext } from "../context/ThemeContext";
import { API_BASE_URL } from "../config/api";

const ViewTasks = () => {
  const { darkMode } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    description: "",
    priority: "Low",
    targetDateTime: "",
    status: "Not Started"
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to view tasks.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task._id);
    setEditForm({
      subject: task.subject,
      description: task.description || "",
      priority: task.priority,
      targetDateTime: task.targetDateTime ? new Date(task.targetDateTime).toISOString().slice(0, 16) : "",
      status: task.status
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to update tasks.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Task status updated!");
      // Update the local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error("Error updating task status:", err);
      toast.error("Failed to update task status.");
    }
  };

  const handleSaveEdit = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to update tasks.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/tasks/${taskId}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Task updated successfully!");
      // Reset state and refresh tasks
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to delete tasks.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Task deleted successfully!");
      // Update local state by filtering out the deleted task
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task.");
    }
  };

  // Color mappings for priority and status
  const priorityColors = {
    "High": darkMode 
      ? "bg-red-900/30 text-red-300 border-red-800" 
      : "bg-red-100 text-red-800 border-red-500",
    "Medium": darkMode 
      ? "bg-yellow-900/30 text-yellow-300 border-yellow-800" 
      : "bg-yellow-100 text-yellow-800 border-yellow-500",
    "Low": darkMode 
      ? "bg-green-900/30 text-green-300 border-green-800" 
      : "bg-green-100 text-green-800 border-green-500"
  };

  const statusColors = {
    "Not Started": darkMode 
      ? "bg-gray-700 text-gray-300 border-gray-600" 
      : "bg-gray-100 text-gray-800 border-gray-300",
    "In Progress": darkMode 
      ? "bg-blue-900/30 text-blue-300 border-blue-800" 
      : "bg-blue-100 text-blue-800 border-blue-500",
    "Completed": darkMode 
      ? "bg-green-900/30 text-green-300 border-green-800" 
      : "bg-green-100 text-green-800 border-green-500",
    "Deferred": darkMode 
      ? "bg-yellow-900/30 text-yellow-300 border-yellow-800" 
      : "bg-yellow-100 text-yellow-800 border-yellow-500"
  };

  return (
    <div className={`min-h-screen py-8 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Tasks</h1>
        </div>

        {error ? (
          <div className={`p-4 ${darkMode ? "bg-red-900/30 text-red-300 border-red-800" : "bg-red-100 text-red-800 border-red-400"} border rounded mb-4`}>
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md border p-8 text-center`}>
            <p className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4`}>No tasks found</p>
            <a
              href="/add-task"
              className={`inline-block px-6 py-3 rounded-md ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white`}
            >
              Add New Task
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-md border overflow-hidden`}>
                <div className="p-5">
                {editingTask === task._id ? (
                  // Edit form
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={editForm.subject}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows="3"
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md`}
                      ></textarea>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={editForm.priority}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                        Due Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        name="targetDateTime"
                        value={editForm.targetDateTime}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Deferred">Deferred</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className={`px-4 py-2 text-sm font-medium ${darkMode ? "text-gray-300 bg-gray-700 hover:bg-gray-600" : "text-gray-700 bg-gray-200 hover:bg-gray-300"} rounded-md`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(task._id)}
                        className={`px-4 py-2 text-sm font-medium text-white ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} rounded-md`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // Task view 
                  <>
                    <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                      {task.subject}
                    </h2>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-2`}>
                      {task.description || "No description"}
                    </p>

                    <div className={`mt-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} space-y-2`}>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority} Priority
                        </span>
                      </p>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                      </p>
                      <p>
                        <strong>Due:</strong>{" "}
                        {task.targetDateTime
                          ? new Date(task.targetDateTime).toLocaleString()
                          : "Not set"}
                      </p>
                    </div>

                    {/* Quick Status Update */}
                    <div className="mt-4">
                      <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>Update Status:</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateStatus(task._id, "Not Started")}
                          className={`px-2 py-1 text-xs font-medium ${darkMode ? "text-gray-300 bg-gray-700 hover:bg-gray-600" : "text-gray-700 bg-gray-200 hover:bg-gray-300"} rounded-md`}
                        >
                          Not Started
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(task._id, "In Progress")}
                          className={`px-2 py-1 text-xs font-medium text-white ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} rounded-md`}
                        >
                          In Progress
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(task._id, "Completed")}
                          className={`px-2 py-1 text-xs font-medium text-white ${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} rounded-md`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(task)}
                        className={`px-3 py-1 text-sm font-medium ${darkMode ? "text-blue-300 border-blue-700 hover:bg-blue-900/30" : "text-blue-700 border-blue-700 hover:bg-blue-50"} border rounded-md`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className={`px-3 py-1 text-sm font-medium ${darkMode ? "text-red-300 border-red-700 hover:bg-red-900/30" : "text-red-700 border-red-700 hover:bg-red-50"} border rounded-md`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTasks;
