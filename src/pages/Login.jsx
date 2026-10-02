import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Lock,
  Eye,
  EyeOff,
  User
} from "lucide-react";

export const Login = ({ onLoginSuccess, onGoToStudentPortal }) => {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMode, setLoginMode] = useState("staff");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter email address and password.");
      return;
    }

    setIsSubmitting(true);
    const res = await loginUser(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#0A2540] selection:text-white transition-all duration-300">
      
      <div className="max-w-xl mx-auto w-full my-auto py-6 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out">
        
        {/* Header Branding - Main College Logo First */}
        <div className="text-center space-y-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300">
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Primary College Emblem Logo First */}
            <img 
              src="/college-logo-2.png" 
              alt="Gonna Institute Main Logo" 
              className="h-16 w-auto object-contain rounded-xl hover:scale-105 transition-transform duration-300"
            />
            {/* Secondary Logo */}
            <img 
              src="/college-logo-1.png" 
              alt="GIITS Logo" 
              className="h-16 w-auto object-contain rounded-xl hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH5kPCs9cDia_Sr45smLGhdF2WlD_QMkJm7QBFEukAxFYl92stwLc11LUC&s=10";
              }}
            />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#0A2540] uppercase leading-snug">
              GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES
            </h1>
            <p className="text-xs text-slate-600 font-bold mt-1">
              (Approved by AICTE, New Delhi, Affiliated to JNTU GURAJADA, VIZIANAGARAM)
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Gonnavanipalem, Parwada madalam, Anakapalli – 530 053
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[#0A2540] font-extrabold text-xs">
            <Lock className="w-4 h-4 text-[#0A2540]" />
            <span>Digital Student Leave & Gate Pass Management Portal</span>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="p-1.5 bg-slate-200/70 rounded-2xl flex items-center gap-1 border border-slate-300/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setLoginMode("staff")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-200 ${
              loginMode === "staff"
                ? "bg-white text-[#0A2540] shadow-sm"
                : "text-slate-700 font-bold hover:text-[#0A2540] hover:bg-white/50"
            }`}
          >
            Staff & Admin Login
          </button>
          
          <button
            type="button"
            onClick={() => {
              setLoginMode("student");
              onGoToStudentPortal();
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-200 ${
              loginMode === "student"
                ? "bg-white text-[#0A2540] shadow-sm"
                : "text-slate-700 font-bold hover:text-[#0A2540] hover:bg-white/50"
            }`}
          >
            Student Portal (No Login)
          </button>
        </div>

        {/* Inner Card - Authentication */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-all duration-300">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-extrabold text-[#0A2540]">
              Portal Authentication
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Sign in with your verified institutional account credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="admingiits@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0A2540] focus:bg-white focus:ring-2 focus:ring-[#0A2540]/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-xs text-slate-900 font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0A2540] focus:bg-white focus:ring-2 focus:ring-[#0A2540]/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#0A2540] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-700 font-bold bg-red-50 p-3 rounded-xl border border-red-200 animate-in fade-in duration-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0A2540] hover:bg-[#071C30] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#0A2540]/20 flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 disabled:opacity-50"
            >
              <User className="w-4 h-4 text-white" />
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Gate Pass Account"}</span>
            </button>
          </form>

          {/* Quick Direct Link to Public Student Portal */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onGoToStudentPortal}
              className="text-xs font-extrabold text-[#0A2540] hover:underline inline-flex items-center gap-1 transition-all duration-200"
            >
              Are you a Student? Apply & Download QR Pass without login →
            </button>
          </div>
        </div>

      </div>

      <footer className="text-center text-[11px] text-slate-500 py-4 font-medium">
        © 2026 GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES • All Rights Reserved
      </footer>
    </div>
  );
};
