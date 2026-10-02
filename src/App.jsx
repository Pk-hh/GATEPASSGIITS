import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./pages/Login";
import { PublicStudentPortal } from "./pages/PublicStudentPortal";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { HodDashboard } from "./pages/HodDashboard";
import { SecurityDashboard } from "./pages/SecurityDashboard";
import { PrincipalDashboard } from "./pages/PrincipalDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewPublicStudentPortal, setViewPublicStudentPortal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    switch (currentUser.role) {
      case "student":
        setActiveTab("dashboard");
        break;
      case "teacher":
        setActiveTab("approvals");
        break;
      case "hod":
        setActiveTab("hod-search");
        break;
      case "security":
        setActiveTab("scan");
        break;
      case "principal":
        setActiveTab("principal-overview");
        break;
      case "admin":
        setActiveTab("admin-users");
        break;
      default:
        setActiveTab("dashboard");
    }
  }, [currentUser?.role]);

  // If student portal selected without logging in
  if (viewPublicStudentPortal && !currentUser) {
    return (
      <div className="animate-in fade-in duration-300 ease-in-out">
        <PublicStudentPortal onGoToStaffLogin={() => setViewPublicStudentPortal(false)} />
      </div>
    );
  }

  // APP OPENS FIRST AT LOGIN PAGE
  if (!currentUser) {
    return (
      <div className="animate-in fade-in duration-300 ease-in-out">
        <Login 
          onLoginSuccess={() => setViewPublicStudentPortal(false)}
          onGoToStudentPortal={() => setViewPublicStudentPortal(true)}
        />
      </div>
    );
  }

  const renderRolePage = () => {
    switch (currentUser.role) {
      case "student":
        return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case "teacher":
        return <TeacherDashboard />;
      case "hod":
        return <HodDashboard />;
      case "security":
        return <SecurityDashboard />;
      case "principal":
        return <PrincipalDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-slate-800 flex flex-col font-sans selection:bg-[#0A2540] selection:text-white transition-colors duration-300">
      {/* Top Header Navbar */}
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <div key={activeTab + (currentUser?.role || "")} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
            {renderRolePage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
