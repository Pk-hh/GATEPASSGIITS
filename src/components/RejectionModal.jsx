import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";

export const RejectionModal = ({ isOpen, onClose, onConfirm, title = "Reject Leave Application" }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejecting this leave application.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2.5 bg-red-50 rounded-2xl border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Reason for Rejection <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="E.g., Incomplete documentation, upcoming mandatory lab exam, or unverified parent contact..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
            {error && <p className="mt-1.5 text-xs text-red-600 font-semibold">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-xs transition-all active:scale-95"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
