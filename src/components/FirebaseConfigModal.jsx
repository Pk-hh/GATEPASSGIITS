import React, { useState } from "react";
import { X, Database, Check, ShieldAlert } from "lucide-react";
import { getActiveFirebaseConfig } from "../firebase";

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(getActiveFirebaseConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("gatepass_firebase_config", JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-[#0A2540] rounded-2xl border border-sky-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Firebase Integration Settings</h3>
              <p className="text-xs text-slate-500">Configure custom Firebase project API keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              The system operates out-of-the-box with live local state sync. You can optionally paste your Firebase Project credentials below to connect to a live Firebase Firestore instance.
            </span>
          </div>

          {[
            { label: "API Key", key: "apiKey" },
            { label: "Auth Domain", key: "authDomain" },
            { label: "Project ID", key: "projectId" },
            { label: "Storage Bucket", key: "storageBucket" },
            { label: "Messaging Sender ID", key: "messagingSenderId" },
            { label: "App ID", key: "appId" }
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={config[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0A2540] focus:bg-white transition-colors"
              />
            </div>
          ))}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Firebase credentials updated! Reloading app...</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#0A2540] hover:bg-[#071C30] rounded-xl shadow-md transition-all"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
