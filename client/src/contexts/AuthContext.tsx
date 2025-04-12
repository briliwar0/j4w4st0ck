import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Omit<InsertUser, "password"> & { password: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log("User authenticated:", userData);
        } else {
          console.log("User not authenticated");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    userData: Omit<InsertUser, "password"> & { password: string }
  ): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);

      const newUser = await response.json();
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      // Invalidate queries that depend on auth
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
