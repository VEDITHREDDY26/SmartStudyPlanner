import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Check if the stored object has a nested 'user' property (legacy fix)
    return parsed.user ? parsed.user : parsed;
  });

  const login = (userData) => {
    // Handle both { user, token } structure and direct user object
    const userToSave = userData.user || userData;
    
    setUser(userToSave);
    localStorage.setItem("user", JSON.stringify(userToSave));
    
    // Store token if present
    if (userData.token) {
        localStorage.setItem("token", userData.token); 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅ Clear token on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
