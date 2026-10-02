import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  FilePlus, 
  QrCode, 
  CheckSquare, 
  Search, 
  Scan, 
  BarChart3, 
  Users, 
  Shield,
  Clock,
  LogOut
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const role = currentUser?.role || "student";

  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
          { id: "apply", label: "Apply for Leave", icon: FilePlus },
          { id: "active-pass", label: "Active Gate Pass", icon: QrCode }
        ];
      case "teacher":
        return [
          { id: "approvals", label: "Class Approvals", icon: CheckSquare },
          { id: "all-leaves", label: "Class Leave History", icon: Clock }
        ];
      case "hod":
        return [
          { id: "hod-search", label: "Roll No Search", icon: Search },
          { id: "hod-approvals", label: "Department Approvals", icon: CheckSquare },
          { id: "dept-overview", label: "Dept Overview", icon: BarChart3 }
        ];
      case "security":
        return [
          { id: "scan", label: "Scan Gate Pass", icon: Scan },
          { id: "security-logs", label: "Entry/Exit Logs", icon: Clock }
        ];
      case "principal":
        return [
          { id: "principal-overview", label: "Executive Dashboard", icon: BarChart3 },
          { id: "all-dept-logs", label: "All Department Leaves", icon: Clock }
        ];
      case "admin":
        return [
          { id: "admin-users", label: "User Management", icon: Users },
          { id: "admin-logs", label: "System Audit Logs", icon: Shield }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between shadow-xs font-sans">
      <div className="space-y-6">
        
        {/* User Role Card */}
        <div className="p-3.5 bg-slate-100/70 border border-sky-200/80 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="px-2.5 py-1.5 rounded-xl bg-[#0A2540] text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
            {role}
          </div>
          <div className="text-xs truncate">
            <p className="font-black text-[#0A2540] truncate">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-600 font-semibold truncate">
              {currentUser?.branch || currentUser?.assignedBranch || currentUser?.department || currentUser?.role}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-black text-[#0A2540] uppercase tracking-widest mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all relative overflow-hidden ${
                  isActive
                    ? "bg-[#0A2540] text-white shadow-md shadow-slate-900/15"
                    : "text-slate-700 hover:text-[#0A2540] hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-300" : "text-[#0A2540]"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-4 bg-sky-400 rounded-full shadow-xs"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-200 mt-6">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-black text-red-700 hover:bg-red-50 rounded-2xl transition-all border border-red-200 active:scale-98 shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-red-700" />
          <span>Sign Out of Portal</span>
        </button>
      </div>
    </aside>
  );
};
