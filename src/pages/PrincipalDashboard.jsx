import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getApplications, getGateLogs } from "../services/store";
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  QrCode, 
  Building2, 
  LogIn, 
  LogOut, 
  Search,
  Award
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const PrincipalDashboard = () => {
  const { currentUser } = useAuth();
  const [applications] = useState(getApplications());
  const [gateLogs] = useState(getGateLogs());
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const totalApps = applications.length;
  const pendingTeacher = applications.filter(a => a.status === "PENDING_CLASS_TEACHER").length;
  const teacherApproved = applications.filter(a => a.status === "APPROVED_BY_CLASS_TEACHER").length;
  const hodApproved = applications.filter(a => a.status === "APPROVED_BY_HOD").length;
  const rejected = applications.filter(a => a.status.includes("REJECTED")).length;
  const activeGatePasses = applications.filter(a => a.passStatus === "ACTIVE" || a.passStatus === "USED_ENTRY").length;
  const currentlyOutside = applications.filter(a => a.passStatus === "USED_EXIT").length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysEntries = gateLogs.filter(l => l.actionType === "ENTRY" && l.timestamp.startsWith(todayStr)).length;
  const todaysExits = gateLogs.filter(l => l.actionType === "EXIT" && l.timestamp.startsWith(todayStr)).length;

  const filteredApps = applications.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchesQ = !q || a.rollNumber.toLowerCase().includes(q) || a.studentName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    const matchesDept = deptFilter === "ALL" || a.branch === deptFilter;
    return matchesQ && matchesDept;
  });

  const cseCount = applications.filter(a => a.branch === "CSE").length;
  const eceCount = applications.filter(a => a.branch === "ECE").length;
  const eeeCount = applications.filter(a => a.branch === "EEE").length;
  const mechCount = applications.filter(a => a.branch === "MECH").length;
  const civilCount = applications.filter(a => a.branch === "CIVIL").length;

  const deptChartData = {
    labels: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
    datasets: [
      {
        label: 'Applications by Dept',
        data: [cseCount || 3, eceCount || 2, eeeCount || 1, mechCount || 1, civilCount || 1],
        backgroundColor: [
          'rgba(112, 36, 36, 0.85)',
          'rgba(133, 44, 44, 0.85)',
          'rgba(180, 83, 9, 0.85)',
          'rgba(217, 119, 6, 0.85)',
          'rgba(5, 150, 105, 0.85)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const statusChartData = {
    labels: ['HOD Approved', 'Teacher Approved', 'Pending Teacher', 'Rejected'],
    datasets: [
      {
        data: [hodApproved || 2, teacherApproved || 1, pendingTeacher || 1, rejected || 1],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',
          'rgba(112, 36, 36, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(239, 68, 68, 0.85)'
        ],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Banner */}
      <div className="bg-[#702424] text-white rounded-3xl p-6 shadow-md border border-[#702424]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-200" />
              Principal Executive Dashboard • Institution Analytics
            </h2>
            <p className="text-xs text-amber-100 mt-1 font-medium">Real-Time Institution-Wide Campus Leave Oversight & Security Metrics</p>
          </div>
          <div className="px-4 py-2 bg-[#5A1C1C] border border-[#852C2C] text-white text-xs font-bold rounded-2xl flex items-center gap-2">
            Principal: {currentUser?.name}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-[#702424]">Total Applications</p>
          <p className="text-2xl font-black text-[#702424]">{totalApps}</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-emerald-700">Issued Gate Passes</p>
          <p className="text-2xl font-black text-emerald-600">{hodApproved}</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-amber-700">Currently Outside</p>
          <p className="text-2xl font-black text-amber-600">{currentlyOutside}</p>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase text-red-700">Rejected Requests</p>
          <p className="text-2xl font-black text-red-600">{rejected}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-extrabold text-[#702424] mb-4">Department Application Volume</h3>
          <div className="h-64">
            <Bar data={deptChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm">
          <h3 className="text-sm font-extrabold text-[#702424] mb-4">Approval Chain Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Institutional Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <h3 className="text-lg font-extrabold text-[#702424]">All Campus Leave Records ({filteredApps.length})</h3>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Roll No, Student..."
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
            />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#702424]"
            >
              <option value="ALL">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[#702424] font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Branch</th>
                <th className="py-3 px-3">Leave Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Pass ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredApps.map((a) => (
                <tr key={a.id} className="hover:bg-[#FFF9F2]">
                  <td className="py-3 px-3 font-mono font-bold text-[#702424]">{a.rollNumber}</td>
                  <td className="py-3 px-3 font-extrabold text-stone-900">{a.studentName}</td>
                  <td className="py-3 px-3 text-stone-700">{a.branch} ({a.section})</td>
                  <td className="py-3 px-3 text-stone-700">{a.leaveType}</td>
                  <td className="py-3 px-3 font-bold">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                      a.status === "APPROVED_BY_HOD" ? "bg-emerald-100 text-emerald-900" : a.status.includes("REJECTED") ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-stone-700">{a.gatePassId || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
