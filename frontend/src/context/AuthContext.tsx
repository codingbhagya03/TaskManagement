import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  checkAuth: async () => false,
});

// Configure axios defaults
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Checking authentication status...");
      
      const response = await axios.get('http://localhost:5000/check-auth');
      console.log("Auth check response:", response.data);
      
      if (response.data.isAuthenticated && response.data.userId) {
        console.log("Server confirmed authentication is valid");
        
        try {
          const userResponse = await axios.get(`http://localhost:5000/api/users/${response.data.userId}`);
          
          if (userResponse.data) {
            const userData = {
              id: response.data.userId,
              name: userResponse.data.name,
              email: userResponse.data.email
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            return true;
          }
        } catch (userError) {
          console.error("Error fetching user details:", userError);
        }
      }
      
      // If we reach here, authentication failed
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Run checkAuth on component mount
  useEffect(() => {
    checkAuth();
    
    // Set up an interval to periodically check auth (optional)
    const intervalId = setInterval(() => {
      checkAuth();
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only on mount

  const login = (userData: User) => {
    console.log("Setting authenticated user:", userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("Logging out...");
      await axios.post('http://localhost:5000/logout');
      console.log("Logout API call successful");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};