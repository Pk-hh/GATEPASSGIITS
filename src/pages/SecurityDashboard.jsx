import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getApplications, 
  verifyGatePass, 
  recordGateMovement, 
  getGateLogs 
} from "../services/store";
import { speakApproved, speakRejected, speakMessage } from "../services/audio";
import { 
  Scan, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  User, 
  LogOut, 
  LogIn, 
  Camera, 
  Volume2, 
  AlertTriangle,
  Download
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export const SecurityDashboard = () => {
  const { currentUser } = useAuth();
  const [manualInput, setManualInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [logs, setLogs] = useState(getGateLogs());
  const [scannerActive, setScannerActive] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const getCurrentHHMM = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [movementTime, setMovementTime] = useState(getCurrentHHMM());

  const guardGate = currentUser?.assignedGate || "Main Campus Gate #1";

  const handleScanCode = (code) => {
    const result = verifyGatePass(code);
    setScanResult(result);

    if (result.isValid) {
      speakApproved();
    } else {
      speakRejected(result.reason);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanCode(manualInput.trim());
    setManualInput("");
  };

  const formatTimeStr = (hhmm) => {
    if (!hhmm) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [h, m] = hhmm.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10));
    date.setMinutes(parseInt(m, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRecordEntry = () => {
    if (!scanResult?.app) return;
    
    if (scanResult.app.passStatus === "USED_ENTRY") {
      const msg = `Student already entered campus at ${scanResult.app.entryTime || 'earlier'}.`;
      setActionSuccessMessage(msg);
      speakMessage(msg);
      return;
    }

    const recordedTimeStr = formatTimeStr(movementTime);
    const res = recordGateMovement(scanResult.app.id, "ENTRY", {
      employeeId: currentUser?.employeeId || "EMP-SEC-007",
      name: currentUser?.name || "Senior Officer Mahendra Singh",
      gate: guardGate
    }, recordedTimeStr);

    if (res.success) {
      setLogs(getGateLogs());
      setActionSuccessMessage(`ENTRY Recorded at ${recordedTimeStr} for ${scanResult.app.studentName} (${scanResult.app.rollNumber}) at ${guardGate}.`);
      speakMessage(`Campus Entry Recorded at ${recordedTimeStr}`);
      setScanResult(prev => ({
        ...prev,
        app: res.app
      }));
    }
  };

  const handleRecordExit = () => {
    if (!scanResult?.app) return;

    if (scanResult.app.passStatus === "USED_EXIT") {
      const msg = `Student already exited campus at ${scanResult.app.exitTime || 'earlier'}.`;
      setActionSuccessMessage(msg);
      speakMessage(msg);
      return;
    }

    const recordedTimeStr = formatTimeStr(movementTime);
    const res = recordGateMovement(scanResult.app.id, "EXIT", {
      employeeId: currentUser?.employeeId || "EMP-SEC-007",
      name: currentUser?.name || "Senior Officer Mahendra Singh",
      gate: guardGate
    }, recordedTimeStr);

    if (res.success) {
      setLogs(getGateLogs());
      setActionSuccessMessage(`EXIT Recorded at ${recordedTimeStr} for ${scanResult.app.studentName} (${scanResult.app.rollNumber}) at ${guardGate}.`);
      speakMessage(`Campus Exit Recorded at ${recordedTimeStr}`);
      setScanResult(prev => ({
        ...prev,
        app: res.app
      }));
    }
  };

  useEffect(() => {
    let scanner = null;
    if (scannerActive) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      }, false);

      scanner.render((decodedText) => {
        handleScanCode(decodedText);
        setScannerActive(false);
        scanner.clear();
      }, (err) => {
        // quiet error logging
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scannerActive]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#702424] text-white rounded-3xl p-6 shadow-md border border-[#702424]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-200" />
              Gate Security Scanner & Verification Console
            </h2>
            <p className="text-xs text-amber-100 mt-1 font-medium">Stationed at {guardGate} • Guard Officer: {currentUser?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScannerActive(!scannerActive)}
              className="px-4 py-2.5 bg-[#5A1C1C] hover:bg-[#852C2C] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              {scannerActive ? "Stop Camera Scanner" : "Launch Camera QR Scanner"}
            </button>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center justify-between gap-3 font-bold shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage("")}
            className="text-xs text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Scanner & Search */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-[#702424] flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#702424]" />
            Digital Gate Pass Verification
          </h3>

          {scannerActive && (
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-700 overflow-hidden">
              <div id="reader" className="w-full text-white"></div>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase">
              Enter Roll No or Gate Pass ID Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="E.g., PASS-2024CSE0142 or 2024CSE0142..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-[#702424]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#702424] hover:bg-[#581A1A] text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Verify Pass
              </button>
            </div>
          </form>

          {/* Time Selector */}
          <div className="pt-2 border-t border-stone-200">
            <label className="block text-xs font-extrabold text-[#702424] uppercase mb-1">
              Select Gate Movement Recorded Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={movementTime}
                onChange={(e) => setMovementTime(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-900"
              />
              <button
                type="button"
                onClick={() => setMovementTime(getCurrentHHMM())}
                className="px-3 py-2 bg-[#FFF3E4] hover:bg-[#FFE6C9] text-[#702424] text-xs font-bold rounded-xl border border-stone-200"
              >
                Set to Current Time
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Scan Outcome */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#702424] mb-4">Verification Result Outcome</h3>

            {!scanResult ? (
              <div className="p-8 text-center text-stone-500 text-xs my-auto">
                Scan or enter a Gate Pass ID above to view verification result.
              </div>
            ) : scanResult.isValid ? (
              <div className="space-y-4 p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                <div className="flex items-center gap-3 text-emerald-900">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-base font-extrabold">PASS VALID & APPROVED</h4>
                    <p className="text-xs font-mono font-bold text-emerald-800">Pass ID: {scanResult.app.gatePassId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-800 pt-2 border-t border-emerald-200 font-medium">
                  <div><strong>Student Name:</strong> {scanResult.app.studentName}</div>
                  <div><strong>Roll Number:</strong> {scanResult.app.rollNumber}</div>
                  <div><strong>Branch / Sec:</strong> {scanResult.app.branch} ({scanResult.app.section})</div>
                  <div><strong>Leave Type:</strong> {scanResult.app.leaveType}</div>
                  <div><strong>Allowed Date:</strong> {scanResult.app.leaveDate}</div>
                  <div><strong>Allowed Timing:</strong> {scanResult.app.fromTime} - {scanResult.app.toTime}</div>
                  <div><strong>HOD Approved:</strong> {scanResult.app.hodApprovedBy}</div>
                  <div><strong>Parent Phone:</strong> {scanResult.app.parentPhone}</div>
                </div>

                {/* Entry & Exit Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    onClick={handleRecordExit}
                    className="py-3 bg-[#702424] hover:bg-[#581A1A] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Record EXIT ({movementTime})
                  </button>

                  <button
                    onClick={handleRecordEntry}
                    className="py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Record ENTRY ({movementTime})
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-5 bg-red-50 border-2 border-red-300 rounded-2xl">
                <div className="flex items-center gap-3 text-red-900">
                  <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <h4 className="text-base font-extrabold">VERIFICATION FAILED</h4>
                    <p className="text-xs text-red-800 font-bold">{scanResult.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Security Movement Audit Logs Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-[#702424]">Campus Gate Movement Audit Logs ({logs.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[#702424] font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Log Time</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Student Roll</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Gate Location</th>
                <th className="py-3 px-3">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFF9F2] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-stone-700">{log.recordedTime || log.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      log.action === "EXIT" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#702424]">{log.rollNumber}</td>
                  <td className="py-3 px-3 font-extrabold text-stone-900">{log.studentName}</td>
                  <td className="py-3 px-3 text-stone-700">{log.gate}</td>
                  <td className="py-3 px-3 text-stone-700">{log.guardName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
