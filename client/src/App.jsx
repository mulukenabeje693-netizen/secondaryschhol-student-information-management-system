import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Megaphone, LogOut, UserCircle, School, Users, BookOpenCheck, WalletCards, CalendarRange, ClipboardCheck, Settings, BookCopy, Eye, EyeOff, LoaderCircle, Bell, ArrowRight, ShieldCheck } from 'lucide-react';
import api from './api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const roleHome = {
  admin: '/admin/dashboard',
  parent: '/parent/dashboard',
  teacher: '/teacher/dashboard',
  record: '/record/dashboard',
  system_admin: '/system-admin/dashboard',
  student: '/student/dashboard',
  director: '/director/dashboard'
};

const roleAliases = { super_admin: 'admin', registrar: 'record' };
const getRole = (role) => roleAliases[role] || role;

const roleNavigation = {
  admin: [
    { to: '/students', label: 'Students', icon: GraduationCap },
    { to: '/teachers', label: 'Teachers', icon: Users },
    { to: '/parents', label: 'Parents', icon: UserCircle },
    { to: '/academics', label: 'Classes & Subjects', icon: BookCopy },
    { to: '/attendance', label: 'Attendance', icon: BookOpenCheck },
    { to: '/fees', label: 'Payments', icon: WalletCards },
    { to: '/report-cards', label: 'Reports', icon: ClipboardCheck },
    { to: '/settings', label: 'Users & Settings', icon: Settings }
  ],
  parent: [
    { to: '/parents', label: 'My Child', icon: UserCircle },
    { to: '/timetable', label: 'Class Schedule', icon: CalendarRange },
    { to: '/announcements', label: 'Announcements', icon: Megaphone }
  ],
  teacher: [
    { to: '/students', label: 'My Students', icon: GraduationCap },
    { to: '/teachers', label: 'My Classes', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: BookOpenCheck },
    { to: '/results', label: 'Marks & Grades', icon: ClipboardCheck },
    { to: '/report-cards', label: 'Academic Reports', icon: BookCopy },
    { to: '/timetable', label: 'Class Schedule', icon: CalendarRange }
  ],
  record: [
    { to: '/students', label: 'Student Records', icon: GraduationCap },
    { to: '/parents', label: 'Parents', icon: Users },
    { to: '/report-cards', label: 'Student Reports', icon: ClipboardCheck },
    { to: '/attendance', label: 'Attendance', icon: BookOpenCheck }
  ],
  system_admin: [
    { to: '/settings', label: 'System Configuration', icon: Settings },
    { to: '/audit-logs', label: 'System Logs', icon: ClipboardCheck },
    { to: '/teachers', label: 'User Directory', icon: Users }
  ],
  student: [
    { to: '/student-portal', label: 'My Profile & Results', icon: UserCircle },
    { to: '/timetable', label: 'My Timetable', icon: CalendarRange },
    { to: '/report-cards', label: 'Academic Reports', icon: ClipboardCheck },
    { to: '/announcements', label: 'Announcements', icon: Megaphone }
  ],
  director: [
    { to: '/students', label: 'Students', icon: GraduationCap },
    { to: '/teachers', label: 'Staff Performance', icon: Users },
    { to: '/attendance', label: 'Attendance Statistics', icon: BookOpenCheck },
    { to: '/fees', label: 'Financial Reports', icon: WalletCards },
    { to: '/report-cards', label: 'School Reports', icon: ClipboardCheck },
    { to: '/audit-logs', label: 'School-wide Activity', icon: ShieldCheck }
  ]
};

const roleColor = {
  admin: '#1d4ed8', system_admin: '#334155', record: '#15803d',
  teacher: '#7c3aed', student: '#d97706', parent: '#dc2626', director: '#0f766e'
};

const roleTitles = {
  admin: 'Admin', parent: 'Parent', teacher: 'Teacher', record: 'Record Officer',
  system_admin: 'System Administrator', student: 'Student', director: 'School Director'
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bemilew-token') || sessionStorage.getItem('bemilew-token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        const storage = localStorage.getItem('bemilew-token') ? localStorage : sessionStorage;
        storage.setItem('bemilew-user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('bemilew-token');
        localStorage.removeItem('bemilew-user');
        sessionStorage.removeItem('bemilew-token');
        sessionStorage.removeItem('bemilew-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = Boolean(user);

  if (loading) {
    return <div className="app-shell"><div className="login-panel">Loading…</div></div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={(nextUser) => setUser(nextUser)} />;
  }

  return <AuthenticatedApp user={user} onLogout={() => setUser(null)} />;
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const { data } = await api.post('/auth/login', { email: form.email.toLowerCase(), password: form.password });
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;
      storage.setItem('bemilew-token', data.token);
      storage.setItem('bemilew-user', JSON.stringify(data.user));
      otherStorage.removeItem('bemilew-token');
      otherStorage.removeItem('bemilew-user');
      onLogin(data.user);
      navigate(roleHome[getRole(data.user.role)] || '/', { replace: true, state: { success: 'Signed in successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand-mark"><School size={25} /><span>SSIMS</span></div>
        <div className="login-brand-copy">
          <div className="login-eyebrow">SCHOOL MANAGEMENT PLATFORM</div>
          <h1>Secondary School Information Management System</h1>
          <p>One secure place for learning, school operations, and community.</p>
        </div>
        <div className="login-brand-footer">Secure access for your school community</div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><School size={24} /><span>SSIMS</span></div>
          <div className="login-form-heading">
            <div className="login-eyebrow">WELCOME BACK</div>
            <h2>Sign in to your account</h2>
            <p>Use your school account to continue.</p>
          </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input id="login-email" type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-field">
              <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="login-options">
            <label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
            <button type="button" className="text-action" onClick={() => { setError(''); setMessage('Please contact your school administrator to reset your password.'); }}>Forgot password?</button>
          </div>
          {error && <div className="login-message error-message" role="alert">{error}</div>}
          {message && <div className="login-message success-message" role="status">{message}</div>}
          <button className="sign-in-button" type="submit" disabled={submitting}>
            {submitting ? <><LoaderCircle size={18} className="spin" /> Signing in…</> : <>Sign in <ArrowRight size={18} /></>}
          </button>
        </form>
          <footer className="login-footer">Secondary School Information Management System</footer>
        </div>
      </section>
    </div>
  );
}

function AuthenticatedApp({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('bemilew-token');
    localStorage.removeItem('bemilew-user');
    sessionStorage.removeItem('bemilew-token');
    sessionStorage.removeItem('bemilew-user');
    onLogout();
    navigate('/');
  };

  const role = getRole(user.role);
  const homePath = roleHome[role] || '/';
  const navItems = roleNavigation[role] || [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={homePath}>SSIMS</Link>
        <div className="nav-actions">
          <span className="profile-summary"><span className="profile-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span><span><strong>{user.name}</strong><small>{roleTitles[role] || role}</small></span></span>
          <Link className="notification-link" to="/announcements" aria-label="Notifications" title="Notifications"><Bell size={18} /></Link>
          <button className="btn secondary" onClick={handleLogout}><LogOut size={16} /> Logout</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <nav>
            <Link to={homePath} className={`nav-btn ${location.pathname === homePath ? 'active' : ''}`}>
              <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}><LayoutDashboard size={18} /> Dashboard</span>
            </Link>
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={`nav-btn ${location.pathname === to ? 'active' : ''}`}>
                <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                  <Icon size={18} /> {label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Navigate to={homePath} replace />} />
            <Route path="/admin/dashboard" element={<RoleRoute user={user} allowed={['admin']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/parent/dashboard" element={<RoleRoute user={user} allowed={['parent']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/teacher/dashboard" element={<RoleRoute user={user} allowed={['teacher']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/record/dashboard" element={<RoleRoute user={user} allowed={['record']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/system-admin/dashboard" element={<RoleRoute user={user} allowed={['system_admin']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/student/dashboard" element={<RoleRoute user={user} allowed={['student']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/director/dashboard" element={<RoleRoute user={user} allowed={['director']}><RoleDashboardPage user={user} /></RoleRoute>} />
            <Route path="/students" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'teacher', 'director']}><StudentsPage user={user} /></RoleRoute>} />
            <Route path="/student-portal" element={<RoleRoute user={user} allowed={['student']}><StudentPortalPage user={user} /></RoleRoute>} />
            <Route path="/parents" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'parent']}><ParentsPage user={user} /></RoleRoute>} />
            <Route path="/teachers" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'teacher', 'director']}><TeachersPage user={user} /></RoleRoute>} />
            <Route path="/attendance" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'teacher', 'director', 'parent']}><AttendancePage user={user} /></RoleRoute>} />
            <Route path="/timetable" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'teacher', 'student', 'parent']}><TimetablePage user={user} /></RoleRoute>} />
            <Route path="/results" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'teacher', 'student', 'parent', 'director']}><ResultsPage user={user} /></RoleRoute>} />
            <Route path="/report-cards" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'teacher', 'student', 'parent', 'director']}><ReportCardsPage user={user} /></RoleRoute>} />
            <Route path="/audit-logs" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'director']}><AuditLogsPage user={user} /></RoleRoute>} />
            <Route path="/academics" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'teacher', 'director']}><AcademicsPage user={user} /></RoleRoute>} />
            <Route path="/fees" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'record', 'parent', 'director']}><FeesPage user={user} /></RoleRoute>} />
            <Route path="/announcements" element={<AnnouncementsPage user={user} />} />
            <Route path="/settings" element={<RoleRoute user={user} allowed={['admin', 'system_admin', 'director']}><SettingsPage user={user} /></RoleRoute>} />
            <Route path="*" element={<Navigate to={homePath} replace />} />
          </Routes>
        </main>
      </div>
      <footer className="app-footer">Secondary School Information Management System</footer>
    </div>
  );
}

function RoleRoute({ user, allowed, children }) {
  const role = getRole(user.role);
  return allowed.includes(role) ? children : <Navigate to={roleHome[role] || '/'} replace />;
}

function RoleDashboardPage({ user }) {
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const location = useLocation();
  const role = getRole(user.role);
  const modules = roleNavigation[role] || [];

  useEffect(() => {
    api.get('/dashboard/summary').then(({ data }) => setSummary(data)).catch(() => setSummary(null));
    if (role === 'system_admin') {
      api.get('/health').then(({ data }) => setHealth(data)).catch(() => setHealth({ ok: false, database: { connected: false, mode: 'unavailable' } }));
    }
  }, []);

  const totals = summary?.totals || {};
  const roleStats = summary?.roleStats || {};
  const stats = role === 'student'
    ? [{ label: 'My subjects', value: roleStats.subjects || 0 }, { label: 'Attendance', value: roleStats.attendanceRate || '—' }, { label: 'My results', value: roleStats.results || 0 }]
    : role === 'parent'
      ? [{ label: 'Linked children', value: roleStats.linkedStudents || 0 }, { label: 'Attendance', value: roleStats.attendanceRate || '—' }, { label: 'Academic results', value: roleStats.results || 0 }]
      : role === 'director'
        ? [{ label: 'Total students', value: totals.students || 0 }, { label: 'Total teachers', value: totals.teachers || 0 }, { label: 'Average score', value: `${roleStats.averageScore || 0}%` }, { label: 'Attendance', value: roleStats.attendanceRate || '—' }, { label: 'Financial records', value: roleStats.financialTotal || 0 }, { label: 'Announcements', value: totals.announcements || 0 }]
        : role === 'system_admin'
          ? [{ label: 'API health', value: health?.ok ? 'Operational' : 'Checking' }, { label: 'Database', value: health?.database?.mode || 'Checking' }, { label: 'Registered users', value: totals.users || 0 }]
      : [{ label: 'Active students', value: totals.activeStudents || 0 }, { label: 'Teachers', value: totals.teachers || 0 }, { label: 'Announcements', value: totals.announcements || 0 }];

  return (
    <>
      {location.state?.success && <div className="login-message success-message" role="status">{location.state.success}</div>}
      <div className="page-header dashboard-heading">
        <div><div className="login-eyebrow">SSIMS / {roleTitles[role]?.toUpperCase()}</div><h1>{roleTitles[role]} Dashboard</h1><p className="muted">Welcome back, {user.name}.</p></div>
        <div className="dashboard-profile"><span className="profile-avatar large">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div>
      </div>

      <div className="grid grid-3">
        {stats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} />)}
      </div>

      <div className="section-head dashboard-section-head"><h2>Quick access</h2><Link to="/announcements" className="text-action"><Bell size={16} /> Notifications</Link></div>
      <div className="grid grid-3 role-module-grid">
        {modules.map(({ to, label, icon: Icon }) => (
          <Link className="role-module" key={to} to={to}>
            <span className="module-icon"><Icon size={20} /></span><span>{label}</span><ArrowRight size={17} className="module-arrow" />
          </Link>
        ))}
      </div>
    </>
  );
}

function DashboardPage({ user }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then(({ data }) => setSummary(data)).catch(() => setSummary(null));
  }, []);

  if (!summary) return <div className="card">Loading dashboard data…</div>;

  const chartData = Object.entries(summary.gradeCounts || {}).map(([grade, value]) => ({ name: grade, students: value }));
  const pieData = Object.entries(summary.genderCounts || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#1d4ed8', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <>
      <div className="page-header">
        <h1>Welcome back, {user.name}</h1>
        <div className="muted">{user.role.replace('_', ' ').toUpperCase()} dashboard</div>
      </div>

      <div className="grid grid-3">
        <StatCard label="Active Students" value={summary.totals.activeStudents || 0} />
        <StatCard label="Total Teachers" value={summary.totals.teachers || 0} />
        <StatCard label="Announcements" value={summary.totals.announcements || 0} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Enrollment by Grade</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Student Gender Distribution</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Recent Students</h3>
          {summary.recentStudents?.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>{student.studentId}</td>
                    <td>{student.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty">No recent student records.</div>}
        </div>

        <div className="card">
          <h3>Latest Announcements</h3>
          {summary.recentAnnouncements?.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {summary.recentAnnouncements.map((item) => (
                <div key={item.id} className="notice">
                  <strong>{item.title}</strong>
                  <div className="muted">{item.content}</div>
                </div>
              ))}
            </div>
          ) : <div className="empty">No announcements yet.</div>}
        </div>
      </div>
    </>
  );
}

function StudentsPage({ user }) {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    fullName: '',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Male',
    guardianName: '',
    guardianPhone: '',
    address: ''
  });

  const loadStudents = () => {
    api.get('/students').then(({ data }) => setStudents(data)).catch(() => setStudents([]));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/students', form);
      setForm({ studentId: '', fullName: '', grade: 'Grade 10', section: 'A', gender: 'Male', guardianName: '', guardianPhone: '', address: '' });
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to create student record.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Student Management</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add New Student</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Student ID</label><input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} /></div>
          <div className="form-group"><label>Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div className="form-group"><label>Grade</label><select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
          <div className="form-group"><label>Section</label><select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}><option>A</option><option>B</option><option>C</option></select></div>
          <div className="form-group"><label>Gender</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>Male</option><option>Female</option></select></div>
          <div className="form-group"><label>Guardian Name</label><input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></div>
          <div className="form-group"><label>Guardian Phone</label><input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} /></div>
          <div className="form-group"><label>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Save Student</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Section</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length ? students.map((student) => (
              <tr key={student.id}>
                <td>{student.studentId}</td>
                <td>{student.fullName}</td>
                <td>{student.grade}</td>
                <td>{student.section}</td>
                <td><span className="badge">{student.enrollmentStatus || 'active'}</span></td>
              </tr>
            )) : <tr><td colSpan="5" className="empty">No students found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ParentsPage({ user }) {
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [parentPortal, setParentPortal] = useState(null);

  useEffect(() => {
    if (user.role === 'parent') {
      api.get('/parents/me')
        .then(({ data }) => {
          setParentPortal(data);
          setChildren(data.parent?.children || []);
        })
        .catch(() => {
          setParentPortal({ attendance: [], results: [], fees: [], timetable: [], announcements: [] });
          setChildren([]);
        });
      return;
    }

    api.get('/parents')
      .then(({ data }) => setParents(data || []))
      .catch(() => setParents([]));
  }, [user.role]);

  if (user.role === 'parent') {
    return (
      <>
        <div className="page-header">
          <h1>Parent Portal</h1>
          <div className="muted">Hi {user.name}. Your linked student records.</div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Guardian Contact</th>
              </tr>
            </thead>
            <tbody>
              {children.length ? children.map((child) => (
                <tr key={child.id}>
                  <td>{child.studentId}</td>
                  <td>{child.fullName}</td>
                  <td>{child.grade}</td>
                  <td>{child.section}</td>
                  <td>{child.guardianPhone || 'Not provided'}</td>
                </tr>
              )) : <tr><td colSpan="5" className="empty">No student records linked to this parent account.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid grid-2" style={{ marginTop: 20 }}>
          <div className="card">
            <h3>Attendance</h3>
            <table className="table">
              <thead><tr><th>Date</th><th>Class</th><th>Status</th></tr></thead>
              <tbody>{parentPortal?.attendance?.length ? parentPortal.attendance.map((entry) => <tr key={entry.id}><td>{entry.date}</td><td>{entry.className}</td><td>{entry.status}</td></tr>) : <tr><td colSpan="3" className="empty">No attendance records yet.</td></tr>}</tbody>
            </table>
          </div>
          <div className="card">
            <h3>Academic Results</h3>
            <table className="table">
              <thead><tr><th>Subject</th><th>Exam</th><th>Score</th></tr></thead>
              <tbody>{parentPortal?.results?.length ? parentPortal.results.map((entry) => <tr key={entry.id}><td>{entry.subject}</td><td>{entry.exam}</td><td>{entry.score}/{entry.maxScore}</td></tr>) : <tr><td colSpan="3" className="empty">No results yet.</td></tr>}</tbody>
            </table>
          </div>
          <div className="card">
            <h3>Payments</h3>
            <table className="table">
              <thead><tr><th>Category</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>{parentPortal?.fees?.length ? parentPortal.fees.map((entry) => <tr key={entry.id}><td>{entry.category}</td><td>{entry.amount}</td><td>{entry.status}</td></tr>) : <tr><td colSpan="3" className="empty">No payment records yet.</td></tr>}</tbody>
            </table>
          </div>
          <div className="card">
            <h3>Class Schedule</h3>
            <table className="table">
              <thead><tr><th>Day</th><th>Time</th><th>Subject</th></tr></thead>
              <tbody>{parentPortal?.timetable?.length ? parentPortal.timetable.map((entry) => <tr key={entry.id}><td>{entry.day}</td><td>{entry.time}</td><td>{entry.subject}</td></tr>) : <tr><td colSpan="3" className="empty">No schedule available.</td></tr>}</tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <h3>School Announcements</h3>
          {parentPortal?.announcements?.length ? parentPortal.announcements.map((item) => <div className="notice" key={item.id} style={{ marginTop: 10 }}><strong>{item.title}</strong><div className="muted">{item.content}</div></div>) : <div className="empty">No announcements yet.</div>}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Guardian Tracking</h1>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Parent</th>
              <th>Email</th>
              <th>Linked Students</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {parents.length ? parents.map((parent) => (
              <tr key={parent.id}>
                <td>{parent.name}</td>
                <td>{parent.email}</td>
                <td>{(parent.children || []).map((student) => student.fullName).join(', ') || 'None'}</td>
                <td>{(parent.children || [])[0]?.guardianPhone || 'Not provided'}</td>
              </tr>
            )) : <tr><td colSpan="4" className="empty">No parent records available.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReportCardsPage({ user }) {
  const [cards, setCards] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ studentId: '', term: 'Semester I', academicYear: '2025/2026' });

  const loadCards = () => {
    Promise.all([
      api.get('/report-cards'),
      api.get('/students'),
      api.get('/results')
    ])
      .then(([cardsResponse, studentsResponse, resultsResponse]) => {
        setCards(cardsResponse.data || []);
        setStudents(studentsResponse.data || []);
        setResults(resultsResponse.data || []);
      })
      .catch(() => {
        setCards([]);
        setStudents([]);
        setResults([]);
      });
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const student = students.find((entry) => String(entry.studentId) === String(form.studentId) || String(entry.id) === String(form.studentId));

    if (!student) {
      alert('Select a valid student from the list.');
      return;
    }

    const studentResults = results.filter((entry) => String(entry.studentId) === String(student.studentId) || entry.studentName === student.fullName);
    const subjects = studentResults.length
      ? studentResults.map((entry) => ({
          name: entry.subject,
          score: Number(entry.score),
          maxScore: Number(entry.maxScore),
          grade: entry.grade || (Number(entry.score) >= 90 ? 'A' : Number(entry.score) >= 80 ? 'B' : Number(entry.score) >= 70 ? 'C' : Number(entry.score) >= 60 ? 'D' : 'F')
        }))
      : [{ name: 'Overall', score: 0, maxScore: 0, grade: 'F' }];

    try {
      await api.post('/report-cards', {
        studentId: student.studentId,
        studentName: student.fullName,
        grade: student.grade,
        section: student.section,
        term: form.term,
        academicYear: form.academicYear,
        subjects
      });
      setForm({ studentId: '', term: 'Semester I', academicYear: '2025/2026' });
      loadCards();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to generate the report card.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Academic Report Cards</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Generate Report Card</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group">
            <label>Student</label>
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.studentId}>{student.fullName} ({student.studentId})</option>
              ))}
            </select>
          </div>
          <div className="form-group"><label>Term</label><select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}><option>Semester I</option><option>Semester II</option><option>Annual</option></select></div>
          <div className="form-group"><label>Academic Year</label><input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Generate</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade</th>
              <th>Term</th>
              <th>GPA</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {cards.length ? cards.map((card) => (
              <tr key={card.id}>
                <td>{card.studentName}</td>
                <td>{card.grade} / {card.section}</td>
                <td>{card.term}</td>
                <td>{card.gpa.toFixed(2)}</td>
                <td>{card.remark}</td>
              </tr>
            )) : <tr><td colSpan="5" className="empty">No report cards generated yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StudentPortalPage({ user }) {
  const [portal, setPortal] = useState(null);

  useEffect(() => {
    if (user.role !== 'student') {
      setPortal({ student: null, attendance: [], results: [], fees: [] });
      return;
    }

    api.get('/student-portal/me')
      .then(({ data }) => setPortal(data))
      .catch(() => setPortal({ student: null, attendance: [], results: [], fees: [] }));
  }, [user.role]);

  if (user.role !== 'student') {
    return (
      <>
        <div className="page-header">
          <h1>Student Portal</h1>
        </div>
        <div className="card">This portal is available to student accounts only.</div>
      </>
    );
  }

  if (!portal) return <div className="card">Loading student portal…</div>;

  return (
    <>
      <div className="page-header">
        <h1>Student Portal</h1>
        <div className="muted">Welcome, {user.name}</div>
      </div>

      <div className="grid grid-3">
        <StatCard label="Student ID" value={portal.student?.studentId || user.studentId || 'N/A'} />
        <StatCard label="Grade" value={portal.student?.grade || 'N/A'} />
        <StatCard label="Section" value={portal.student?.section || 'N/A'} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Attendance</h3>
          <table className="table">
            <thead><tr><th>Date</th><th>Class</th><th>Status</th></tr></thead>
            <tbody>
              {portal.attendance?.length ? portal.attendance.map((entry) => (
                <tr key={entry.id}><td>{entry.date}</td><td>{entry.className}</td><td><span className="badge">{entry.status}</span></td></tr>
              )) : <tr><td colSpan="3" className="empty">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Results</h3>
          <table className="table">
            <thead><tr><th>Subject</th><th>Exam</th><th>Score</th><th>Grade</th></tr></thead>
            <tbody>
              {portal.results?.length ? portal.results.map((entry) => (
                <tr key={entry.id}><td>{entry.subject}</td><td>{entry.exam}</td><td>{entry.score}/{entry.maxScore}</td><td><span className="badge">{entry.grade}</span></td></tr>
              )) : <tr><td colSpan="4" className="empty">No exam results yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Fee Status</h3>
        <table className="table">
          <thead><tr><th>Category</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {portal.fees?.length ? portal.fees.map((entry) => (
              <tr key={entry.id}><td>{entry.category}</td><td>{entry.amount}</td><td><span className="badge">{entry.status}</span></td></tr>
            )) : <tr><td colSpan="3" className="empty">No fee records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AuditLogsPage({ user }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/audit')
      .then(({ data }) => setLogs(data || []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Audit Logs</h1>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length ? logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.actor}</td>
                <td>{log.action}</td>
                <td>{JSON.stringify(log.details)}</td>
              </tr>
            )) : <tr><td colSpan="4" className="empty">No audit entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TeachersPage({ user }) {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ teacherId: '', fullName: '', department: 'Mathematics', email: '', status: 'active' });

  const loadTeachers = () => {
    api.get('/teachers').then(({ data }) => setTeachers(data)).catch(() => setTeachers([]));
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/teachers', form);
      setForm({ teacherId: '', fullName: '', department: 'Mathematics', email: '', status: 'active' });
      loadTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to register teacher.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Teacher Directory</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Register Teacher</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Teacher ID</label><input value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} /></div>
          <div className="form-group"><label>Full Name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div className="form-group"><label>Department</label><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}><option>Mathematics</option><option>Science</option><option>English</option><option>Social Studies</option><option>ICT</option></select></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>active</option><option>inactive</option></select></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Save Teacher</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length ? teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.teacherId}</td>
                <td>{teacher.fullName}</td>
                <td>{teacher.department}</td>
                <td>{teacher.email}</td>
                <td><span className="badge">{teacher.status}</span></td>
              </tr>
            )) : <tr><td colSpan="5" className="empty">No teachers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AttendancePage({ user }) {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', className: 'Grade 10', date: new Date().toISOString().slice(0, 10), status: 'Present' });

  const loadAttendance = () => {
    api.get('/attendance').then(({ data }) => setRecords(data)).catch(() => setRecords([]));
    api.get('/students').then(({ data }) => setStudents(data)).catch(() => setStudents([]));
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/attendance', form);
      setForm({ studentId: '', className: 'Grade 10', date: new Date().toISOString().slice(0, 10), status: 'Present' });
      loadAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to record attendance.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Attendance Tracking</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Mark Attendance</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Student</label><select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map((student) => <option key={student.id} value={student.studentId}>{student.fullName}</option>)}
          </select></div>
          <div className="form-group"><label>Class</label><select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Present</option><option>Absent</option><option>Late</option><option>Excused</option></select></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Save</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Class</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? records.map((record) => (
              <tr key={record.id}>
                <td>{record.studentId}</td>
                <td>{record.className}</td>
                <td>{record.date}</td>
                <td><span className="badge">{record.status}</span></td>
              </tr>
            )) : <tr><td colSpan="4" className="empty">No attendance records.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TimetablePage({ user }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ day: 'Monday', time: '08:00-09:00', className: 'Grade 10', subject: 'Mathematics', teacher: 'Mekdes Alemu', room: 'Room 101' });

  const loadTimetable = () => {
    api.get('/timetable').then(({ data }) => setEntries(data)).catch(() => setEntries([]));
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/timetable', form);
      setForm({ day: 'Monday', time: '08:00-09:00', className: 'Grade 10', subject: 'Mathematics', teacher: 'Mekdes Alemu', room: 'Room 101' });
      loadTimetable();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save timetable entry.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Class Timetable</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add Schedule</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Day</label><select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></div>
          <div className="form-group"><label>Time</label><input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          <div className="form-group"><label>Class</label><select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
          <div className="form-group"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="form-group"><label>Teacher</label><input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
          <div className="form-group"><label>Room</label><input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Save</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {entries.length ? entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.day}</td>
                <td>{entry.time}</td>
                <td>{entry.className}</td>
                <td>{entry.subject}</td>
                <td>{entry.teacher}</td>
                <td>{entry.room}</td>
              </tr>
            )) : <tr><td colSpan="6" className="empty">No timetable entries found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ResultsPage({ user }) {
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ studentId: '', studentName: '', subject: 'Mathematics', exam: 'Midterm', score: 0, maxScore: 100 });

  const loadResults = () => {
    api.get('/results').then(({ data }) => setResults(data)).catch(() => setResults([]));
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/results', form);
      setForm({ studentId: '', studentName: '', subject: 'Mathematics', exam: 'Midterm', score: 0, maxScore: 100 });
      loadResults();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save exam result.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Examination Results</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Record Result</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Student ID</label><input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} /></div>
          <div className="form-group"><label>Student Name</label><input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></div>
          <div className="form-group"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="form-group"><label>Exam</label><select value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })}><option>Midterm</option><option>Final</option><option>Assignment</option><option>Quiz</option></select></div>
          <div className="form-group"><label>Score</label><input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
          <div className="form-group"><label>Max Score</label><input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} /></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Save</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.length ? results.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.studentName}</td>
                <td>{entry.subject}</td>
                <td>{entry.exam}</td>
                <td>{entry.score}/{entry.maxScore}</td>
                <td><span className="badge">{entry.grade}</span></td>
              </tr>
            )) : <tr><td colSpan="5" className="empty">No results yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AcademicsPage({ user }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [classForm, setClassForm] = useState({ name: 'Grade 10', section: 'A', capacity: 40, academicYear: '2025/2026' });
  const [subjectForm, setSubjectForm] = useState({ name: 'Mathematics', grade: 'Grade 10', teacher: 'Mekdes Alemu' });

  const loadAcademics = () => {
    api.get('/school/classes').then(({ data }) => setClasses(data)).catch(() => setClasses([]));
    api.get('/school/subjects').then(({ data }) => setSubjects(data)).catch(() => setSubjects([]));
    api.get('/students').then(({ data }) => setStudents(data)).catch(() => setStudents([]));
  };

  useEffect(() => {
    loadAcademics();
  }, []);

  const handleClassSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/school/classes', classForm);
      setClassForm({ name: 'Grade 10', section: 'A', capacity: 40, academicYear: '2025/2026' });
      loadAcademics();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save class.');
    }
  };

  const handleSubjectSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/school/subjects', subjectForm);
      setSubjectForm({ name: 'Mathematics', grade: 'Grade 10', teacher: 'Mekdes Alemu' });
      loadAcademics();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save subject.');
    }
  };

  const rosterByClass = classes.map((schoolClass) => ({
    ...schoolClass,
    students: students.filter((student) => student.grade === schoolClass.name && student.section === schoolClass.section)
  }));

  return (
    <>
      <div className="page-header">
        <h1>Academic Management</h1>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Add Class</h3>
          <form onSubmit={handleClassSubmit} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div className="form-group"><label>Grade</label><select value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
            <div className="form-group"><label>Section</label><input value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} /></div>
            <div className="form-group"><label>Capacity</label><input type="number" value={classForm.capacity} onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })} /></div>
            <div className="form-group"><label>Academic Year</label><input value={classForm.academicYear} onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })} /></div>
            <button className="btn primary" type="submit">Add Class</button>
          </form>
        </div>

        <div className="card">
          <h3>Add Subject</h3>
          <form onSubmit={handleSubjectSubmit} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div className="form-group"><label>Subject Name</label><input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} /></div>
            <div className="form-group"><label>Grade</label><input value={subjectForm.grade} onChange={(e) => setSubjectForm({ ...subjectForm, grade: e.target.value })} /></div>
            <div className="form-group"><label>Teacher</label><input value={subjectForm.teacher} onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })} /></div>
            <button className="btn primary" type="submit">Add Subject</button>
          </form>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>Classes</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Section</th><th>Capacity</th><th>Year</th></tr></thead>
            <tbody>
              {classes.length ? classes.map((entry) => (
                <tr key={entry.id}><td>{entry.name}</td><td>{entry.section}</td><td>{entry.capacity}</td><td>{entry.academicYear}</td></tr>
              )) : <tr><td colSpan="4" className="empty">No classes yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Subjects</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Grade</th><th>Teacher</th></tr></thead>
            <tbody>
              {subjects.length ? subjects.map((entry) => (
                <tr key={entry.id}><td>{entry.name}</td><td>{entry.grade}</td><td>{entry.teacher}</td></tr>
              )) : <tr><td colSpan="3" className="empty">No subjects yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Class Rosters</h3>
        <div style={{ display: 'grid', gap: 16 }}>
          {rosterByClass.length ? rosterByClass.map((entry) => (
            <div key={entry.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <h4>{entry.name} - Section {entry.section}</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.students.length ? entry.students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.studentId}</td>
                      <td>{student.fullName}</td>
                      <td>{student.gender}</td>
                      <td>{student.enrollmentStatus || 'active'}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="empty">No students assigned to this class.</td></tr>}
                </tbody>
              </table>
            </div>
          )) : <div className="empty">No rosters available yet.</div>}
        </div>
      </div>
    </>
  );
}

function SettingsPage({ user }) {
  const [settings, setSettings] = useState({ schoolName: '', motto: '', academicYear: '', semester: '', gradingScale: '' });

  const loadSettings = () => {
    api.get('/school/settings').then(({ data }) => setSettings(data)).catch(() => setSettings({ schoolName: 'Secondary School Information Management System', motto: 'Excellence through knowledge', academicYear: '2025/2026', semester: 'Semester I', gradingScale: 'A=90-100, B=80-89, C=70-79, D=60-69, F=0-59' }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put('/school/settings', settings);
      setSettings(data);
      alert('School settings saved.');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save school settings.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>School Settings</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          <div className="form-group"><label>School Name</label><input value={settings.schoolName} onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })} /></div>
          <div className="form-group"><label>Motto</label><input value={settings.motto} onChange={(e) => setSettings({ ...settings, motto: e.target.value })} /></div>
          <div className="form-group"><label>Academic Year</label><input value={settings.academicYear} onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })} /></div>
          <div className="form-group"><label>Semester</label><input value={settings.semester} onChange={(e) => setSettings({ ...settings, semester: e.target.value })} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Grading Scale</label><textarea rows="3" value={settings.gradingScale} onChange={(e) => setSettings({ ...settings, gradingScale: e.target.value })} /></div>
          <button className="btn primary" type="submit" style={{ gridColumn: '1 / -1' }}>Save School Settings</button>
        </form>
      </div>
    </>
  );
}

function FeesPage({ user }) {
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({ studentId: '', studentName: '', category: 'Tuition', amount: 0, status: 'Paid', date: new Date().toISOString().slice(0, 10) });

  const loadFees = () => {
    api.get('/fees').then(({ data }) => setFees(data)).catch(() => setFees([]));
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/fees', form);
      setForm({ studentId: '', studentName: '', category: 'Tuition', amount: 0, status: 'Paid', date: new Date().toISOString().slice(0, 10) });
      loadFees();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save fee record.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Fee Management</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Record Payment</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Student ID</label><input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} /></div>
          <div className="form-group"><label>Student Name</label><input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} /></div>
          <div className="form-group"><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Tuition</option><option>Books</option><option>Uniform</option><option>Examination</option></select></div>
          <div className="form-group"><label>Amount</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Paid</option><option>Pending</option><option>Overdue</option></select></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div style={{ display: 'flex', alignItems: 'end' }}><button className="btn primary" type="submit">Save</button></div>
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.length ? fees.map((fee) => (
              <tr key={fee.id}>
                <td>{fee.studentName}</td>
                <td>{fee.category}</td>
                <td>{fee.amount}</td>
                <td><span className="badge">{fee.status}</span></td>
              </tr>
            )) : <tr><td colSpan="4" className="empty">No fee records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AnnouncementsPage({ user }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', audience: 'all' });

  const loadAnnouncements = () => {
    api.get('/announcements').then(({ data }) => setItems(data)).catch(() => setItems([]));
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/announcements', form);
      setForm({ title: '', content: '', audience: 'all' });
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to publish announcement.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Announcements</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Publish Announcement</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label>Audience</label><select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}><option value="all">All</option><option value="students">Students</option><option value="teachers">Teachers</option><option value="parents">Parents</option></select></div>
          <div className="form-group"><label>Message</label><textarea rows="4" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <button className="btn primary" type="submit">Publish</button>
        </form>
      </div>

      <div className="card">
        {items.length ? items.map((item) => (
          <div key={item.id} className="notice" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{item.title}</strong>
              <span className="badge">{item.audience}</span>
            </div>
            <p>{item.content}</p>
            <div className="muted">Published by {item.createdBy}</div>
          </div>
        )) : <div className="empty">No announcements yet.</div>}
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default App;
