import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getUsers, 
  saveUsers, 
  updateUserPassword, 
  updateUserDetails, 
  getApplications, 
  adminUpdateApplication, 
  adminDeleteApplication,
  getGateLogs,
  adminDeleteLog
} from "../services/store";
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Sparkles,
  Key,
  X,
  Edit,
  FileText,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export const AdminDashboard = () => {
  const { refreshUserList } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState("users"); // 'users' | 'applications' | 'logs'

  // Data States
  const [users, setUsersList] = useState(getUsers());
  const [applications, setApplicationsList] = useState(getApplications());
  const [logs, setLogsList] = useState(getGateLogs());
  const [notification, setNotification] = useState("");

  // Search States
  const [userSearch, setUserSearch] = useState("");
  const [appSearch, setAppSearch] = useState("");

  // Drawer / Modal States
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUserModal, setEditUserModal] = useState(null);
  const [changePasswordUser, setChangePasswordUser] = useState(null);
  const [editAppModal, setEditAppModal] = useState(null);

  // Form inputs for Add User
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("3rd Year");
  const [section, setSection] = useState("A");

  // Form input for Change Password
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showPass, setShowPass] = useState(false);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 5000);
  };

  // --- USER HANDLERS ---
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please enter Name, Email, and Password.");
      return;
    }

    const newUser = {
      id: `user-${role}-${Date.now().toString().slice(-4)}`,
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: role,
      name: name.trim(),
      rollNumber: role === "student" ? (rollNumber || "2024CSE0199") : null,
      employeeId: role !== "student" ? `EMP-${role.toUpperCase()}-${Math.floor(Math.random()*900+100)}` : null,
      branch: role === "student" ? branch : null,
      department: role === "hod" ? branch : null,
      assignedBranch: role === "teacher" ? branch : null,
      year: role === "student" ? year : null,
      assignedYear: role === "teacher" ? year : null,
      section: role === "student" ? section : null,
      assignedSection: role === "teacher" ? section : null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    const updated = [...users, newUser];
    await saveUsers(updated);
    setUsersList(getUsers());
    refreshUserList();

    showNotify(`User ${name} (${email}) created successfully!`);
    setShowAddUser(false);
    setName("");
    setEmail("");
    setPassword("");
    setRollNumber("");
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;

    const res = await updateUserDetails(editUserModal.id, editUserModal);
    setUsersList(getUsers());
    refreshUserList();
    showNotify(res.message);
    setEditUserModal(null);
  };

  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordInput.trim() || !changePasswordUser) return;

    const res = await updateUserPassword(changePasswordUser.id, newPasswordInput.trim());
    setUsersList(getUsers());
    refreshUserList();
    
    showNotify(res.message);
    setChangePasswordUser(null);
    setNewPasswordInput("");
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      const updated = users.filter(u => u.id !== userId);
      await saveUsers(updated);
      setUsersList(getUsers());
      refreshUserList();
      showNotify("User account deleted successfully.");
    }
  };

  // --- APPLICATION HANDLERS ---
  const handleEditAppSubmit = async (e) => {
    e.preventDefault();
    if (!editAppModal) return;

    const res = await adminUpdateApplication(editAppModal.id, editAppModal);
    setApplicationsList(getApplications());
    showNotify(res.message);
    setEditAppModal(null);
  };

  const handleDeleteApp = async (appId) => {
    if (window.confirm(`Are you sure you want to delete leave application ${appId}?`)) {
      await adminDeleteApplication(appId);
      setApplicationsList(getApplications());
      showNotify(`Application ${appId} deleted successfully.`);
    }
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    let update = { status: newStatus };
    if (newStatus === "APPROVED_BY_HOD" && !app.gatePassId) {
      update.gatePassId = `GP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      update.passStatus = "ACTIVE";
      update.hodApprovedBy = "Admin Override";
    }

    await adminUpdateApplication(appId, update);
    setApplicationsList(getApplications());
    showNotify(`Application ${appId} status updated to ${newStatus}.`);
  };

  const handleDeleteLog = async (logId) => {
    if (window.confirm("Are you sure you want to delete this audit log entry?")) {
      await adminDeleteLog(logId);
      setLogsList(getGateLogs());
      showNotify("Audit log entry deleted.");
    }
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const filteredApps = applications.filter(a => {
    const q = appSearch.toLowerCase();
    return a.rollNumber.toLowerCase().includes(q) || a.studentName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#0A2540] text-white rounded-3xl p-6 shadow-md border border-[#0A2540]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-amber-200" />
              System Admin Full Control Console & Edit Suite
            </h2>
            <p className="text-xs text-amber-100 mt-1 font-medium">
              Full Administrator Authority: Create/Edit Users, Override & Edit Applications, Modify Passwords & Audit Security Logs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#06182B] hover:bg-[#0F3B66] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-slate-300" />
              Provision Account
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-3 font-bold shadow-xs animate-in fade-in duration-200">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Control Tabs */}
      <div className="bg-slate-200/70 border border-slate-300/80 p-1.5 rounded-2xl shadow-2xs grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveAdminTab("users")}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeAdminTab === "users"
              ? "bg-white text-[#0A2540] shadow-sm"
              : "text-slate-700 hover:text-[#0A2540] hover:bg-white/50"
          }`}
        >
          <Users className="w-4 h-4 text-[#0A2540]" />
          1. Users & Passwords ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab("applications")}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeAdminTab === "applications"
              ? "bg-white text-[#0A2540] shadow-sm"
              : "text-slate-700 hover:text-[#0A2540] hover:bg-white/50"
          }`}
        >
          <FileText className="w-4 h-4 text-[#0A2540]" />
          2. Leave Applications & Edit ({applications.length})
        </button>

        <button
          onClick={() => setActiveAdminTab("logs")}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            activeAdminTab === "logs"
              ? "bg-white text-[#0A2540] shadow-sm"
              : "text-slate-700 hover:text-[#0A2540] hover:bg-white/50"
          }`}
        >
          <Shield className="w-4 h-4 text-[#0A2540]" />
          3. Security Audit Logs ({logs.length})
        </button>
      </div>

      {/* Add User Drawer */}
      {showAddUser && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-extrabold text-[#0A2540] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0A2540]" />
            Provision New System Account & Set Password
          </h3>

          <form onSubmit={handleAddUserSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Dr. Rajesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0A2540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g., rajesh@college.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0A2540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#0A2540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold capitalize focus:outline-none focus:border-[#0A2540]"
                >
                  <option value="teacher">Class Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="security">Security Guard</option>
                  <option value="principal">Principal</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0A2540] hover:bg-[#071C30] text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Create Account & Set Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: USERS & PASSWORDS EDIT TABLE */}
      {activeAdminTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h3 className="text-lg font-extrabold text-[#0A2540] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0A2540]" />
              Registered Accounts & Full Edit Controls ({filteredUsers.length})
            </h3>
            
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user name, email, role..."
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0A2540]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#0A2540] font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">User Profile</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Stored Password</th>
                  <th className="py-3 px-3">Department / Assigned</th>
                  <th className="py-3 px-3 text-right">Admin Edit Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-200" />
                        <span className="font-extrabold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-medium">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#EBF3FA] text-[#0A2540] border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#0A2540] font-bold">
                      {u.password ? "••••••••" : "Default"}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {u.branch || u.department || u.assignedBranch || "All Campus"}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {/* EDIT USER DETAILS BUTTON */}
                      <button
                        onClick={() => setEditUserModal({ ...u })}
                        className="px-3 py-1.5 bg-[#0A2540] hover:bg-[#071C30] text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1 shadow-2xs"
                        title="Edit User Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit User
                      </button>

                      {/* CHANGE PASSWORD BUTTON */}
                      <button
                        onClick={() => {
                          setChangePasswordUser(u);
                          setNewPasswordInput(u.password || "");
                        }}
                        className="px-3 py-1.5 bg-[#EBF3FA] hover:bg-[#DCEBF7] text-[#0A2540] border border-slate-200 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                        title="Change Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Set Password
                      </button>
                      
                      {/* DELETE USER BUTTON */}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE APPLICATIONS EDIT TABLE */}
      {activeAdminTab === "applications" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h3 className="text-lg font-extrabold text-[#0A2540] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0A2540]" />
              All College Leave Applications & Full Edit Suite ({filteredApps.length})
            </h3>
            
            <input
              type="text"
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              placeholder="Search Roll No, Student Name, Ref ID..."
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0A2540]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#0A2540] font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Ref / Roll</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Branch & Sec</th>
                  <th className="py-3 px-3">Leave Timing</th>
                  <th className="py-3 px-3">Approval Status</th>
                  <th className="py-3 px-3">Gate Pass ID</th>
                  <th className="py-3 px-3 text-right">Admin Edit & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredApps.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0A2540]">
                      <div>{a.id}</div>
                      <div className="text-[10px] text-slate-500">{a.rollNumber}</div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{a.studentName}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{a.branch} ({a.year} - {a.section})</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      <div>{a.leaveType} ({a.leaveDate})</div>
                      <div className="text-[10px] font-mono text-slate-500">{a.fromTime} - {a.toTime}</div>
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                        a.status === "APPROVED_BY_HOD" ? "bg-emerald-100 text-emerald-900" : a.status.includes("REJECTED") ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0A2540]">{a.gatePassId || "-"}</td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {/* EDIT APPLICATION BUTTON */}
                      <button
                        onClick={() => setEditAppModal({ ...a })}
                        className="px-3 py-1.5 bg-[#0A2540] hover:bg-[#071C30] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 shadow-2xs"
                        title="Edit Application Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit App
                      </button>

                      {/* FORCE APPROVE BUTTON */}
                      {a.status !== "APPROVED_BY_HOD" && (
                        <button
                          onClick={() => handleQuickStatusChange(a.id, "APPROVED_BY_HOD")}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1"
                          title="Force Issue Gate Pass"
                        >
                          Approve
                        </button>
                      )}

                      {/* DELETE APPLICATION BUTTON */}
                      <button
                        onClick={() => handleDeleteApp(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY AUDIT LOGS TABLE */}
      {activeAdminTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-lg font-extrabold text-[#0A2540] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0A2540]" />
            Security Audit Movement Logs ({logs.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#0A2540] font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Student Roll</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Gate</th>
                  <th className="py-3 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{l.recordedTime || l.timestamp}</td>
                    <td className="py-3 px-3 font-extrabold">{l.actionType || l.action}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0A2540]">{l.studentRoll}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{l.studentName}</td>
                    <td className="py-3 px-3 text-slate-700">{l.gate}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteLog(l.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-[#0A2540] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#0A2540]" />
                Edit User Details: {editUserModal.name}
              </h3>
              <button onClick={() => setEditUserModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editUserModal.name || ""}
                    onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editUserModal.email || ""}
                    onChange={(e) => setEditUserModal({ ...editUserModal, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={editUserModal.role || "teacher"}
                    onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 capitalize"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Class Teacher</option>
                    <option value="hod">HOD</option>
                    <option value="security">Security Guard</option>
                    <option value="principal">Principal</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={editUserModal.password || ""}
                    onChange={(e) => setEditUserModal({ ...editUserModal, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-[#0A2540]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch (5 Only)</label>
                  <select
                    value={editUserModal.branch || editUserModal.assignedBranch || editUserModal.department || "CSE"}
                    onChange={(e) => setEditUserModal({ 
                      ...editUserModal, 
                      branch: e.target.value,
                      assignedBranch: e.target.value,
                      department: e.target.value
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={editUserModal.year || editUserModal.assignedYear || "3rd Year"}
                    onChange={(e) => setEditUserModal({ 
                      ...editUserModal, 
                      year: e.target.value,
                      assignedYear: e.target.value 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={editUserModal.section || editUserModal.assignedSection || "A"}
                    onChange={(e) => setEditUserModal({ 
                      ...editUserModal, 
                      section: e.target.value,
                      assignedSection: e.target.value 
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A2540] hover:bg-[#071C30] text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT APPLICATION MODAL --- */}
      {editAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-[#0A2540] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#0A2540]" />
                Admin Edit Application: {editAppModal.id}
              </h3>
              <button onClick={() => setEditAppModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAppSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Roll Number</label>
                  <input
                    type="text"
                    required
                    value={editAppModal.rollNumber || ""}
                    onChange={(e) => setEditAppModal({ ...editAppModal, rollNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-[#0A2540]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={editAppModal.studentName || ""}
                    onChange={(e) => setEditAppModal({ ...editAppModal, studentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-extrabold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course</label>
                  <select
                    value={editAppModal.course || "B.Tech"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, course: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch</label>
                  <select
                    value={editAppModal.branch || "CSE"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, branch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={editAppModal.year || "3rd Year"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={editAppModal.section || "A"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leave Type</label>
                  <select
                    value={editAppModal.leaveType || "Full Day"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, leaveType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leave Date</label>
                  <input
                    type="date"
                    value={editAppModal.leaveDate || ""}
                    onChange={(e) => setEditAppModal({ ...editAppModal, leaveDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gate Pass ID</label>
                  <input
                    type="text"
                    value={editAppModal.gatePassId || ""}
                    onChange={(e) => setEditAppModal({ ...editAppModal, gatePassId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Time</label>
                  <input
                    type="time"
                    value={editAppModal.fromTime || "10:30"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, fromTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Time</label>
                  <input
                    type="time"
                    value={editAppModal.toTime || "17:00"}
                    onChange={(e) => setEditAppModal({ ...editAppModal, toTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Reason</label>
                <textarea
                  rows={2}
                  value={editAppModal.reason || ""}
                  onChange={(e) => setEditAppModal({ ...editAppModal, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={editAppModal.status || "APPROVED_BY_HOD"}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      let extra = { status: newStatus };
                      if (newStatus === "APPROVED_BY_HOD" && !editAppModal.gatePassId) {
                        extra.gatePassId = `GP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
                        extra.passStatus = "ACTIVE";
                      }
                      setEditAppModal({ ...editAppModal, ...extra });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="PENDING_CLASS_TEACHER">Pending Class Teacher</option>
                    <option value="APPROVED_BY_CLASS_TEACHER">Approved by Teacher (Pending HOD)</option>
                    <option value="APPROVED_BY_HOD">Approved by HOD (Pass Issued)</option>
                    <option value="REJECTED_BY_CLASS_TEACHER">Rejected by Teacher</option>
                    <option value="REJECTED_BY_HOD">Rejected by HOD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rejection Reason (If any)</label>
                  <input
                    type="text"
                    value={editAppModal.rejectionReason || ""}
                    onChange={(e) => setEditAppModal({ ...editAppModal, rejectionReason: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-red-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditAppModal(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A2540] hover:bg-[#071C30] text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Application Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CHANGE PASSWORD MODAL --- */}
      {changePasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3 text-[#0A2540]">
                <div className="p-2.5 bg-[#EBF3FA] rounded-2xl border border-slate-200">
                  <Lock className="w-5 h-5 text-[#0A2540]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Change Account Password</h3>
                  <p className="text-xs text-slate-500 font-medium">{changePasswordUser.name} ({changePasswordUser.email})</p>
                </div>
              </div>
              <button onClick={() => setChangePasswordUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter New Password <span className="text-[#0A2540]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password (min 6 chars)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#0A2540]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setChangePasswordUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#0A2540] hover:bg-[#071C30] rounded-xl shadow-xs transition-all"
                >
                  Update User Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
