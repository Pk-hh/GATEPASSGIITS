import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getApplications, 
  teacherApproveApplication, 
  teacherRejectApplication 
} from "../services/store";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  Check, 
  X,
  Filter,
  Sparkles,
  BookOpen
} from "lucide-react";
import { RejectionModal } from "../components/RejectionModal";

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState(getApplications());
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectAppId, setRejectAppId] = useState(null);
  const [notification, setNotification] = useState("");

  const teacherBranch = currentUser?.assignedBranch || "CSE";
  const teacherYear = currentUser?.assignedYear || "3rd Year";
  const teacherSection = currentUser?.assignedSection || "A";

  const classApps = applications.filter(a => 
    a.branch === teacherBranch && 
    a.year === teacherYear && 
    a.section === teacherSection
  );

  const filteredApps = classApps.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.rollNumber.toLowerCase().includes(q) ||
      a.studentName.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  });

  const pendingApps = classApps.filter(a => a.status === "PENDING_CLASS_TEACHER");
  const approvedApps = classApps.filter(a => a.status === "APPROVED_BY_CLASS_TEACHER" || a.status === "APPROVED_BY_HOD");
  const rejectedApps = classApps.filter(a => a.status.includes("REJECTED"));
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysLeaves = classApps.filter(a => a.leaveDate === todayStr && a.status === "APPROVED_BY_HOD");

  const handleApprove = (appId) => {
    const updatedApp = teacherApproveApplication(appId, currentUser?.name);
    setApplications(getApplications());
    setNotification(`Application ${appId} APPROVED. Forwarded to HOD for final approval.`);
    setTimeout(() => setNotification(""), 5000);
  };

  const handleConfirmReject = (reason) => {
    if (!rejectAppId) return;
    teacherRejectApplication(rejectAppId, currentUser?.name, reason);
    setApplications(getApplications());
    setRejectAppId(null);
    setNotification(`Application ${rejectAppId} REJECTED.`);
    setTimeout(() => setNotification(""), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#702424] text-white rounded-3xl p-6 shadow-md border border-[#702424]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-200" />
              Class Teacher Portal • {teacherBranch} ({teacherYear} - Sec {teacherSection})
            </h2>
            <p className="text-xs text-amber-100 mt-1 font-medium">Reviewing leave applications for assigned class section.</p>
          </div>
          <div className="px-3.5 py-1.5 bg-[#5A1C1C] border border-[#852C2C] text-white text-xs font-bold rounded-xl">
            Assigned Teacher: {currentUser?.name}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-3 font-bold shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Dashboard Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-stone-500">Total Requests</p>
          <p className="text-2xl font-black text-[#702424]">{classApps.length}</p>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-amber-700">Pending Review</p>
          <p className="text-2xl font-black text-amber-600">{pendingApps.length}</p>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-emerald-700">Approved</p>
          <p className="text-2xl font-black text-emerald-600">{approvedApps.length}</p>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-red-700">Rejected</p>
          <p className="text-2xl font-black text-red-600">{rejectedApps.length}</p>
        </div>
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-extrabold uppercase text-[#702424]">Today's Leaves</p>
          <p className="text-2xl font-black text-[#702424]">{todaysLeaves.length}</p>
        </div>
      </div>

      {/* Application Control & Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <h3 className="text-lg font-extrabold text-[#702424]">Class Leave Applications ({filteredApps.length})</h3>
          
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Roll No, Student Name..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#702424]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Requests List */}
        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            No applications match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <div 
                key={app.id}
                className="bg-[#FFF3E4] border border-stone-200 rounded-2xl p-5 space-y-3 relative hover:border-stone-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#702424] bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                      {app.rollNumber}
                    </span>
                    <span className="text-xs font-bold text-stone-900">{app.studentName}</span>
                  </div>
                  
                  {app.status === "PENDING_CLASS_TEACHER" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                      Pending Action
                    </span>
                  ) : app.status === "APPROVED_BY_CLASS_TEACHER" || app.status === "APPROVED_BY_HOD" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-900 border border-red-200">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="text-xs text-stone-700 space-y-1">
                  <p><span className="font-bold text-stone-900">Duration:</span> {app.leaveType} ({app.leaveDate})</p>
                  <p><span className="font-bold text-stone-900">Timing:</span> {app.fromTime} - {app.toTime}</p>
                  <p><span className="font-bold text-stone-900">Reason:</span> "{app.reason}"</p>
                  <p><span className="font-bold text-stone-900">Parent Contact:</span> {app.parentName} ({app.parentPhone})</p>
                </div>

                {app.status === "PENDING_CLASS_TEACHER" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={() => setRejectAppId(app.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="px-4 py-1.5 bg-[#702424] hover:bg-[#581A1A] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Forward to HOD
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <RejectionModal
        isOpen={!!rejectAppId}
        onClose={() => setRejectAppId(null)}
        onConfirm={handleConfirmReject}
        title="Class Teacher Rejection Note"
      />

    </div>
  );
};
