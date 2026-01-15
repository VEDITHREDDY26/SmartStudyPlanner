import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import AddTask from "./components/AddTask";
import EditTask from "./components/EditTask"; // Import EditTask
import ViewTasks from "./components/ViewTasks";
import PomodoroTimer from "./components/PomodoroTimer";
import SpacedRepetition from "./components/SpacedRepetition";
import AddReviewTask from "./components/AddReviewTask";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";

import NotificationSettings from "./components/NotificationSettings";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
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

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/add-task"
            element={
              <PrivateRoute>
                <Layout>
                  <AddTask />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-task/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <EditTask />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Layout>
                  <ViewTasks />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pomodoro"
            element={
              <PrivateRoute>
                <Layout>
                  <PomodoroTimer />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <PrivateRoute>
                <Layout>
                  <SpacedRepetition />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/spaced-repetition"
            element={
              <PrivateRoute>
                <Layout>
                  <SpacedRepetition />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/add-review-task"
            element={
              <PrivateRoute>
                <Layout>
                  <AddReviewTask />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Layout>
                  <CalendarPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/notifications"
            element={
              <PrivateRoute>
                <Layout>
                  <div className="max-w-4xl mx-auto px-4 py-8">
                    <NotificationSettings />
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <Layout>
                  <ProgressTracker />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
