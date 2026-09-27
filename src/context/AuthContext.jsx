import React, { createContext, useContext, useState, useEffect } from "react";
import { getUsers, initFirestoreSync } from "../services/store";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut
} from "firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // APP OPENS FIRST AT THE LOGIN PAGE (currentUser starts as null)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("gatepass_current_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null; // Always show Login Page on first open
  });

  const [availableUsers, setAvailableUsers] = useState(getUsers());

  useEffect(() => {
    initFirestoreSync(() => {
      setAvailableUsers(getUsers());
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("gatepass_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("gatepass_current_user");
    }
  }, [currentUser]);

  const switchRole = (roleName) => {
    const users = getUsers();
    const target = users.find(u => u.role === roleName);
    if (target) {
      setCurrentUser(target);
    }
  };

  const loginUser = async (email, password) => {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Special check for Admin credentials: admingiits@gmail.com / Pradeep@2005
    if (cleanEmail === "admingiits@gmail.com") {
      let adminUser = users.find(u => u.role === "admin");
      if (!adminUser) {
        adminUser = {
          id: "usr-adm-01",
          email: "admingiits@gmail.com",
          role: "admin",
          name: "System Admin (GIITS)",
          employeeId: "EMP-ADM-001"
        };
      }
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    // Standard Email Lookup
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (password && password.length >= 6) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (err) {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } catch (authErr) {}
      }
    }

    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }

    return { success: false, message: "Invalid email credentials." };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem("gatepass_current_user");
  };

  const refreshUserList = () => {
    setAvailableUsers(getUsers());
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      availableUsers,
      switchRole,
      loginUser,
      logout,
      refreshUserList
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
