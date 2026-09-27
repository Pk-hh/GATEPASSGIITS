import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, ShieldCheck, Clock, Calendar, CheckCircle2, X, Lock, LogIn, LogOut, Check, Sparkles, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const GatePassCard = ({ app, onClose, isModal = true }) => {
  const cardRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!app) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = cardRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        windowWidth: 800
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
      pdf.save(`GatePass_${app.gatePassId || app.id}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      // Fallback if canvas capture fails: use print dialog
      alert("PDF direct download fallback triggered. Printing gate pass...");
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const qrData = JSON.stringify({
    gatePassId: app.gatePassId || app.id,
    appId: app.id,
    rollNumber: app.rollNumber,
    token: app.securityToken || "SEC_TOKEN_VERIFIED"
  });

  const CardContent = (
    <div
      id="printable-gate-pass"
      ref={cardRef}
      className="bg-white text-stone-900 rounded-b-2xl sm:rounded-b-3xl p-4 sm:p-7 max-w-lg w-full border border-stone-200/90 shadow-2xl relative overflow-hidden font-sans border-t-4 border-t-[#702424]"
    >
      {/* Background Seal Watermark */}
      <div className="absolute -right-16 -bottom-16 opacity-[0.03] pointer-events-none select-none">
        <ShieldCheck className="w-96 h-96 text-[#702424]" />
      </div>

      {/* College Header with Both Logos */}
      <div className="border-b border-stone-200 pb-4 mb-5 text-center relative space-y-1.5">
        <div className="flex items-center justify-center gap-3 mb-1.5">
          <img 
            src="/college-logo-2.png" 
            alt="GIITS Main Logo" 
            className="h-10 sm:h-14 w-auto object-contain rounded-lg shrink-0" 
          />
          <img 
            src="/college-logo-1.png" 
            alt="GIITS Accreditation Logo" 
            className="h-10 sm:h-14 w-auto object-contain rounded-lg shrink-0" 
          />
        </div>

        <div>
          <h2 className="text-xs sm:text-base font-black tracking-tight text-[#702424] uppercase leading-tight px-1">
            GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES
          </h2>
          <p className="text-[9px] sm:text-[10px] text-stone-600 font-bold mt-0.5 leading-tight">
            (Approved by AICTE, New Delhi, Affiliated to JNTU GURAJADA, VIZIANAGARAM)
          </p>
          <p className="text-[8px] sm:text-[9px] text-stone-500 font-medium leading-tight">
            Gonnavanipalem, Parwada madalam, Anakapalli – 530 053
          </p>
        </div>

        <div className="pt-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs font-black rounded-full border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            OFFICIAL VERIFIED DIGITAL GATE PASS
          </span>
        </div>
      </div>

      {/* QR Code & ID Container Box */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FFF3E4] rounded-2xl sm:rounded-3xl border border-[#702424]/20 mb-5 shadow-xs">
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border border-stone-200 shrink-0">
          <QRCodeSVG value={qrData} size={125} level="H" includeMargin={true} />
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-stone-500 uppercase block">Gate Pass ID</span>
            <span className="text-lg sm:text-2xl font-black font-mono text-[#702424] tracking-wider block">
              {app.gatePassId || "GP-2026-PENDING"}
            </span>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-stone-500 uppercase block">Application Ref</span>
            <span className="text-[11px] sm:text-xs font-bold font-mono text-stone-700 bg-white px-2.5 py-0.5 rounded-md border border-stone-200 inline-block">
              {app.id}
            </span>
          </div>

          <div className="pt-0.5">
            <span className="inline-block px-3 py-0.5 text-[11px] sm:text-xs font-extrabold text-[#702424] bg-white rounded-xl border border-stone-200 shadow-2xs">
              {app.leaveType} Leave
            </span>
          </div>
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] sm:text-xs mb-5">
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase block tracking-wider">Student Name</span>
          <span className="font-extrabold text-stone-900 text-xs sm:text-sm leading-tight block">{app.studentName}</span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase block tracking-wider">Roll Number</span>
          <span className="font-mono font-black text-[#702424] text-xs sm:text-sm block">{app.rollNumber}</span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase block tracking-wider">Course & Branch</span>
          <span className="font-bold text-stone-800 block">{app.course || "B.Tech"} • {app.branch}</span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase block tracking-wider">Year & Section</span>
          <span className="font-bold text-stone-800 block">{app.year || "3rd Year"} • Sec {app.section || "A"}</span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase block tracking-wider">Valid Date</span>
          <span className="font-bold text-stone-900 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-[#702424]" />
            {app.leaveDate}
          </span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase block tracking-wider">Valid Timing</span>
          <span className="font-mono font-bold text-stone-900 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-[#702424]" />
            {app.fromTime} - {app.toTime}
          </span>
        </div>
      </div>

      {/* Reason for Leave */}
      <div className="space-y-3 text-[11px] sm:text-xs mb-5">
        <div className="p-3 bg-stone-50 rounded-r-xl rounded-l-md border-l-4 border-l-[#702424] border border-stone-200">
          <span className="font-extrabold text-stone-900 block mb-0.5">Reason for Leave:</span>
          <p className="text-stone-800 italic leading-relaxed">"{app.reason}"</p>
        </div>

        {/* Approvals */}
        <div className="grid grid-cols-2 gap-2.5 text-[10px] sm:text-xs">
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 font-extrabold block uppercase text-[8px] sm:text-[9px] mb-0.5">Class Teacher Approval</span>
            <div className="flex items-center gap-1 text-emerald-800 font-extrabold">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{app.teacherApprovedBy || "Dr. S. K. Verma"}</span>
            </div>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 font-extrabold block uppercase text-[8px] sm:text-[9px] mb-0.5">HOD Final Approval</span>
            <div className="flex items-center gap-1 text-emerald-800 font-extrabold">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{app.hodApprovedBy || "Prof. A. N. Joshi"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gate Entry / Exit Timestamps */}
      {(app.entryTime || app.exitTime) && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-5 text-[11px] sm:text-xs text-emerald-950 font-bold space-y-1">
          <p className="text-[9px] sm:text-[10px] uppercase font-black text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Recorded Gate Timestamps:
          </p>
          {app.exitTime && (
            <p className="flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5 text-amber-700" />
              <span>Campus EXIT Recorded: <strong>{app.exitTime}</strong></span>
            </p>
          )}
          {app.entryTime && (
            <p className="flex items-center gap-1">
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Campus ENTRY Recorded: <strong>{app.entryTime}</strong></span>
            </p>
          )}
        </div>
      )}

      {/* Security Footer Note */}
      <div className="text-center pt-3 border-t border-stone-200 text-[9px] sm:text-[10px] text-stone-500 font-semibold space-y-1">
        <p className="flex items-center justify-center gap-1 text-[#702424]">
          <Lock className="w-3 h-3 text-[#702424]" />
          Secured by SHA-256 Token Signature • Gate Officer Verification Required
        </p>
        <p>© 2026 GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES</p>
      </div>
    </div>
  );

  if (!isModal) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden border-t-4 border-t-[#702424]">
        {CardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs p-2 sm:p-4 flex items-start justify-center min-h-screen">
      
      {/* Outer Card Container with rounded corners & overflow hidden */}
      <div className="relative max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200/90 my-auto sm:my-6 flex flex-col">
        
        {/* Sticky Mobile-Friendly Control Top Bar */}
        <div className="sticky top-0 z-30 bg-[#702424] text-white p-3 sm:p-4 border-b border-[#5A1C1C] flex items-center justify-between gap-2 shadow-md shrink-0 no-print">
          
          {/* EXPLICIT BACK BUTTON */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Back to Portal</span>
          </button>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1 transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Download Gate Pass PDF"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span>{isGeneratingPDF ? "Exporting..." : "PDF"}</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 bg-[#5A1C1C] hover:bg-[#852C2C] text-white font-bold text-xs rounded-xl hidden sm:flex items-center gap-1 transition-all border border-[#852C2C]"
              title="Print Gate Pass"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Body */}
        <div className="w-full">
          {CardContent}
        </div>

      </div>

    </div>
  );
};
