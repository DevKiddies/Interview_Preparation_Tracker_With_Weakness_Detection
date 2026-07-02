// adminAllUsersData.js — Static mock data for the All Users admin page.
// Replace with real API calls (GET /api/admin/users) when backend is ready.
// Shape matches expected API response structure.

export const allUsersData = [
  { id: 101, name: "Rohan Kumar",    email: "rohan.k@gmail.com",       joinDate: "2025-12-15", lastActive: "2026-06-30", status: "active",   verified: true,  testsAttempted: 28, avgScore: 94, streak: 21, targetCompany: "Google",    experience: "Fresher"    },
  { id: 102, name: "Priya Sharma",   email: "priya.s@gmail.com",        joinDate: "2025-11-20", lastActive: "2026-06-29", status: "active",   verified: true,  testsAttempted: 32, avgScore: 91, streak: 14, targetCompany: "Microsoft", experience: "1-2 Years"  },
  { id: 103, name: "Amit Verma",     email: "amit.v@outlook.com",       joinDate: "2026-01-08", lastActive: "2026-06-28", status: "active",   verified: true,  testsAttempted: 25, avgScore: 88, streak: 18, targetCompany: "Amazon",    experience: "Fresher"    },
  { id: 104, name: "Sneha Patel",    email: "sneha.p@yahoo.com",        joinDate: "2026-02-14", lastActive: "2026-06-27", status: "active",   verified: true,  testsAttempted: 19, avgScore: 85, streak: 9,  targetCompany: "Flipkart",  experience: "2-3 Years"  },
  { id: 105, name: "Karan Singh",    email: "karan.s@gmail.com",        joinDate: "2025-10-30", lastActive: "2026-06-26", status: "active",   verified: true,  testsAttempted: 22, avgScore: 82, streak: 12, targetCompany: "TCS",       experience: "Fresher"    },
  { id: 106, name: "Meera Nair",     email: "meera.n@gmail.com",        joinDate: "2026-03-05", lastActive: "2026-06-24", status: "active",   verified: true,  testsAttempted: 15, avgScore: 78, streak: 7,  targetCompany: "Infosys",   experience: "Fresher"    },
  { id: 107, name: "Arjun Reddy",    email: "arjun.r@gmail.com",        joinDate: "2026-01-22", lastActive: "2026-06-20", status: "inactive", verified: true,  testsAttempted: 11, avgScore: 71, streak: 0,  targetCompany: "Wipro",     experience: "1-2 Years"  },
  { id: 108, name: "Tanvi Desai",    email: "tanvi.d@hotmail.com",      joinDate: "2026-04-10", lastActive: "2026-06-10", status: "inactive", verified: false, testsAttempted: 6,  avgScore: 65, streak: 0,  targetCompany: "HCL",       experience: "Fresher"    },
  { id: 109, name: "Nikhil Joshi",   email: "nikhil.j@gmail.com",       joinDate: "2026-05-18", lastActive: "2026-06-29", status: "active",   verified: true,  testsAttempted: 9,  avgScore: 74, streak: 5,  targetCompany: "Google",    experience: "Fresher"    },
  { id: 110, name: "Aisha Khan",     email: "aisha.k@gmail.com",        joinDate: "2026-02-28", lastActive: "2026-06-25", status: "active",   verified: true,  testsAttempted: 17, avgScore: 80, streak: 11, targetCompany: "Adobe",     experience: "2-3 Years"  },
  { id: 111, name: "Deepak Rao",     email: "deepak.r@yahoo.com",       joinDate: "2025-11-05", lastActive: "2026-05-30", status: "inactive", verified: true,  testsAttempted: 8,  avgScore: 60, streak: 0,  targetCompany: "Cognizant", experience: "Fresher"    },
  { id: 112, name: "Ritika Gupta",   email: "ritika.g@outlook.com",     joinDate: "2026-03-22", lastActive: "2026-06-28", status: "active",   verified: false, testsAttempted: 13, avgScore: 76, streak: 4,  targetCompany: "Accenture", experience: "Fresher"    },
  { id: 113, name: "Saurabh Mishra", email: "saurabh.m@gmail.com",      joinDate: "2026-04-30", lastActive: "2026-06-27", status: "active",   verified: true,  testsAttempted: 20, avgScore: 83, streak: 8,  targetCompany: "Amazon",    experience: "1-2 Years"  },
  { id: 114, name: "Lakshmi Iyer",   email: "lakshmi.i@gmail.com",      joinDate: "2026-01-14", lastActive: "2026-06-22", status: "active",   verified: true,  testsAttempted: 24, avgScore: 87, streak: 16, targetCompany: "Microsoft", experience: "Fresher"    },
  { id: 115, name: "Varun Malik",    email: "varun.m@rediffmail.com",   joinDate: "2026-05-02", lastActive: "2026-06-15", status: "inactive", verified: false, testsAttempted: 4,  avgScore: 52, streak: 0,  targetCompany: "TCS",       experience: "Fresher"    },
  { id: 116, name: "Pooja Agarwal",  email: "pooja.a@gmail.com",        joinDate: "2026-06-01", lastActive: "2026-06-30", status: "active",   verified: true,  testsAttempted: 7,  avgScore: 69, streak: 3,  targetCompany: "Wipro",     experience: "Fresher"    },
  { id: 117, name: "Rahul Tiwari",   email: "rahul.t@gmail.com",        joinDate: "2025-10-12", lastActive: "2026-06-29", status: "active",   verified: true,  testsAttempted: 35, avgScore: 90, streak: 20, targetCompany: "Google",    experience: "2-3 Years"  },
  { id: 118, name: "Shreya Bose",    email: "shreya.b@gmail.com",       joinDate: "2026-03-17", lastActive: "2026-06-26", status: "active",   verified: true,  testsAttempted: 16, avgScore: 79, streak: 6,  targetCompany: "Flipkart",  experience: "Fresher"    },
];

export const banDurations = [
  { label: "7 Days",    value: "7"    },
  { label: "14 Days",   value: "14"   },
  { label: "30 Days",   value: "30"   },
  { label: "Permanent", value: "permanent" },
];

export const banReasonOptions = [
  "Cheating / Answer Sharing",
  "Abusive Behaviour",
  "Multiple Account Creation",
  "Spam / Bot Activity",
  "Offensive Language",
  "Other",
];
