import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPage from './StatusPage';
import { useAuth } from './AuthContext';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('home');

    // Upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Certificates state
    const [certificates, setCertificates] = useState([]);
    const [certsLoading, setCertsLoading] = useState(false);

    // Fetch certificates for this student on mount
    useEffect(() => {
        if (!user?.id) return;
        setCertsLoading(true);
        fetch(`/api/certificates/${user.id}`)
            .then(res => res.json())
            .then(data => setCertificates(Array.isArray(data) ? data : []))
            .catch(() => setCertificates([]))
            .finally(() => setCertsLoading(false));
    }, [user?.id]);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError('Please select a PDF file first.');
            return;
        }

        setUploadLoading(true);
        setUploadError(null);
        setVerificationResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('student_id', user.id);
        formData.append('file_name', selectedFile.name.replace('.pdf', ''));

        try {
            const response = await fetch('/verify', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Verification failed');
            }

            const data = await response.json();
            setVerificationResult(data);

            // Refresh certificate list after successful upload
            const certsRes = await fetch(`/api/certificates/${user.id}`);
            const certsData = await certsRes.json();
            setCertificates(Array.isArray(certsData) ? certsData : []);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploadLoading(false);
        }
    };

    const totalPoints = useMemo(
        () => certificates.reduce((acc, c) => acc + (c.status === 'VALID' ? (c.points || 0) : 0), 0),
        [certificates]
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="grid-container fade-in">
                        {certsLoading && <p>Loading certificates...</p>}
                        {!certsLoading && certificates.length === 0 && (
                            <p style={{ color: 'var(--text-secondary)' }}>No certificates yet. Upload one to get started!</p>
                        )}
                        {certificates.map((cert) => (
                            <div key={cert.id} className="card">
                                <h3>{cert.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{cert.type}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span className={`status-badge status-${cert.status.toLowerCase()}`}>
                                        {cert.status}
                                    </span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                                        {cert.points} pts
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    Confidence: {cert.confidence}%
                                </p>
                            </div>
                        ))}
                    </div>
                );

            case 'upload':
                return (
                    <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2>Upload Certificate</h2>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group">
                                <label className="form-label">Certificate File (PDF only)</label>
                                <div className="upload-area" style={{ position: 'relative' }}>
                                    <p>{selectedFile ? selectedFile.name : 'Click or Drag to Upload PDF'}</p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={uploadLoading}>
                                {uploadLoading ? '⏳ Verifying...' : '🚀 Upload & Verify'}
                            </button>
                        </form>

                        {uploadError && (
                            <div style={{ marginTop: '1rem', color: '#ff4d4f' }}>
                                <strong>Error:</strong> {uploadError}
                            </div>
                        )}

                        {verificationResult && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>✅ Verification Result</h3>
                                <p>
                                    <strong>Status: </strong>
                                    <span className={`status-badge status-${verificationResult.status.toLowerCase()}`}>
                                        {verificationResult.status}
                                    </span>
                                </p>
                                <p><strong>Type:</strong> {verificationResult.category}</p>
                                <p><strong>Confidence:</strong> {verificationResult.confidence}%</p>
                                <p><strong>Points Awarded:</strong> {verificationResult.points}</p>
                            </div>
                        )}
                    </div>
                );

            case 'status':
                return <StatusPage certificates={certificates} />;

            case 'points':
                return (
                    <div className="card fade-in points-display">
                        <div className="points-value">{totalPoints}</div>
                        <div className="points-label">Total Activity Points</div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            From {certificates.filter(c => c.status === 'VALID').length} verified certificate(s)
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <nav className="dashboard-nav">
                <div className="nav-brand">AUTOCRED VAULT</div>
                <div className="nav-links">
                    {['home', 'upload', 'status', 'points'].map(tab => (
                        <button
                            key={tab}
                            className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {user?.name}
                    </span>
                    <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--warning-color)' }}>
                        Logout
                    </button>
                </div>
            </nav>
            <div className="container">{renderContent()}</div>
        </div>
    );
};

export default StudentDashboard;
