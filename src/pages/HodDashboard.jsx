import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getApplications, 
  hodApproveApplication, 
  hodRejectApplication,
  getUsers
} from "../services/store";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Check, 
  X, 
  QrCode, 
  Sparkles,
  Award,
  History
} from "lucide-react";
import { RejectionModal } from "../components/RejectionModal";
import { GatePassCard } from "../components/GatePassCard";

export const HodDashboard = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState(getApplications());
  const [rollSearch, setRollSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [filterSection, setFilterSection] = useState("ALL");
  const [rejectAppId, setRejectAppId] = useState(null);
  const [viewPass, setViewPass] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [notification, setNotification] = useState("");

  const hodDept = currentUser?.department || "CSE";

  const deptApps = applications.filter(a => a.branch === hodDept || hodDept === "ALL");

  const filteredApps = deptApps.filter(a => {
    const q = rollSearch.trim().toLowerCase();
    const matchRoll = !q || 
      a.rollNumber.toLowerCase().includes(q) || 
      a.studentName.toLowerCase().includes(q) || 
      a.id.toLowerCase().includes(q) || 
      (a.gatePassId && a.gatePassId.toLowerCase().includes(q));
    const matchBranch = filterBranch === "ALL" || a.branch === filterBranch;
    const matchSec = filterSection === "ALL" || a.section === filterSection;
    return matchRoll && matchBranch && matchSec;
  });

  const pendingHodApps = deptApps.filter(a => a.status === "APPROVED_BY_CLASS_TEACHER");
  const finalApprovedApps = deptApps.filter(a => a.status === "APPROVED_BY_HOD");
  const rejectedApps = deptApps.filter(a => a.status.includes("REJECTED"));

  const handleApprove = (appId) => {
    const updated = hodApproveApplication(appId, currentUser?.name);
    setApplications(getApplications());
    setNotification(`Gate Pass GENERATED for Application ${appId}! Gate Pass ID: ${updated.gatePassId}`);
    setTimeout(() => setNotification(""), 6000);
  };

  const handleConfirmReject = (reason) => {
    if (!rejectAppId) return;
    hodRejectApplication(rejectAppId, currentUser?.name, reason);
    setApplications(getApplications());
    setRejectAppId(null);
    setNotification(`Application ${rejectAppId} REJECTED by HOD.`);
    setTimeout(() => setNotification(""), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#702424] text-white rounded-3xl p-6 shadow-md border border-[#702424]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-200" />
              HOD Authority Portal • {hodDept} Department
            </h2>
            <p className="text-xs text-amber-100 mt-1 font-medium">Final Gate Pass Generation & Student Leave Verification</p>
          </div>
          <div className="px-4 py-2 bg-[#5A1C1C] border border-[#852C2C] text-white text-xs font-bold rounded-2xl flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            HOD: {currentUser?.name}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-3 font-bold shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Prominent Search Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#702424] uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#702424]" />
          HOD Student Roll Number Search Engine
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={rollSearch}
              onChange={(e) => setRollSearch(e.target.value)}
              placeholder="Search Student Roll Number (e.g. 2024CSE0142)..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
            />
          </div>

          <div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#702424]"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#702424]"
            >
              <option value="ALL">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-amber-700">Awaiting HOD Approval</p>
          <p className="text-2xl font-black text-amber-600">{pendingHodApps.length}</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-emerald-700">Gate Passes Issued</p>
          <p className="text-2xl font-black text-emerald-600">{finalApprovedApps.length}</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-red-700">Total Rejected</p>
          <p className="text-2xl font-black text-red-600">{rejectedApps.length}</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-[#702424]">Department Total</p>
          <p className="text-2xl font-black text-[#702424]">{deptApps.length}</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-[#702424]">Department Leave Requests ({filteredApps.length})</h3>

        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs">
            No department applications found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <div 
                key={app.id} 
                className="bg-[#FFF3E4] border border-stone-200 rounded-2xl p-5 space-y-3 relative hover:border-stone-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-black text-[#702424] bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                      {app.rollNumber}
                    </span>
                    <span className="text-xs font-bold text-stone-900 ml-2">{app.studentName}</span>
                  </div>

                  {app.status === "APPROVED_BY_CLASS_TEACHER" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                      Awaiting HOD
                    </span>
                  ) : app.status === "APPROVED_BY_HOD" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Pass Issued ({app.gatePassId})
                    </span>
                  ) : app.status.includes("REJECTED") ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-900 border border-red-200">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-700 border border-stone-200">
                      Pending Teacher
                    </span>
                  )}
                </div>

                <div className="text-xs text-stone-700 space-y-1">
                  <p><span className="font-bold text-stone-900">Branch & Section:</span> {app.branch} • {app.year} • Sec {app.section}</p>
                  <p><span className="font-bold text-stone-900">Duration:</span> {app.leaveType} ({app.leaveDate})</p>
                  <p><span className="font-bold text-stone-900">Timing:</span> {app.fromTime} - {app.toTime}</p>
                  <p><span className="font-bold text-stone-900">Reason:</span> "{app.reason}"</p>
                  <p><span className="font-bold text-stone-900">Class Teacher Endorsement:</span> {app.teacherApprovedBy || "Pending"}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <button
                    onClick={() => setHistoryStudent(app)}
                    className="text-xs font-bold text-[#702424] hover:underline flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    Student History
                  </button>

                  <div className="flex items-center gap-2">
                    {app.status === "APPROVED_BY_CLASS_TEACHER" && (
                      <>
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
                          Issue Gate Pass
                        </button>
                      </>
                    )}

                    {app.status === "APPROVED_BY_HOD" && (
                      <button
                        onClick={() => setViewPass(app)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR Pass
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <RejectionModal
        isOpen={!!rejectAppId}
        onClose={() => setRejectAppId(null)}
        onConfirm={handleConfirmReject}
        title="HOD Rejection Reason Note"
      />

      {viewPass && (
        <GatePassCard
          app={viewPass}
          onClose={() => setViewPass(null)}
        />
      )}

    </div>
  );
};
