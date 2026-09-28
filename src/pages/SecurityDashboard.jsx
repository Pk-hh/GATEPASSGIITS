import React, { useState, useEffect, useRef } from "react";
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
  Download,
  Upload,
  RefreshCw,
  Aperture,
  Sparkles,
  Zap
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export const SecurityDashboard = () => {
  const { currentUser } = useAuth();
  const [manualInput, setManualInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [logs, setLogs] = useState(getGateLogs());
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const qrCodeInstanceRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const startCameraScanner = async () => {
    setCameraError("");
    setIsCameraLoading(true);
    setScannerActive(true);

    setTimeout(async () => {
      const container = document.getElementById("reader");
      if (!container) {
        setIsCameraLoading(false);
        return;
      }

      try {
        if (qrCodeInstanceRef.current) {
          try {
            await qrCodeInstanceRef.current.stop();
          } catch (e) {}
          qrCodeInstanceRef.current.clear();
          qrCodeInstanceRef.current = null;
        }

        const html5QrCode = new Html5Qrcode("reader");
        qrCodeInstanceRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        const onScanSuccess = (decodedText) => {
          handleScanCode(decodedText);
          stopCameraScanner();
        };

        try {
          // Priority 1: Request environment (rear/back) camera for native apps and mobile phones
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            () => {}
          );
        } catch (envErr) {
          // Priority 2: Fallback to available native camera device IDs
          const cameras = await Html5Qrcode.getCameras().catch(() => []);
          if (cameras && cameras.length > 0) {
            // Find rear camera or pick first available
            const backCam = cameras.find(c => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("rear"));
            const camId = backCam ? backCam.id : cameras[0].id;
            await html5QrCode.start(
              camId,
              config,
              onScanSuccess,
              () => {}
            );
          } else {
            // Priority 3: User facing camera fallback
            await html5QrCode.start(
              { facingMode: "user" },
              config,
              onScanSuccess,
              () => {}
            );
          }
        }
        setIsCameraLoading(false);
      } catch (err) {
        console.error("Camera access error:", err);
        setIsCameraLoading(false);
        setCameraError(
          "Camera access could not be opened automatically. Please check camera permissions in your browser or native app settings, or click 'Take Photo / Upload QR' below."
        );
      }
    }, 200);
  };

  const stopCameraScanner = async () => {
    setScannerActive(false);
    setIsCameraLoading(false);
    if (qrCodeInstanceRef.current) {
      try {
        if (qrCodeInstanceRef.current.isScanning) {
          await qrCodeInstanceRef.current.stop();
        }
        qrCodeInstanceRef.current.clear();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
      qrCodeInstanceRef.current = null;
    }
  };

  const toggleScanner = () => {
    if (scannerActive) {
      stopCameraScanner();
    } else {
      startCameraScanner();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError("");
    try {
      let tempDiv = document.getElementById("temp-file-reader");
      if (!tempDiv) {
        tempDiv = document.createElement("div");
        tempDiv.id = "temp-file-reader";
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);
      }

      const tempScanner = new Html5Qrcode("temp-file-reader");
      const decodedText = await tempScanner.scanFile(file, true);
      tempScanner.clear();
      handleScanCode(decodedText);
    } catch (err) {
      console.error("File QR decode error:", err);
      setCameraError("Could not detect a valid QR code in the selected photo. Please take a clearer photo of the QR code and try again.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (qrCodeInstanceRef.current) {
        try {
          if (qrCodeInstanceRef.current.isScanning) {
            qrCodeInstanceRef.current.stop().catch(() => {});
          }
          qrCodeInstanceRef.current.clear();
        } catch (e) {}
      }
    };
  }, []);

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
              onClick={toggleScanner}
              className={`px-5 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2.5 transition-all duration-300 active:scale-95 border ${
                scannerActive
                  ? "bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400/50 shadow-red-900/30 hover:from-red-700 hover:to-rose-800"
                  : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 border-amber-300/60 shadow-amber-500/30 hover:from-amber-300 hover:to-amber-500 hover:shadow-amber-500/50"
              }`}
            >
              <div className={`p-1.5 rounded-xl ${scannerActive ? "bg-white/20" : "bg-stone-950/15"}`}>
                <Camera className={`w-4 h-4 ${scannerActive ? "text-white animate-pulse" : "text-stone-950"}`} />
              </div>
              <span className="tracking-wide">
                {scannerActive ? "STOP CAMERA SCANNER" : "LAUNCH CAMERA QR SCANNER"}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${scannerActive ? "bg-red-300 animate-ping" : "bg-stone-950 animate-pulse"}`}></span>
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#702424] flex items-center gap-2">
              <Scan className="w-5 h-5 text-[#702424]" />
              Digital Gate Pass Verification
            </h3>
            
            {/* Hidden Input for Native Camera / Gallery Scan */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Enhanced Camera Control Action Bar */}
          <div className="bg-gradient-to-r from-amber-500/10 via-stone-50 to-stone-100 p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${scannerActive ? "bg-emerald-500 animate-ping" : "bg-amber-600 animate-pulse"}`}></div>
                <h4 className="text-xs font-black text-[#702424] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Camera Scanner Controls
                </h4>
              </div>
              <span className="text-[10px] font-extrabold text-[#702424] bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                {scannerActive ? "STREAM ACTIVE" : "READY TO SCAN"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Live HD Camera Toggle */}
              <button
                type="button"
                onClick={toggleScanner}
                className={`py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-95 ${
                  scannerActive
                    ? "bg-stone-900 text-white hover:bg-stone-800 ring-2 ring-stone-700"
                    : "bg-[#702424] hover:bg-[#581A1A] text-white shadow-[#702424]/25 hover:shadow-lg"
                }`}
              >
                <Aperture className={`w-4 h-4 ${scannerActive ? "text-rose-400 animate-spin" : "text-amber-300"}`} />
                <span>{scannerActive ? "Stop Live Camera" : "Open Live HD Scanner"}</span>
              </button>

              {/* Button 2: Native Camera Snap / Gallery Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 border border-amber-300/80"
              >
                <Camera className="w-4 h-4 text-stone-950" />
                <span>Snap Photo / Upload QR</span>
              </button>
            </div>
          </div>

          {cameraError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 font-bold flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p>{cameraError}</p>
                <p className="text-[11px] text-red-700 mt-1 font-normal">
                  Tip: On Native mobile apps, tap <strong>"Snap Photo / Upload QR"</strong> above to open your native device camera directly.
                </p>
              </div>
            </div>
          )}

          {scannerActive && (
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-700 overflow-hidden relative min-h-[260px] flex flex-col items-center justify-center shadow-inner">
              {isCameraLoading && (
                <div className="absolute inset-0 bg-stone-900/95 z-10 flex flex-col items-center justify-center text-white text-xs font-bold gap-2.5">
                  <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
                  <span className="tracking-wide text-amber-200 font-extrabold">Accessing native camera stream...</span>
                </div>
              )}
              <div id="reader" className="w-full text-white overflow-hidden rounded-xl"></div>
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
