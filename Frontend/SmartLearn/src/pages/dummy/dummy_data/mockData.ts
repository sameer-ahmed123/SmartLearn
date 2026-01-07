// src/pages/dummy/dummydata/mockData.ts

export const analyticsData = {
    totalStudents: 1240,
    activeCourses: 12,
    avgCompletion: 78,
    revenue: "$12,450",
    engagement: [40, 65, 55, 80, 70, 90, 85], // 7 days data
    topCourses: [
        { name: "Advanced Python Patterns", students: 340, rating: 4.8 },
        { name: "React for Beginners", students: 290, rating: 4.6 },
        { name: "System Design 101", students: 210, rating: 4.9 },
    ]
};

export const studentDashboardData = {
    welcomeMessage: "Welcome back, Alex!",
    learningStreak: 12, // days
    coursesInProgress: [
        { id: 1, title: "Intro to AI", progress: 65, nextLesson: "Neural Networks Basics" },
        { id: 2, title: "Django Backend", progress: 30, nextLesson: "Models & Migrations" },
        { id: 3, title: "UI/UX Principles", progress: 90, nextLesson: "Final Project Submission" },
    ],
    upcomingDeadlines: [
        { id: 101, title: "AI Ethics Essay", date: "Tomorrow, 5:00 PM", type: "assignment" },
        { id: 102, title: "Django Quiz 3", date: "Jan 10, 11:59 PM", type: "quiz" },
    ]
};

export const settingsData = {
    profile: {
        name: "Alex Johnson",
        email: "alex.j@example.com",
        role: "Student"
    },
    notifications: {
        email: true,
        sms: false,
        marketing: true
    }
};



export const assignmentsData = [
    { 
        id: 1, 
        title: "React Components Deep Dive", 
        course: "Frontend Masterclass", 
        dueDate: "2026-01-15", 
        status: "Active", 
        submissions: "45/50" 
    },
    { 
        id: 2, 
        title: "Python Data Structures", 
        course: "CS101", 
        dueDate: "2026-01-10", 
        status: "Urgent", 
        submissions: "12/50" 
    },
    { 
        id: 3, 
        title: "API Design Patterns Essay", 
        course: "Backend Architecture", 
        dueDate: "2025-12-20", 
        status: "Closed", 
        submissions: "50/50" 
    },
    { 
        id: 4, 
        title: "Final Project Proposal", 
        course: "Capstone", 
        dueDate: "2026-02-01", 
        status: "Draft", 
        submissions: "0/30" 
    },
];

export const gradebookData = {
    classAverage: 84,
    highestScore: 98,
    pendingGrading: 12,
    students: [
        { id: 1, name: "Alice Smith", scores: [85, 90, 88, 92], final: 89, status: "Pass" },
        { id: 2, name: "Bob Jones", scores: [70, 75, 65, 72], final: 70, status: "Pass" },
        { id: 3, name: "Charlie Day", scores: [95, 98, 92, 96], final: 95, status: "Distinction" },
        { id: 4, name: "Diana Prince", scores: [60, 55, 62, 58], final: 59, status: "At Risk" },
        { id: 5, name: "Evan Wright", scores: [88, 85, 84, 86], final: 86, status: "Pass" },
    ],
    columns: ["Q1", "Midterm", "Q2", "Final"]
};