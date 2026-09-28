import { db, auth } from "../firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const USERS_COLLECTION = "users";
const APPLICATIONS_COLLECTION = "applications";
const LOGS_COLLECTION = "logs";

const SEED_USERS = [
  {
    id: "usr-adm-01",
    email: "admingiits@gmail.com",
    role: "admin",
    name: "System Admin (GIITS)",
    employeeId: "EMP-ADM-001",
    designation: "Systems Administrator",
    phone: "+91 98555 66778",
    password: "Pradeep@2005",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-tch-01",
    email: "teacher@college.edu",
    role: "teacher",
    name: "Prof. Vikramaditya Joshi (CSE)",
    employeeId: "EMP-CSE-402",
    designation: "Assistant Professor - CSE",
    assignedBranch: "CSE",
    assignedYear: "3rd Year",
    assignedSection: "A",
    phone: "+91 98111 22334",
    password: "Teacher@1234",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-tch-02",
    email: "teacher.ece@college.edu",
    role: "teacher",
    name: "Prof. Anjali Sharma (ECE)",
    employeeId: "EMP-ECE-301",
    designation: "Assistant Professor - ECE",
    assignedBranch: "ECE",
    assignedYear: "3rd Year",
    assignedSection: "A",
    phone: "+91 98111 55667",
    password: "Teacher@1234",
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-hod-01",
    email: "hod@college.edu",
    role: "hod",
    name: "Dr. Rajeshwar S. Rao",
    employeeId: "EMP-HOD-101",
    designation: "Professor & Head of Department (CSE)",
    department: "CSE",
    phone: "+91 98222 33445",
    password: "Hod@1234",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-sec-01",
    email: "security@college.edu",
    role: "security",
    name: "Senior Officer Mahendra Singh",
    employeeId: "EMP-SEC-007",
    designation: "Chief Gate Supervisor",
    assignedGate: "Main Campus Gate #1",
    phone: "+91 98333 44556",
    password: "Security@1234",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-prin-01",
    email: "principal@college.edu",
    role: "principal",
    name: "Dr. Meenakshi Sundaram",
    employeeId: "EMP-PRIN-001",
    designation: "Director & Principal",
    phone: "+91 98444 55667",
    password: "Principal@1234",
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&auto=format&fit=crop&q=80"
  }
];

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
export const DEGREES = ["B.Tech", "Diploma"];

const INITIAL_APPLICATIONS = [
  {
    id: "LG-2026-000101",
    gatePassId: "GP-2026-000101",
    studentId: "usr-std-01",
    studentName: "Rahul Sharma",
    rollNumber: "2024CSE0142",
    course: "B.Tech",
    branch: "CSE",
    year: "3rd Year",
    section: "A",
    leaveType: "Full Day",
    leaveDate: getTodayString(0),
    fromTime: "10:30",
    toTime: "17:00",
    reason: "Medical appointment at Lilavati Hospital for annual health checkup.",
    parentName: "Ramesh Sharma",
    parentPhone: "+91 98200 11223",
    documentUrl: "Medical_Prescription_Doc.pdf",
    status: "APPROVED_BY_HOD",
    passStatus: "ACTIVE",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    teacherApprovedBy: "Prof. Vikramaditya Joshi (CSE)",
    teacherApprovedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    hodApprovedBy: "Dr. Rajeshwar S. Rao",
    hodApprovedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    securityToken: "SEC_TOKEN_8923471092834",
    exitTime: null,
    entryTime: null
  },
  {
    id: "LG-2026-000102",
    gatePassId: null,
    studentId: "usr-std-02",
    studentName: "Ananya Deshmukh",
    rollNumber: "2024CSE0188",
    course: "B.Tech",
    branch: "CSE",
    year: "3rd Year",
    section: "A",
    leaveType: "Half Day",
    leaveDate: getTodayString(0),
    fromTime: "13:30",
    toTime: "17:30",
    reason: "Urgent Passport verification slot at Regional Passport Office (RPO BKC).",
    parentName: "Suresh Deshmukh",
    parentPhone: "+91 98200 33445",
    documentUrl: "RPO_Appointment_Receipt.pdf",
    status: "PENDING_CLASS_TEACHER",
    passStatus: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    teacherApprovedBy: null,
    hodApprovedBy: null,
    securityToken: null,
    exitTime: null,
    entryTime: null
  },
  {
    id: "LG-2026-000103",
    gatePassId: null,
    studentId: "usr-std-03",
    studentName: "Karthik Verma",
    rollNumber: "2024ECE0055",
    course: "B.Tech",
    branch: "ECE",
    year: "3rd Year",
    section: "B",
    leaveType: "Full Day",
    leaveDate: getTodayString(0),
    fromTime: "11:00",
    toTime: "16:30",
    reason: "Attending Inter-College Robotics Symposium.",
    parentName: "Alok Verma",
    parentPhone: "+91 98200 55667",
    documentUrl: null,
    status: "PENDING_CLASS_TEACHER",
    passStatus: null,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    teacherApprovedBy: null,
    hodApprovedBy: null,
    securityToken: null,
    exitTime: null,
    entryTime: null
  },
  {
    id: "LG-2026-000105",
    gatePassId: "GP-2026-000105",
    studentId: "usr-std-04",
    studentName: "Sneha Kulkarni",
    rollNumber: "2024EEE0029",
    course: "Diploma",
    branch: "EEE",
    year: "2nd Year",
    section: "A",
    leaveType: "Full Day",
    leaveDate: getTodayString(0),
    fromTime: "10:00",
    toTime: "16:00",
    reason: "Family emergency.",
    parentName: "Vijay Kulkarni",
    parentPhone: "+91 98200 77889",
    documentUrl: null,
    status: "APPROVED_BY_HOD",
    passStatus: "USED_EXIT",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    teacherApprovedBy: "Prof. Vikramaditya Joshi",
    teacherApprovedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    hodApprovedBy: "Dr. Rajeshwar S. Rao",
    hodApprovedAt: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(),
    securityToken: "SEC_TOKEN_777123984",
    exitTime: "10:15 AM",
    entryTime: "04:30 PM"
  }
];

const INITIAL_LOGS = [
  {
    id: "LOG-1001",
    gatePassId: "GP-2026-000105",
    appId: "LG-2026-000105",
    studentRoll: "2024AIDS0029",
    studentName: "Sneha Kulkarni",
    actionType: "EXIT",
    recordedTime: "10:15 AM",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    securityGuardId: "EMP-SEC-007",
    securityGuardName: "Senior Officer Mahendra Singh",
    gate: "Main Campus Gate #1",
    status: "VALID",
    message: "Gate Exit Recorded at 10:15 AM."
  }
];

let memoryUsers = [...SEED_USERS];
let memoryApplications = [...INITIAL_APPLICATIONS];
let memoryLogs = [...INITIAL_LOGS];

export const initFirestoreSync = (onUpdateCallback) => {
  try {
    const usersCol = collection(db, USERS_COLLECTION);
    onSnapshot(usersCol, (snapshot) => {
      if (!snapshot.empty) {
        memoryUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem("firestore_cached_users", JSON.stringify(memoryUsers));
      } else {
        SEED_USERS.forEach(async (u) => {
          await setDoc(doc(db, USERS_COLLECTION, u.id), u);
        });
      }
      if (onUpdateCallback) onUpdateCallback();
    }, (err) => {});

    const appsCol = collection(db, APPLICATIONS_COLLECTION);
    onSnapshot(appsCol, (snapshot) => {
      if (!snapshot.empty) {
        memoryApplications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        memoryApplications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        localStorage.setItem("firestore_cached_apps", JSON.stringify(memoryApplications));
      }
      if (onUpdateCallback) onUpdateCallback();
    }, (err) => {});

    const logsCol = collection(db, LOGS_COLLECTION);
    onSnapshot(logsCol, (snapshot) => {
      if (!snapshot.empty) {
        memoryLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        memoryLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        localStorage.setItem("firestore_cached_logs", JSON.stringify(memoryLogs));
      }
      if (onUpdateCallback) onUpdateCallback();
    }, (err) => {});

  } catch (error) {
    console.error("Firestore sync init error:", error);
  }
};

try {
  const cachedUsers = localStorage.getItem("firestore_cached_users");
  if (cachedUsers) memoryUsers = JSON.parse(cachedUsers);

  const cachedApps = localStorage.getItem("firestore_cached_apps");
  if (cachedApps) memoryApplications = JSON.parse(cachedApps);

  const cachedLogs = localStorage.getItem("firestore_cached_logs");
  if (cachedLogs) memoryLogs = JSON.parse(cachedLogs);
} catch (e) {}

initFirestoreSync();

export const isAppOlderThan24Hours = (app) => {
  if (!app) return false;
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  if (app.createdAt) {
    const createdTime = new Date(app.createdAt).getTime();
    if (!isNaN(createdTime)) {
      return (now - createdTime) >= TWENTY_FOUR_HOURS_MS;
    }
  }

  if (app.leaveDate) {
    const leaveTime = new Date(app.leaveDate).getTime();
    if (!isNaN(leaveTime)) {
      return (now - leaveTime) >= (TWENTY_FOUR_HOURS_MS + 86400000);
    }
  }

  return false;
};

export const cleanExpired24hApplications = () => {
  const initialCount = memoryApplications.length;
  memoryApplications = memoryApplications.filter(app => !isAppOlderThan24Hours(app));
  
  if (memoryApplications.length !== initialCount) {
    try {
      localStorage.setItem("firestore_cached_apps", JSON.stringify(memoryApplications));
    } catch (e) {}
  }
  return memoryApplications;
};

export const getUsers = () => memoryUsers;
export const getApplications = () => {
  cleanExpired24hApplications();
  return memoryApplications;
};
export const getGateLogs = () => memoryLogs;

export const generateApplicationId = () => {
  const year = new Date().getFullYear();
  const nextNum = memoryApplications.length + 135;
  const padded = String(nextNum).padStart(6, '0');
  return `LG-${year}-${padded}`;
};

export const generateGatePassId = () => {
  const activeCount = memoryApplications.filter(a => a.gatePassId).length;
  const year = new Date().getFullYear();
  const nextNum = activeCount + 135;
  const padded = String(nextNum).padStart(6, '0');
  return `GP-${year}-${padded}`;
};

export const generateSecurityToken = () => {
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `SEC_TOKEN_${rand}_${timestamp}`;
};

export const createLeaveApplication = async (data) => {
  const appId = generateApplicationId();

  const newApp = {
    id: appId,
    gatePassId: null,
    studentId: data.rollNumber ? `std-${data.rollNumber}` : "student-public",
    studentName: data.studentName,
    rollNumber: data.rollNumber,
    branch: data.branch,
    year: data.year,
    section: data.section,
    leaveType: data.leaveType,
    leaveDate: data.leaveDate,
    fromTime: data.fromTime,
    toTime: data.toTime,
    reason: data.reason,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    documentUrl: data.documentUrl || null,
    status: "PENDING_CLASS_TEACHER",
    passStatus: null,
    createdAt: new Date().toISOString(),
    teacherApprovedBy: null,
    teacherApprovedAt: null,
    hodApprovedBy: null,
    hodApprovedAt: null,
    rejectionReason: null,
    rejectedBy: null,
    securityToken: null,
    exitTime: null,
    entryTime: null
  };

  memoryApplications = [newApp, ...memoryApplications];

  try {
    await setDoc(doc(db, APPLICATIONS_COLLECTION, appId), newApp);
  } catch (error) {
    console.error("Error saving application to Firestore:", error);
  }

  return newApp;
};

export const getStudentApplicationsByRoll = (rollNumber) => {
  if (!rollNumber) return [];
  cleanExpired24hApplications();
  const q = rollNumber.trim().toLowerCase();
  return memoryApplications.filter(a => 
    !isAppOlderThan24Hours(a) &&
    ((a.rollNumber && a.rollNumber.toLowerCase() === q) || 
     (a.id && a.id.toLowerCase() === q) || 
     (a.gatePassId && a.gatePassId.toLowerCase() === q))
  );
};

export const teacherApproveApplication = async (appId, teacherName) => {
  const target = memoryApplications.find(a => a.id === appId);
  if (!target) return null;

  const updateFields = {
    status: "APPROVED_BY_CLASS_TEACHER",
    teacherApprovedBy: teacherName || "Class Teacher",
    teacherApprovedAt: new Date().toISOString()
  };

  memoryApplications = memoryApplications.map(a => a.id === appId ? { ...a, ...updateFields } : a);

  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, appId), updateFields);
  } catch (error) {
    console.error("Error updating teacher approval in Firestore:", error);
  }

  return memoryApplications.find(a => a.id === appId);
};

export const teacherRejectApplication = async (appId, teacherName, reason) => {
  const target = memoryApplications.find(a => a.id === appId);
  if (!target) return null;

  const updateFields = {
    status: "REJECTED_BY_CLASS_TEACHER",
    rejectionReason: reason || "Rejected by Class Teacher",
    rejectedBy: teacherName || "Class Teacher",
    rejectedAt: new Date().toISOString()
  };

  memoryApplications = memoryApplications.map(a => a.id === appId ? { ...a, ...updateFields } : a);

  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, appId), updateFields);
  } catch (error) {
    console.error("Error updating teacher rejection in Firestore:", error);
  }

  return memoryApplications.find(a => a.id === appId);
};

export const hodApproveApplication = async (appId, hodName) => {
  const target = memoryApplications.find(a => a.id === appId);
  if (!target) return null;

  const gatePassId = generateGatePassId();
  const token = generateSecurityToken();

  const updateFields = {
    gatePassId: gatePassId,
    status: "APPROVED_BY_HOD",
    passStatus: "ACTIVE",
    securityToken: token,
    hodApprovedBy: hodName || "HOD",
    hodApprovedAt: new Date().toISOString()
  };

  memoryApplications = memoryApplications.map(a => a.id === appId ? { ...a, ...updateFields } : a);

  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, appId), updateFields);
  } catch (error) {
    console.error("Error updating HOD approval in Firestore:", error);
  }

  return memoryApplications.find(a => a.id === appId);
};

export const hodRejectApplication = async (appId, hodName, reason) => {
  const target = memoryApplications.find(a => a.id === appId);
  if (!target) return null;

  const updateFields = {
    status: "REJECTED_BY_HOD",
    rejectionReason: reason || "Rejected by Head of Department",
    rejectedBy: hodName || "HOD",
    rejectedAt: new Date().toISOString()
  };

  memoryApplications = memoryApplications.map(a => a.id === appId ? { ...a, ...updateFields } : a);

  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, appId), updateFields);
  } catch (error) {
    console.error("Error updating HOD rejection in Firestore:", error);
  }

  return memoryApplications.find(a => a.id === appId);
};

export const verifyGatePass = (scannedCode) => {
  let searchId = scannedCode.trim();

  try {
    const parsed = JSON.parse(scannedCode);
    if (parsed.gatePassId) searchId = parsed.gatePassId;
    else if (parsed.appId) searchId = parsed.appId;
  } catch (e) {}

  const app = memoryApplications.find(a => 
    a.gatePassId === searchId || 
    a.id === searchId || 
    a.securityToken === searchId
  );

  if (!app) {
    return {
      isValid: false,
      reason: "Invalid QR Code or Gate Pass record not found in Firestore database.",
      app: null
    };
  }

  if (app.status !== "APPROVED_BY_HOD") {
    return {
      isValid: false,
      reason: app.status.includes("REJECTED") 
        ? `Application was REJECTED (${app.rejectionReason || "No reason specified"})` 
        : `Gate Pass is still pending approval (${app.status}).`,
      app: app
    };
  }

  if (app.passStatus === "REVOKED") {
    return {
      isValid: false,
      reason: "This Gate Pass has been REVOKED by college administration.",
      app: app
    };
  }

  const today = new Date().toISOString().split("T")[0];
  if (app.leaveDate < today) {
    return {
      isValid: false,
      reason: `Gate Pass EXPIRED. Valid date was ${app.leaveDate}, today is ${today}.`,
      app: app
    };
  }

  if (app.passStatus === "USED_EXIT") {
    return {
      isValid: false,
      reason: `This Gate Pass has ALREADY been completed (Exit: ${app.exitTime || 'recorded'}).`,
      app: app
    };
  }

  return {
    isValid: true,
    reason: "Gate Pass Verified & Valid.",
    app: app
  };
};

export const recordGateMovement = async (appId, actionType, guardInfo, customTimeStr = null) => {
  const app = memoryApplications.find(a => a.id === appId || a.gatePassId === appId);
  if (!app) return { success: false, message: "Gate pass not found" };

  const timeString = customTimeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newPassStatus = actionType === "ENTRY" ? "USED_ENTRY" : "USED_EXIT";
  
  const appUpdate = {
    passStatus: newPassStatus,
    exitTime: actionType === "EXIT" ? timeString : app.exitTime,
    entryTime: actionType === "ENTRY" ? timeString : app.entryTime,
    lastScanTime: new Date().toISOString(),
    lastGate: guardInfo.gate || "Main Campus Gate #1"
  };

  memoryApplications = memoryApplications.map(a => a.id === app.id ? { ...a, ...appUpdate } : a);

  const logId = `LOG-${Date.now().toString().slice(-6)}`;
  const newLog = {
    id: logId,
    gatePassId: app.gatePassId,
    appId: app.id,
    studentRoll: app.rollNumber,
    studentName: app.studentName,
    actionType: actionType,
    recordedTime: timeString,
    timestamp: new Date().toISOString(),
    securityGuardId: guardInfo.employeeId || "EMP-SEC-007",
    securityGuardName: guardInfo.name || "Senior Officer Mahendra Singh",
    gate: guardInfo.gate || "Main Campus Gate #1",
    status: "VALID",
    message: `Student ${actionType} recorded at ${timeString}.`
  };

  memoryLogs = [newLog, ...memoryLogs];

  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, app.id), appUpdate);
    await setDoc(doc(db, LOGS_COLLECTION, logId), newLog);
  } catch (error) {
    console.error("Error logging movement in Firestore:", error);
  }

  return {
    success: true,
    log: newLog,
    app: memoryApplications.find(a => a.id === app.id)
  };
};

// Admin functionality to create account with password & update existing passwords
export const saveUsers = async (users) => {
  memoryUsers = users;
  try {
    users.forEach(async (u) => {
      await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      // Attempt to register in Firebase Auth if user has password
      if (u.email && u.password && u.password.length >= 6) {
        try {
          await createUserWithEmailAndPassword(auth, u.email, u.password);
        } catch (e) {}
      }
    });
  } catch (e) {
    console.error("Error saving users to Firestore:", e);
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  const user = memoryUsers.find(u => u.id === userId || u.email === userId);
  if (!user) return { success: false, message: "User not found" };

  const updateFields = {
    password: newPassword,
    updatedAt: new Date().toISOString()
  };

  memoryUsers = memoryUsers.map(u => u.id === user.id ? { ...u, ...updateFields } : u);

  try {
    await updateDoc(doc(db, USERS_COLLECTION, user.id), updateFields);
  } catch (e) {
    console.error("Error updating user password in Firestore:", e);
  }

  return { success: true, message: `Password updated successfully for ${user.name} (${user.email}).` };
};

export const updateUserDetails = async (userId, updatedData) => {
  const user = memoryUsers.find(u => u.id === userId);
  if (!user) return { success: false, message: "User not found" };

  const updatedUser = { ...user, ...updatedData, updatedAt: new Date().toISOString() };
  memoryUsers = memoryUsers.map(u => u.id === userId ? updatedUser : u);

  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), updatedUser);
  } catch (e) {
    console.error("Error updating user details in Firestore:", e);
  }

  return { success: true, message: `User ${updatedUser.name} details updated successfully.`, user: updatedUser };
};

export const adminUpdateApplication = async (appId, updatedData) => {
  const app = memoryApplications.find(a => a.id === appId);
  if (!app) return { success: false, message: "Application not found" };

  const updatedApp = { ...app, ...updatedData, updatedAt: new Date().toISOString() };
  memoryApplications = memoryApplications.map(a => a.id === appId ? updatedApp : a);

  try {
    await setDoc(doc(db, APPLICATIONS_COLLECTION, appId), updatedApp);
  } catch (e) {
    console.error("Error updating application in Firestore:", e);
  }

  return { success: true, message: `Application ${appId} updated successfully.`, app: updatedApp };
};

export const adminDeleteApplication = async (appId) => {
  memoryApplications = memoryApplications.filter(a => a.id !== appId);
  return { success: true, message: `Application ${appId} deleted.` };
};

export const adminDeleteLog = async (logId) => {
  memoryLogs = memoryLogs.filter(l => l.id !== logId);
  return { success: true, message: `Log entry ${logId} deleted.` };
};

export const resetDemoData = async () => {
  memoryUsers = [...SEED_USERS];
  memoryApplications = [...INITIAL_APPLICATIONS];
  memoryLogs = [...INITIAL_LOGS];
  localStorage.removeItem("firestore_cached_users");
  localStorage.removeItem("firestore_cached_apps");
  localStorage.removeItem("firestore_cached_logs");
};

