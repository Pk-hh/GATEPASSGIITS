import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getApplications, createLeaveApplication, isAppOlderThan24Hours } from "../services/store";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  QrCode, 
  Send, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  Building,
  GraduationCap,
  Sparkles,
  Paperclip
} from "lucide-react";
import { GatePassCard } from "../components/GatePassCard";

export const StudentDashboard = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState(getApplications());
  const [selectedPass, setSelectedPass] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [leaveType, setLeaveType] = useState("Full Day");
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromTime, setFromTime] = useState("10:30");
  const [toTime, setToTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [parentName, setParentName] = useState(currentUser?.parentName || "Ramesh Sharma");
  const [parentPhone, setParentPhone] = useState(currentUser?.parentPhone || "+91 98200 11223");
  const [docNote, setDocNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentApps = applications.filter(a => (a.studentId === currentUser?.id || a.rollNumber === currentUser?.rollNumber) && !isAppOlderThan24Hours(a));
  
  const pendingApps = studentApps.filter(a => a.status === "PENDING_CLASS_TEACHER" || a.status === "APPROVED_BY_CLASS_TEACHER");
  const approvedApps = studentApps.filter(a => a.status === "APPROVED_BY_HOD");
  const rejectedApps = studentApps.filter(a => a.status.includes("REJECTED"));
  const activePass = approvedApps.find(a => a.passStatus === "ACTIVE" || a.passStatus === "USED_ENTRY");

  const todayMinDate = new Date().toISOString().split("T")[0];

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please enter a valid reason for your leave application.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newApp = createLeaveApplication({
        studentId: currentUser?.id,
        studentName: currentUser?.name || "Rahul Sharma",
        rollNumber: currentUser?.rollNumber || "2024CSE0142",
        branch: currentUser?.branch || "CSE",
        year: currentUser?.year || "3rd Year",
        section: currentUser?.section || "A",
        leaveType,
        leaveDate,
        fromTime,
        toTime,
        reason,
        parentName,
        parentPhone,
        documentUrl: docNote ? docNote : "Supporting_Document.pdf"
      });

      setApplications(getApplications());
      setIsSubmitting(false);
      setSuccessMessage(`Application ${newApp.id} submitted successfully! Forwarded to Class Teacher.`);
      setReason("");
      setDocNote("");

      setTimeout(() => setSuccessMessage(""), 7000);
    }, 400);
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#702424]/10 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-[#702424]">{currentUser?.name}</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-[#702424] bg-[#FFF3E4] rounded-full border border-stone-200">
                  {currentUser?.rollNumber}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 flex flex-wrap items-center gap-3 font-medium">
                <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-[#702424]" /> B.Tech {currentUser?.branch} • {currentUser?.year}</span>
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-[#702424]" /> Section {currentUser?.section}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-md border border-emerald-200 text-[10px]">
                  Attendance: {currentUser?.attendancePercentage || 91}% (Eligible)
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-bold rounded-md border border-amber-200 text-[10px] flex items-center gap-1" title="Gate pass applications automatically purge and delete 24 hours after creation">
                  <Clock className="w-3 h-3 text-amber-700" /> Auto-Deletes After 24 Hours
                </span>
              </p>
            </div>
          </div>

          {activePass ? (
            <button
              onClick={() => setSelectedPass(activePass)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:bg-emerald-600 transition-all animate-pulse"
            >
              <QrCode className="w-4 h-4" />
              VIEW ACTIVE GATE PASS ({activePass.gatePassId})
            </button>
          ) : (
            <div className="text-xs text-stone-600 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200 shadow-2xs font-semibold">
              No active gate pass issued
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-3 font-bold shadow-xs">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase text-stone-500">Pending</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{pendingApps.length}</p>
          <p className="text-[11px] text-stone-600 font-medium mt-1">In approval chain</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase text-stone-500">Approved</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{approvedApps.length}</p>
          <p className="text-[11px] text-stone-600 font-medium mt-1">HOD Issued Passes</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase text-stone-500">Rejected</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{rejectedApps.length}</p>
          <p className="text-[11px] text-stone-600 font-medium mt-1">Declined requests</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-[#702424] mb-2">
            <QrCode className="w-5 h-5" />
            <span className="text-[10px] font-extrabold uppercase text-stone-500">Active Pass</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{activePass ? "1" : "0"}</p>
          <p className="text-[11px] text-stone-600 font-medium mt-1">Ready for Scanner</p>
        </div>
      </div>

      {/* Apply Tab Form */}
      {activeTab === "apply" && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-stone-200 pb-4">
            <h3 className="text-lg font-extrabold text-[#702424] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#702424]" />
              Submit Student Leave Application
            </h3>
            <p className="text-xs text-stone-600 mt-1">Strict Approval Workflow: Student → Class Teacher Approval → HOD Approval → Digital QR Gate Pass</p>
          </div>

          <form onSubmit={handleSubmitLeave} className="space-y-4">
            {/* Auto-filled Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FFF3E4] rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-[#702424] font-bold uppercase text-[10px] block">Student Name</span>
                <span className="font-extrabold text-stone-900 text-sm">{currentUser?.name}</span>
              </div>
              <div>
                <span className="text-[#702424] font-bold uppercase text-[10px] block">Roll Number</span>
                <span className="font-mono font-extrabold text-[#702424] text-sm">{currentUser?.rollNumber}</span>
              </div>
              <div>
                <span className="text-[#702424] font-bold uppercase text-[10px] block">Branch / Year / Section</span>
                <span className="font-bold text-stone-800 text-sm">{currentUser?.branch} • {currentUser?.year} • Sec {currentUser?.section}</span>
              </div>
            </div>

            {/* Leave Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Leave Duration <span className="text-[#702424]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Half Day", "Full Day"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLeaveType(type)}
                      className={`py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                        leaveType === type
                          ? "bg-[#702424] text-white shadow-xs"
                          : "bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Leave Date <span className="text-[#702424]">*</span>
                </label>
                <input
                  type="date"
                  min={todayMinDate}
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#702424]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  From Time <span className="text-[#702424]">*</span>
                </label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  To Time <span className="text-[#702424]">*</span>
                </label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                Reason for Leave <span className="text-[#702424]">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify detailed reason (e.g., Medical appointment, Passport slot, Family emergency)..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#702424]"
              />
            </div>

            {/* Parent Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Parent / Guardian Name <span className="text-[#702424]">*</span>
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#702424]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Parent Phone Number <span className="text-[#702424]">*</span>
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
                />
              </div>
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                Optional Supporting Document Attachment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docNote}
                  onChange={(e) => setDocNote(e.target.value)}
                  placeholder="Medical certificate reference, hospital slip, or appointment letter..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#702424]"
                />
                <button
                  type="button"
                  onClick={() => setDocNote("Medical_Certificate_Doc.pdf")}
                  className="px-3 py-2.5 bg-[#FFF3E4] hover:bg-[#FFE6C9] text-[#702424] text-xs font-bold rounded-xl border border-stone-200 flex items-center gap-1.5"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Attach Preset
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#702424] hover:bg-[#581A1A] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History & Approval Stepper */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-[#702424]">Leave Applications & Approval Chain Tracking</h3>
        
        {studentApps.length === 0 ? (
          <p className="text-stone-500 text-xs py-8 text-center font-medium">No leave applications submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {studentApps.map((app) => (
              <div 
                key={app.id} 
                className="bg-[#FFF3E4] border border-stone-200 rounded-2xl p-5 space-y-4 hover:border-stone-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-[#702424] bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      {app.id}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-stone-900">{app.leaveType} Leave • {app.leaveDate}</p>
                      <p className="text-[11px] text-stone-600 font-mono font-medium">Timing: {app.fromTime} - {app.toTime}</p>
                    </div>
                  </div>

                  <div>
                    {app.status === "APPROVED_BY_HOD" ? (
                      <button
                        onClick={() => setSelectedPass(app)}
                        className="px-4 py-2 bg-[#702424] hover:bg-[#581A1A] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        VIEW DIGITAL QR PASS
                      </button>
                    ) : app.status.includes("REJECTED") ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
                        REJECTED: {app.rejectionReason}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold">
                        IN APPROVAL CHAIN
                      </span>
                    )}
                  </div>
                </div>

                {/* Workflow Stepper Bar */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                  
                  {/* Step 1: Submission */}
                  <div className="space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <p className="font-bold text-stone-900">1. Submitted</p>
                    <p className="text-[9px] text-stone-500">App Created</p>
                  </div>

                  {/* Step 2: Class Teacher */}
                  <div className="space-y-1">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold ${
                      app.status === "APPROVED_BY_CLASS_TEACHER" || app.status === "APPROVED_BY_HOD"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : app.status === "REJECTED_BY_CLASS_TEACHER"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                    }`}>
                      {app.status === "APPROVED_BY_CLASS_TEACHER" || app.status === "APPROVED_BY_HOD" ? "✓" : app.status === "REJECTED_BY_CLASS_TEACHER" ? "✕" : "2"}
                    </div>
                    <p className="font-bold text-stone-900">2. Class Teacher</p>
                    <p className="text-[9px] text-stone-600 font-medium">{app.teacherApprovedBy || "Pending Review"}</p>
                  </div>

                  {/* Step 3: HOD Approval */}
                  <div className="space-y-1">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold ${
                      app.status === "APPROVED_BY_HOD"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : app.status === "REJECTED_BY_HOD"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-stone-200 text-stone-600 border border-stone-300"
                    }`}>
                      {app.status === "APPROVED_BY_HOD" ? "✓" : app.status === "REJECTED_BY_HOD" ? "✕" : "3"}
                    </div>
                    <p className="font-bold text-stone-900">3. HOD Approval</p>
                    <p className="text-[9px] text-stone-600 font-medium">{app.hodApprovedBy || "Awaiting Teacher"}</p>
                  </div>

                  {/* Step 4: Security Gate Pass */}
                  <div className="space-y-1">
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold ${
                      app.passStatus === "USED_ENTRY" || app.passStatus === "USED_EXIT"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : app.status === "APPROVED_BY_HOD"
                        ? "bg-[#702424] text-white border border-[#702424]"
                        : "bg-stone-200 text-stone-600 border border-stone-300"
                    }`}>
                      {app.passStatus ? "✓" : "4"}
                    </div>
                    <p className="font-bold text-stone-900">4. QR Gate Pass</p>
                    <p className="text-[9px] font-mono text-stone-600">{app.gatePassId || "Not Issued"}</p>
                  </div>

                </div>

                <div className="text-xs text-stone-700 pt-2 border-t border-stone-200">
                  <span className="font-bold text-stone-900">Reason: </span>
                  <span className="italic">"{app.reason}"</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gate Pass Viewer Modal */}
      {selectedPass && (
        <GatePassCard
          app={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}
    </div>
  );
};
