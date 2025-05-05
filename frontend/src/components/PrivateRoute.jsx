import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    // Check if there's a token in localStorage or a user in context
    const token = localStorage.getItem("token");
    const hasAuth = token !== null || user !== null;
    setIsAuthenticated(hasAuth);
  }, [user]);
  
  if (isAuthenticated === null) {
    // Still checking authentication, show loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
