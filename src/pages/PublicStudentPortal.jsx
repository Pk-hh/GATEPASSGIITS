import React, { useState } from "react";
import { 
  createLeaveApplication, 
  getStudentApplicationsByRoll,
  getApplications
} from "../services/store";
import { 
  FilePlus, 
  Search, 
  QrCode, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  Paperclip,
  GraduationCap,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { GatePassCard } from "../components/GatePassCard";

export const PublicStudentPortal = ({ onGoToStaffLogin }) => {
  const [activeTab, setActiveTab] = useState("apply"); // 'apply' or 'track'

  // Application Form State
  const [rollNumber, setRollNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("B.Tech");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("3rd Year");
  const [section, setSection] = useState("A");
  const [leaveType, setLeaveType] = useState("Full Day");
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromTime, setFromTime] = useState("10:30");
  const [toTime, setToTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [docNote, setDocNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Tracking State
  const [trackRollInput, setTrackRollInput] = useState("");
  const [trackedApps, setTrackedApps] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);

  const todayMinDate = new Date().toISOString().split("T")[0];

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim() || !studentName.trim() || !reason.trim()) {
      alert("Please enter Roll Number, Student Name, and Reason for leave.");
      return;
    }

    setIsSubmitting(true);
    const newApp = await createLeaveApplication({
      rollNumber: rollNumber.trim().toUpperCase(),
      studentName: studentName.trim(),
      course,
      branch,
      year,
      section,
      leaveType,
      leaveDate,
      fromTime,
      toTime,
      reason: reason.trim(),
      parentName: parentName.trim() || "Guardian",
      parentPhone: parentPhone.trim() || "+91 98000 00000",
      documentUrl: docNote ? docNote : "Student_Supporting_Doc.pdf"
    });

    setIsSubmitting(false);
    setSubmittedApp(newApp);
    setTrackRollInput(newApp.rollNumber);
  };

  const handleTrackSearch = (e) => {
    e?.preventDefault();
    if (!trackRollInput.trim()) return;
    const results = getStudentApplicationsByRoll(trackRollInput.trim());
    setTrackedApps(results);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#702424] selection:text-white transition-all duration-300">
      
      <div className="max-w-4xl mx-auto w-full my-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out">
        
        {/* Portal Header - Main College Logo First */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5 shrink-0">
              <img 
                src="/college-logo-2.png" 
                alt="Gonna Institute College Emblem Logo" 
                className="h-14 w-auto object-contain rounded-lg hover:scale-105 transition-transform duration-300"
              />
              <img 
                src="/college-logo-1.png" 
                alt="GIITS Logo" 
                className="h-14 w-auto object-contain rounded-lg hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH5kPCs9cDia_Sr45smLGhdF2WlD_QMkJm7QBFEukAxFYl92stwLc11LUC&s=10";
                }}
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#702424] uppercase leading-tight">
                GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES
              </h1>
              <p className="text-xs text-stone-600 font-semibold mt-0.5">
                (Approved by AICTE, New Delhi, Affiliated to JNTU GURAJADA, VIZIANAGARAM)
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                Gonnavanipalem, Parwada madalam, Anakapalli – 530 053
              </p>
            </div>
          </div>

          <button
            onClick={onGoToStaffLogin}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF3E4] hover:bg-[#FFE6C9] text-[#702424] font-black text-xs rounded-xl border border-stone-200 transition-all shrink-0 shadow-2xs active:scale-95"
          >
            Faculty & Admin Login
            <ArrowRight className="w-4 h-4 text-[#702424]" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-[#FFEED9] border border-amber-200/60 p-1.5 rounded-2xl shadow-2xs grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab("apply")}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === "apply"
                ? "bg-white text-[#702424] shadow-sm"
                : "text-[#702424] hover:text-[#501818]"
            }`}
          >
            <FilePlus className="w-4 h-4" />
            1. Apply for Leave Gate Pass
          </button>
          
          <button
            onClick={() => setActiveTab("track")}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === "track"
                ? "bg-white text-[#702424] shadow-sm"
                : "text-[#702424] hover:text-[#501818]"
            }`}
          >
            <Search className="w-4 h-4" />
            2. Track Status & Download QR Gate Pass
          </button>
        </div>

        {/* Submission Banner Alert */}
        {submittedApp && (
          <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-emerald-900 space-y-3 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Leave Application Submitted Successfully!</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              Your Application Ref ID is <strong className="font-mono text-emerald-950 font-extrabold text-sm">{submittedApp.id}</strong> for Student Roll Number <strong className="font-mono text-emerald-950 font-extrabold">{submittedApp.rollNumber}</strong>.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab("track");
                  setTrackRollInput(submittedApp.rollNumber);
                  handleTrackSearch();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95"
              >
                Track Status for {submittedApp.rollNumber} →
              </button>
              <button
                onClick={() => setSubmittedApp(null)}
                className="text-xs text-emerald-700 hover:underline font-bold"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: APPLY FOR LEAVE */}
        {activeTab === "apply" && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg font-extrabold text-[#702424] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#702424]" />
                Fill Student Leave Details
              </h2>
              <p className="text-xs text-stone-600 mt-1">No registration or password needed. Simply enter your Roll Number to submit.</p>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              
              {/* Roll Number & Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Student Roll Number <span className="text-[#702424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="E.g., 2024CSE0142"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#702424] focus:bg-white focus:ring-2 focus:ring-[#702424]/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Full Student Name <span className="text-[#702424]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="E.g., Rahul Sharma"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs font-extrabold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#702424] focus:bg-white focus:ring-2 focus:ring-[#702424]/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Course, Branch, Year, Section */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Program / Degree <span className="text-[#702424]">*</span>
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Branch (5 Only) <span className="text-[#702424]">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics & Comm)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="MECH">MECH (Mechanical Engg)</option>
                    <option value="CIVIL">CIVIL (Civil Engg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Year of Study <span className="text-[#702424]">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Section <span className="text-[#702424]">*</span>
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              {/* Leave Timing & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Leave Type <span className="text-[#702424]">*</span>
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
                  >
                    <option value="Full Day">Full Day Leave</option>
                    <option value="Half Day">Half Day Gate Pass</option>
                  </select>
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">From</label>
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">To</label>
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Detailed Reason for Leave <span className="text-[#702424]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify genuine reason (e.g., Medical emergency, Passport appointment, Family function)..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#702424] focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Parent Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="E.g., Ramesh Sharma"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#702424]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                    Parent Phone Number
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="E.g., +91 98200 11223"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
                  />
                </div>
              </div>

              {/* Document Reference */}
              <div>
                <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-2">
                  Optional Document Reference
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={docNote}
                    onChange={(e) => setDocNote(e.target.value)}
                    placeholder="Medical slip / appointment reference doc..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#702424]"
                  />
                  <button
                    type="button"
                    onClick={() => setDocNote("Medical_Slip_Reference.pdf")}
                    className="px-3 py-2.5 bg-[#FFF3E4] hover:bg-[#FFE6C9] text-[#702424] text-xs font-bold rounded-xl border border-stone-200 flex items-center gap-1.5 transition-all duration-200"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Attach Slip
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#702424] hover:bg-[#581A1A] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#702424]/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting Application..." : "Submit Leave Application"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: TRACK STATUS & DOWNLOAD QR */}
        {activeTab === "track" && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg font-extrabold text-[#702424] flex items-center gap-2">
                <Search className="w-5 h-5 text-[#702424]" />
                Track Leave Application & Download QR Pass
              </h2>
              <p className="text-xs text-stone-600 mt-1">Enter your Roll Number below to see real-time approvals and download issued Gate Passes.</p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex gap-3">
              <input
                type="text"
                required
                value={trackRollInput}
                onChange={(e) => setTrackRollInput(e.target.value)}
                placeholder="Enter Student Roll Number (e.g., 2024CSE0142)..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424] transition-all duration-200"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#702424] hover:bg-[#581A1A] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#702424]/20 flex items-center gap-2 transition-all duration-200 active:scale-95"
              >
                <Search className="w-4 h-4" />
                Track Now
              </button>
            </form>

            {trackedApps !== null && (
              <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                <h3 className="text-xs font-black text-[#702424] uppercase tracking-wider">
                  Applications Found ({trackedApps.length})
                </h3>

                {trackedApps.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200 text-xs font-medium">
                    No leave applications found for roll number "{trackRollInput}". Please check the roll number or submit a new application.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trackedApps.map((app) => (
                      <div 
                        key={app.id} 
                        className="bg-[#FFF3E4] border border-stone-200 rounded-2xl p-5 space-y-4 hover:border-stone-300 transition-colors shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                          <div>
                            <span className="font-mono text-xs font-black text-[#702424] bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                              Ref: {app.id}
                            </span>
                            <p className="text-xs font-extrabold text-stone-900 mt-2">{app.studentName} ({app.rollNumber})</p>
                            <p className="text-[11px] text-stone-600 font-medium">{app.leaveType} Leave • {app.leaveDate} ({app.fromTime} - {app.toTime})</p>
                          </div>

                          <div>
                            {app.status === "APPROVED_BY_HOD" ? (
                              <button
                                onClick={() => setSelectedPass(app)}
                                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md animate-pulse transition-all active:scale-95"
                              >
                                <QrCode className="w-4 h-4" />
                                DOWNLOAD QR GATE PASS
                              </button>
                            ) : app.status.includes("REJECTED") ? (
                              <span className="px-3.5 py-1.5 bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold inline-block">
                                REJECTED: {app.rejectionReason}
                              </span>
                            ) : (
                              <span className="px-3.5 py-1.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold inline-block">
                                IN APPROVAL CHAIN (Pending)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Workflow Stepper */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                          
                          <div className="space-y-1">
                            <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold">✓</div>
                            <p className="font-bold text-stone-900">1. Submitted</p>
                            <p className="text-[9px] text-stone-500">Student</p>
                          </div>

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

                          <div className="space-y-1">
                            <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold ${
                              app.status === "APPROVED_BY_HOD"
                                ? "bg-[#702424] text-white border border-[#702424]"
                                : "bg-stone-200 text-stone-600 border border-stone-300"
                            }`}>
                              {app.gatePassId ? "✓" : "4"}
                            </div>
                            <p className="font-bold text-stone-900">4. QR Pass</p>
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
            )}
          </div>
        )}

      </div>

      {/* QR Pass Card Modal */}
      {selectedPass && (
        <GatePassCard
          app={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}

      <footer className="text-center text-[11px] text-stone-500 py-4 font-medium">
        © 2026 GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES • All Rights Reserved
      </footer>
    </div>
  );
};
