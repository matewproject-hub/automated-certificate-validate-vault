import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPage from './StatusPage';
import { useAuth } from './AuthContext';



function parseRegisterNumber(regNo) {
    const year = parseInt(regNo.substring(3, 5)); // 23
    const dept = regNo.substring(5, 7); // CS

    const currentYear = new Date().getFullYear() % 100;
    const academicYear = currentYear - year + 1;

    let yearGroup = "";

    if (academicYear === 1) yearGroup = "1st Year";
    else if (academicYear === 2) yearGroup = "2nd Year";
    else if (academicYear === 3) yearGroup = "3rd Year";
    else if (academicYear === 4) yearGroup = "4th Year";

    return {
        yearGroup,
        dept,
        batch: `20${year}-20${year + 4}`,
    };
}


const studentsMock = [];


const processedStudents = studentsMock.map((s) => {
    const info = parseRegisterNumber(s.reg);
    return { ...s, ...info };
});

const batches = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const studentCertificatesMock = [];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('batches');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    const handleBatchClick = (batch) => {
        setSelectedBatch(batch);
        setView('list');
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setView('student');
    };

    const handleBack = () => {
        if (view === 'student') setView('list');
        else if (view === 'list') setView('batches');
    };

    // 🔥 Filter based on batch + search
    const filteredStudents = useMemo(() => processedStudents.filter(s =>
        s.yearGroup === selectedBatch &&
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [selectedBatch, searchQuery]);

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
                        <div className="grid-container">
                            {batches.map((batch) => (
                                <div
                                    key={batch}
                                    className="card batch-card"
                                    onClick={() => handleBatchClick(batch)}
                                >
                                    <h3>{batch}</h3>
                                </div>
                            ))}
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
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                                        {student.reg}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {student.dept}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {student.batch}
                                    </p>

                                    <div style={{
                                        marginTop: '1rem',
                                        fontWeight: 'bold',
                                        color: 'var(--accent-color)'
                                    }}>
                                        {student.points} Points
                                    </div>
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
                                {selectedStudent.dept} - {selectedStudent.batch}
                            </p>
                        </div>

                        <StatusPage certificates={studentCertificatesMock} readOnly={true} />
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;