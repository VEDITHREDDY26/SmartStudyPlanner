import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import AddTask from "./components/AddTask";
import ViewTasks from "./components/ViewTasks";
import PomodoroTimer from "./components/PomodoroTimer";
import SpacedRepetition from "./components/SpacedRepetition";
import AddReviewTask from "./components/AddReviewTask";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import './App.css';
import ProgressTracker from './components/ProgressTracker';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Navbar */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Navbar />
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-task"
            element={
              <PrivateRoute>
                <Navbar />
                <AddTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Navbar />
                <ViewTasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/pomodoro"
            element={
              <PrivateRoute>
                <Navbar />
                <PomodoroTimer />
              </PrivateRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <PrivateRoute>
                <Navbar />
                <SpacedRepetition />
              </PrivateRoute>
            }
          />
          <Route
            path="/spaced-repetition"
            element={
              <PrivateRoute>
                <Navbar />
                <SpacedRepetition />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-review-task"
            element={
              <PrivateRoute>
                <Navbar />
                <AddReviewTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Navbar />
                <CalendarPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Navbar />
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <Navbar />
                <ProgressTracker />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
