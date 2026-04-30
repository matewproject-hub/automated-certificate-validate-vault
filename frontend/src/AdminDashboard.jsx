import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPage from './StatusPage';
import { useAuth } from './AuthContext';

function parseRegisterNumber(regNo = '') {
    if (!regNo || regNo.length < 7) return { yearGroup: 'Unknown', dept: '?', batch: '?' };
    const year = parseInt(regNo.substring(3, 5));
    const dept = regNo.substring(5, 7);
    const currentYear = new Date().getFullYear() % 100;
    const academicYear = currentYear - year + 1;
    const yearGroup =
        academicYear === 1 ? '1st Year' :
        academicYear === 2 ? '2nd Year' :
        academicYear === 3 ? '3rd Year' :
        academicYear === 4 ? '4th Year' : 'Alumni';
    return { yearGroup, dept, batch: `20${year}-20${year + 4}` };
}

const batches = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [view, setView] = useState('batches');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [students, setStudents] = useState([]);
    const [studentCerts, setStudentCerts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all students once
    useEffect(() => {
        setLoading(true);
        fetch('/api/students')
            .then(res => res.json())
            .then(data => setStudents(Array.isArray(data) ? data : []))
            .catch(() => setStudents([]))
            .finally(() => setLoading(false));
    }, []);

    const processedStudents = useMemo(() =>
        students.map(s => ({ ...s, ...parseRegisterNumber(s.regNo) })),
        [students]
    );

    const filteredStudents = useMemo(() =>
        processedStudents.filter(s =>
            s.yearGroup === selectedBatch &&
            (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [processedStudents, selectedBatch, searchQuery]
    );

    const handleBatchClick = (batch) => {
        setSelectedBatch(batch);
        setView('list');
    };

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setStudentCerts([]);
        setView('student');
        try {
            const res = await fetch(`/api/certificates/${student.id}`);
            const data = await res.json();
            setStudentCerts(Array.isArray(data) ? data : []);
        } catch {
            setStudentCerts([]);
        }
    };

    const handleBack = () => {
        if (view === 'student') setView('list');
        else if (view === 'list') setView('batches');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <nav className="dashboard-nav">
                <div className="nav-brand">AUTOCRED ADMIN</div>
                <div className="nav-links">
                    {view !== 'batches' && (
                        <button className="nav-link" onClick={handleBack}>← Back</button>
                    )}
                    <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--warning-color)' }}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container fade-in">
                {view === 'batches' && (
                    <>
                        <h2 style={{ marginBottom: '1.5rem' }}>Select Batch</h2>
                        {loading && <p>Loading students...</p>}
                        <div className="grid-container">
                            {batches.map((batch) => {
                                const count = processedStudents.filter(s => s.yearGroup === batch).length;
                                return (
                                    <div
                                        key={batch}
                                        className="card batch-card"
                                        onClick={() => handleBatchClick(batch)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3>{batch}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>{count} student{count !== 1 ? 's' : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {view === 'list' && (
                    <>
                        <h2 style={{ marginBottom: '1.5rem' }}>{selectedBatch} Students</h2>
                        <div className="search-bar">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="grid-container">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="card"
                                    onClick={() => handleStudentClick(student)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3>{student.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{student.regNo}</p>
                                    <p style={{ color: 'var(--text-secondary)' }}>{student.dept} · {student.batch}</p>
                                    <p style={{ color: 'var(--text-secondary)' }}>{student.branch}</p>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && <p>No students found.</p>}
                        </div>
                    </>
                )}

                {view === 'student' && selectedStudent && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2>{selectedStudent.name}</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {selectedStudent.dept} · {selectedStudent.batch} · {selectedStudent.regNo}
                            </p>
                        </div>
                        <StatusPage certificates={studentCerts} readOnly={true} />
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;