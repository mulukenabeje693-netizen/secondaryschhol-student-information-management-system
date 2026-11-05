import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from './config/env.js';
import { readJsonFile, writeJsonFile } from './config/db.js';

const defaultAdmin = {
  id: crypto.randomUUID(),
  name: 'School Administrator',
  email: env.adminEmail,
  passwordHash: bcrypt.hashSync(env.adminPassword, 10),
  role: 'super_admin',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const makeDefaultAnnouncements = () => [
  {
    id: crypto.randomUUID(),
    title: 'Academic Year Kickoff',
    content: 'Welcome back to Secondary School Information Management System. Please review the timetable and class assignments.',
    audience: 'all',
    createdBy: defaultAdmin.email,
    publishedAt: new Date().toISOString()
  }
];

const makeDefaultStudents = () => [
  {
    id: crypto.randomUUID(),
    studentId: 'BS-2025-001',
    fullName: 'Abebe Bekele',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Male',
    dateOfBirth: '2009-06-12',
    address: 'Addis Ababa',
    guardianName: 'Bekele Abebe',
    guardianPhone: '+251911000001',
    enrollmentStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    studentId: 'BS-2025-002',
    fullName: 'Selam Tadesse',
    grade: 'Grade 11',
    section: 'B',
    gender: 'Female',
    dateOfBirth: '2008-02-18',
    address: 'Bahir Dar',
    guardianName: 'Tadesse Hailu',
    guardianPhone: '+251911000002',
    enrollmentStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const makeDefaultTeachers = () => [
  {
    id: crypto.randomUUID(),
    teacherId: 'T-101',
    fullName: 'Mekdes Alemu',
    department: 'Mathematics',
    email: 'mekdes@bemilew.edu',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    teacherId: 'T-102',
    fullName: 'Daniel Bekele',
    department: 'Science',
    email: 'daniel@bemilew.edu',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const makeDefaultAttendance = () => [
  {
    id: crypto.randomUUID(),
    studentId: 'BS-2025-001',
    className: 'Grade 10',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
    recordedBy: 'admin@bemilew.edu'
  }
];

const makeDefaultFees = () => [
  {
    id: crypto.randomUUID(),
    studentId: 'BS-2025-001',
    studentName: 'Abebe Bekele',
    category: 'Tuition',
    amount: 1200,
    status: 'Paid',
    date: new Date().toISOString().slice(0, 10)
  }
];

const makeDefaultTimetable = () => [
  {
    id: crypto.randomUUID(),
    day: 'Monday',
    time: '08:00-09:00',
    className: 'Grade 10',
    subject: 'Mathematics',
    teacher: 'Mekdes Alemu',
    room: 'Room 101',
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    day: 'Tuesday',
    time: '10:00-11:00',
    className: 'Grade 11',
    subject: 'Science',
    teacher: 'Daniel Bekele',
    room: 'Lab 2',
    createdAt: new Date().toISOString()
  }
];

const makeDefaultResults = () => [
  {
    id: crypto.randomUUID(),
    studentId: 'BS-2025-001',
    studentName: 'Abebe Bekele',
    subject: 'Mathematics',
    exam: 'Midterm',
    score: 88,
    maxScore: 100,
    grade: 'A',
    recordedAt: new Date().toISOString()
  }
];

const makeDefaultReportCards = () => {
  const student = makeDefaultStudents()[0];
  return [
    {
      id: crypto.randomUUID(),
      studentId: student.studentId,
      studentName: student.fullName,
      grade: student.grade,
      section: student.section,
      term: 'Semester I',
      academicYear: '2025/2026',
      gpa: 3.8,
      remark: 'Excellent performance and strong academic progress.',
      subjects: [
        { name: 'Mathematics', score: 88, maxScore: 100, grade: 'A' },
        { name: 'Science', score: 82, maxScore: 100, grade: 'A' }
      ],
      generatedAt: new Date().toISOString()
    }
  ];
};

const makeDefaultParents = () => [
  {
    id: crypto.randomUUID(),
    name: 'Bekele Abebe',
    email: 'guardian.bekele@bemilew.edu',
    passwordHash: bcrypt.hashSync('Parent123!', 10),
    role: 'parent',
    status: 'active',
    linkedStudentIds: ['BS-2025-001'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const makeDefaultStudentUser = () => ({
  id: crypto.randomUUID(),
  studentId: 'BS-2025-001',
  name: 'Abebe Bekele',
  email: 'student.abebe@bemilew.edu',
  passwordHash: bcrypt.hashSync('Student123!', 10),
  role: 'student',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const makeDefaultSchoolSettings = () => ({
  schoolName: 'Secondary School Information Management System',
  motto: 'Excellence through knowledge',
  academicYear: '2025/2026',
  semester: 'Semester I',
  gradingScale: 'A=90-100, B=80-89, C=70-79, D=60-69, F=0-59',
  updatedAt: new Date().toISOString()
});

const makeDefaultClasses = () => [
  { id: crypto.randomUUID(), name: 'Grade 10', section: 'A', capacity: 40, academicYear: '2025/2026' },
  { id: crypto.randomUUID(), name: 'Grade 11', section: 'B', capacity: 35, academicYear: '2025/2026' }
];

const makeDefaultSubjects = () => [
  { id: crypto.randomUUID(), name: 'Mathematics', grade: 'Grade 10', teacher: 'Mekdes Alemu' },
  { id: crypto.randomUUID(), name: 'Biology', grade: 'Grade 11', teacher: 'Daniel Bekele' }
];

const ensureSeedData = () => {
  const users = readJsonFile('users.json', []);
  const students = readJsonFile('students.json', []);
  const announcements = readJsonFile('announcements.json', makeDefaultAnnouncements());
  const parents = readJsonFile('parents.json', makeDefaultParents());
  const auditLogs = readJsonFile('audit-logs.json', []);
  const teachers = readJsonFile('teachers.json', makeDefaultTeachers());
  const attendanceRecords = readJsonFile('attendance.json', makeDefaultAttendance());
  const fees = readJsonFile('fees.json', makeDefaultFees());
  const timetable = readJsonFile('timetable.json', makeDefaultTimetable());
  const results = readJsonFile('results.json', makeDefaultResults());
  const reportCards = readJsonFile('report-cards.json', makeDefaultReportCards());
  const schoolSettings = readJsonFile('school-settings.json', makeDefaultSchoolSettings());
  const classes = readJsonFile('classes.json', makeDefaultClasses());
  const subjects = readJsonFile('subjects.json', makeDefaultSubjects());

  if (!users.some((user) => user.email === env.adminEmail)) {
    users.push(defaultAdmin);
    writeJsonFile('users.json', users);
  }

  if (!users.some((user) => user.role === 'parent')) {
    const defaultParent = parents[0];
    if (defaultParent) {
      users.push(defaultParent);
      writeJsonFile('users.json', users);
    }
  }

  if (!users.some((user) => user.role === 'student')) {
    users.push(makeDefaultStudentUser());
    writeJsonFile('users.json', users);
  }

  if (!students.length) {
    writeJsonFile('students.json', makeDefaultStudents());
  }

  if (!announcements.length) {
    writeJsonFile('announcements.json', makeDefaultAnnouncements());
  }

  if (!teachers.length) {
    writeJsonFile('teachers.json', makeDefaultTeachers());
  }

  if (!attendanceRecords.length) {
    writeJsonFile('attendance.json', makeDefaultAttendance());
  }

  if (!fees.length) {
    writeJsonFile('fees.json', makeDefaultFees());
  }

  if (!timetable.length) {
    writeJsonFile('timetable.json', makeDefaultTimetable());
  }

  if (!results.length) {
    writeJsonFile('results.json', makeDefaultResults());
  }

  if (!reportCards.length) {
    writeJsonFile('report-cards.json', makeDefaultReportCards());
  }

  if (!auditLogs.length) {
    writeJsonFile('audit-logs.json', [{
      id: crypto.randomUUID(),
      action: 'system.seeded',
      actor: 'system',
      details: 'Initial school data created.',
      timestamp: new Date().toISOString()
    }]);
  }

  if (!Object.keys(schoolSettings).length) {
    writeJsonFile('school-settings.json', makeDefaultSchoolSettings());
  }

  if (!classes.length) {
    writeJsonFile('classes.json', makeDefaultClasses());
  }

  if (!subjects.length) {
    writeJsonFile('subjects.json', makeDefaultSubjects());
  }
};

ensureSeedData();

export const getUsers = () => readJsonFile('users.json', [defaultAdmin, ...makeDefaultParents(), makeDefaultStudentUser()]);
export const saveUsers = (users) => writeJsonFile('users.json', users);
export const getParents = () => readJsonFile('parents.json', makeDefaultParents());
export const saveParents = (parents) => writeJsonFile('parents.json', parents);
export const getAuditLogs = () => readJsonFile('audit-logs.json', []);
export const saveAuditLogs = (logs) => writeJsonFile('audit-logs.json', logs);
export const logAuditEvent = (action, actor, details = {}) => {
  const logs = getAuditLogs();
  logs.unshift({
    id: crypto.randomUUID(),
    action,
    actor: actor || 'system',
    details,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs.slice(0, 200));
  return logs[0];
};
export const getStudents = () => readJsonFile('students.json', makeDefaultStudents());
export const saveStudents = (students) => writeJsonFile('students.json', students);
export const getAnnouncements = () => readJsonFile('announcements.json', makeDefaultAnnouncements());
export const saveAnnouncements = (announcements) => writeJsonFile('announcements.json', announcements);
export const getTeachers = () => readJsonFile('teachers.json', makeDefaultTeachers());
export const saveTeachers = (teachers) => writeJsonFile('teachers.json', teachers);
export const getAttendance = () => readJsonFile('attendance.json', makeDefaultAttendance());
export const saveAttendance = (attendance) => writeJsonFile('attendance.json', attendance);
export const getFees = () => readJsonFile('fees.json', makeDefaultFees());
export const saveFees = (fees) => writeJsonFile('fees.json', fees);
export const getTimetable = () => readJsonFile('timetable.json', makeDefaultTimetable());
export const saveTimetable = (entries) => writeJsonFile('timetable.json', entries);
export const getResults = () => readJsonFile('results.json', makeDefaultResults());
export const saveResults = (entries) => writeJsonFile('results.json', entries);
export const getReportCards = () => readJsonFile('report-cards.json', makeDefaultReportCards());
export const saveReportCards = (entries) => writeJsonFile('report-cards.json', entries);
export const getSchoolSettings = () => readJsonFile('school-settings.json', makeDefaultSchoolSettings());
export const saveSchoolSettings = (settings) => writeJsonFile('school-settings.json', settings);
export const getClasses = () => readJsonFile('classes.json', makeDefaultClasses());
export const saveClasses = (entries) => writeJsonFile('classes.json', entries);
export const getSubjects = () => readJsonFile('subjects.json', makeDefaultSubjects());
export const saveSubjects = (entries) => writeJsonFile('subjects.json', entries);
