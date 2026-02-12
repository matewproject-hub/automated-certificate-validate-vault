import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPage from './StatusPage';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('batches'); // batches, list, student
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const batches = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const studentsMock = [
        { id: 101, name: 'Alice Johnson', batch: '3rd Year', branch: 'CSE', points: 45 },
        { id: 102, name: 'Bob Smith', batch: '3rd Year', branch: 'ECE', points: 30 },
        { id: 103, name: 'Charlie Brown', batch: '2nd Year', branch: 'ME', points: 60 },
    ];
    const studentCertificatesMock = [
        { id: 1, name: 'Machine Learning', type: 'Coursera', status: 'Verified', points: 20 },
        { id: 2, name: 'Data Science', type: 'NPTEL', status: 'Pending', points: 0 },
    ];

    const handleLogout = () => {
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

    const filteredStudents = studentsMock.filter(s =>
        s.batch === selectedBatch &&
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <nav className="dashboard-nav">
                <div className="nav-brand">AUTOCRED ADMIN</div>
                <div className="nav-links">
                    {view !== 'batches' && (
                        <button className="nav-link" onClick={handleBack}>← Back</button>
                    )}
                    <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--warning-color)' }}>Logout</button>
                </div>
            </nav>

            <div className="container fade-in">
                {view === 'batches' && (
                    <>
                        <h2 style={{ marginBottom: '1.5rem' }}>Select Batch</h2>
                        <div className="grid-container">
                            {batches.map((batch) => (
                                <div key={batch} className="card batch-card" onClick={() => handleBatchClick(batch)}>
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
                                <div key={student.id} className="card" onClick={() => handleStudentClick(student)} style={{ cursor: 'pointer' }}>
                                    <h3>{student.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{student.branch}</p>
                                    <div style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
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
                            <p style={{ color: 'var(--text-secondary)' }}>{selectedStudent.branch} - {selectedStudent.batch}</p>
                        </div>
                        <StatusPage certificates={studentCertificatesMock} readOnly={true} />
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
