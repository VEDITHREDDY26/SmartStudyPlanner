import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const NotificationSettings = () => {
  const { darkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    dailyReminder: true,
    taskReminders: true,
    weeklySummary: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/user-profile/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = response.data;
        setSettings({
          email: user.notifications?.email ?? true,
          push: user.notifications?.push ?? false,
          dailyReminder: user.emailPreferences?.dailyReminder ?? true,
          taskReminders: user.emailPreferences?.taskReminders ?? true,
          weeklySummary: user.emailPreferences?.weeklySummary ?? true,
        });
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    
    // Handle nested properties
    if (['dailyReminder', 'taskReminders', 'weeklySummary'].includes(name)) {
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to update settings');
        return;
      }

      await axios.put(
        `${API_BASE_URL}/user-profile/update`,
        {
          notifications: {
            email: settings.email,
            push: settings.push,
          },
          emailPreferences: {
            dailyReminder: settings.dailyReminder,
            taskReminders: settings.taskReminders,
            weeklySummary: settings.weeklySummary,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to send a test email');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/notifications/test-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-md`}>
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="email" className="font-medium">Enable Email Notifications</label>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receive important updates and reminders via email
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="email"
                    name="email"
                    checked={settings.email}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className={`relative w-11 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.email ? 'peer-checked:bg-blue-600' : ''}`}></div>
                </label>
              </div>

              {settings.email && (
                <div className="pl-1 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="dailyReminder" className="font-medium">Daily Task Reminder</label>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Get a daily email with your tasks for the day
                      </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="dailyReminder"
                        name="dailyReminder"
                        checked={settings.dailyReminder}
                        onChange={handleChange}
                        className="sr-only peer"
                        disabled={!settings.email}
                      />
                      <div className={`relative w-11 h-6 ${!settings.email ? 'bg-gray-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.dailyReminder && settings.email ? 'peer-checked:bg-blue-600' : ''}`}></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="taskReminders" className="font-medium">Task Reminders</label>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Get reminders for upcoming tasks
                      </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="taskReminders"
                        name="taskReminders"
                        checked={settings.taskReminders}
                        onChange={handleChange}
                        className="sr-only peer"
                        disabled={!settings.email}
                      />
                      <div className={`relative w-11 h-6 ${!settings.email ? 'bg-gray-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.taskReminders && settings.email ? 'peer-checked:bg-blue-600' : ''}`}></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="weeklySummary" className="font-medium">Weekly Summary</label>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Get a weekly summary of your progress
                      </p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="weeklySummary"
                        name="weeklySummary"
                        checked={settings.weeklySummary}
                        onChange={handleChange}
                        className="sr-only peer"
                        disabled={!settings.email}
                      />
                      <div className={`relative w-11 h-6 ${!settings.email ? 'bg-gray-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.weeklySummary && settings.email ? 'peer-checked:bg-blue-600' : ''}`}></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Push Notifications (Placeholder) */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="push" className="font-medium">Enable Push Notifications</label>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get real-time updates on your device
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="push"
                  name="push"
                  checked={settings.push}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className={`relative w-11 h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.push ? 'peer-checked:bg-blue-600' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={!settings.email || saving}
            className={`px-4 py-2 rounded-md ${!settings.email || saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}
          >
            Send Test Email
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded-md ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors flex items-center justify-center`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default NotificationSettings;
