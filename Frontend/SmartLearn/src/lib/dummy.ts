
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
  status: 'draft' | 'published' | 'archived';
  lectures: Lecture[];
}

export interface Lecture {
  id: number;
  topic: string;
  videoUrl: string;
  summary: string;
  validationStatus: 'pending' | 'validated' | 'rejected';
}

export interface Assignment {
  id: number;
  lectureId: number;
  description: string;
  deadline: string;
}

export interface Quiz {
    id: number;
    lectureId: number;
    title: string;
}

export interface StudentDashboardData {
    user: User;
    enrolledCourses: Course[];
    recentGrades: { course: string; grade: string }[];
    upcomingAssignments: Assignment[];
}

export interface TeacherDashboardData {
    user: User;
    taughtCourses: Course[];
    recentSubmissions: { studentName: string; assignment: string, course: string }[];
    courseStats: { courseTitle: string; studentCount: number; completionRate: number }[];
}


export const users: User[] = [
    { id: 1, fullName: "Arooj Ahmed", email: "arooj@example.com", role: 'student' },
    { id: 2, fullName: "Dr. Bilal Khan", email: "bilal@example.com", role: 'teacher' },
];

export const courses: Course[] = [
    {
        id: 1,
        title: "Introduction to Python",
        description: "A beginner-friendly introduction to Python programming.",
        teacherId: 2,
        status: 'published',
        lectures: [
            { id: 1, topic: "Variables and Data Types", videoUrl: "https://www.youtube.com/embed/watch?v=__6h-yde6so", summary: "Learn about variables and data types in Python.", validationStatus: 'validated' },
            { id: 2, topic: "Control Flow", videoUrl: "https://www.youtube.com/embed/watch?v=__6h-yde6so", summary: "Understand control flow statements like if, for, and while.", validationStatus: 'validated' },
        ]
    },
    {
        id: 2,
        title: "Data Structures in C++",
        description: "An in-depth look at data structures using C++.",
        teacherId: 2,
        status: 'published',
        lectures: [
            { id: 3, topic: "Arrays and Vectors", videoUrl: "https://www.youtube.com/embed/watch?v=__6h-yde6so", summary: "Learn about arrays and vectors.", validationStatus: 'validated' },
            { id: 4, topic: "Linked Lists", videoUrl: "https://www.youtube.com/embed/watch?v=__6h-yde6so", summary: "Understand the concept of linked lists.", validationStatus: 'pending' },
        ]
    }
];

export const assignments: Assignment[] = [
    { id: 1, lectureId: 1, description: "Python variables practice", deadline: "2025-12-30" },
    { id: 2, lectureId: 3, description: "Implement a vector-based stack", deadline: "2026-01-05" }
];

export const quizzes: Quiz[] = [
    { id: 1, lectureId: 2, title: "Quiz on Control Flow"},
    { id: 2, lectureId: 4, title: "Quiz on Linked Lists"}
];


export const studentDashboardData: StudentDashboardData = {
    user: users.find(u => u.role === 'student')!,
    enrolledCourses: courses,
    recentGrades: [
        { course: "Discrete Structures", grade: "A" },
        { course: "Linear Algebra", grade: "B+" }
    ],
    upcomingAssignments: assignments
};

export const teacherDashboardData: TeacherDashboardData = {
    user: users.find(u => u.role === 'teacher')!,
    taughtCourses: courses,
    recentSubmissions: [
        { studentName: "Ali", assignment: "Python variables practice", course: "Introduction to Python" },
        { studentName: "Fatima", assignment: "Python variables practice", course: "Introduction to Python" },
    ],
    courseStats: [
        { courseTitle: "Introduction to Python", studentCount: 50, completionRate: 75 },
        { courseTitle: "Data Structures in C++", studentCount: 40, completionRate: 60 },
    ]
}
