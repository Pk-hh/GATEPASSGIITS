import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Clock, 
  LogOut
} from "lucide-react";
import { FirebaseConfigModal } from "./FirebaseConfigModal";

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-4 sm:px-6 py-2.5 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Institution Header */}
          <div className="flex items-center gap-3">
            {/* Main College Logo First */}
            <img 
              src="/college-logo-2.png" 
              alt="Gonna Institute College Logo" 
              className="h-12 w-auto object-contain rounded-lg shrink-0 hover:scale-105 transition-transform duration-300" 
            />

            {/* Secondary Logo */}
            <img 
              src="/college-logo-1.png" 
              alt="GIITS Accreditation Logo" 
              className="h-12 w-auto object-contain rounded-lg shrink-0 hover:scale-105 transition-transform duration-300" 
              onError={(e) => {
                e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH5kPCs9cDia_Sr45smLGhdF2WlD_QMkJm7QBFEukAxFYl92stwLc11LUC&s=10";
              }}
            />

            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-[#0A2540] uppercase leading-tight">
                  GONNA INSTITUTE OF INFORMATION TECHNOLOGY & SCIENCES
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-extrabold border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-semibold leading-tight hidden sm:block">
                (Approved by AICTE, New Delhi, Affiliated to JNTU GURAJADA, VIZIANAGARAM)
              </p>
              <p className="text-[9px] text-slate-500 font-medium leading-tight hidden md:block">
                Gonnavanipalem, Parwada madalam, Anakapalli – 530 053
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EBF3FA] border border-slate-200 text-xs text-[#0A2540] font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#0A2540] animate-pulse" />
              <span>{currentTime}</span>
            </div>

            {/* Active User Badge & Logout */}
            {currentUser && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2.5 p-1 pr-3 bg-[#EBF3FA] border border-slate-200 rounded-full">
                  <img
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0A2540]/20"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-black text-[#0A2540] leading-tight">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-wider">{currentUser.role}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out of Account"
                  className="p-2.5 text-[#0A2540] hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      <FirebaseConfigModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />
    </>
  );
};
