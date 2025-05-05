import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({ subject: "", description: "", priority: "Low", targetDate: "", status: "Not Started" });

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  const handleChange = (e) => setTask({ ...task, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5000/api/tasks/create", task, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      toast.success("Task created successfully!");
    } catch (err) {
      toast.error("Error creating task");
    }
  };

  const handleDelete = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <form onSubmit={handleSubmit}>
        <input name="subject" value={task.subject} onChange={handleChange} placeholder="Subject" />
        <textarea name="description" value={task.description} onChange={handleChange} placeholder="Description" />
        <select name="priority" value={task.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input type="datetime-local" name="targetDate" value={task.targetDate} onChange={handleChange} />
        <select name="status" value={task.status} onChange={handleChange}>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            {task.subject} - {task.status} <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
