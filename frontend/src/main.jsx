import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./config/axiosConfig"; // Import configuration to setup interceptors
import { AuthProvider } from "./context/AuthContext"; // Make sure path & casing are correct!
import "./app.css"; // Import your CSS file here


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
