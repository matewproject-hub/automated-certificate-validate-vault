import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPage from './StatusPage';
import { useAuth } from './AuthContext';


const StudentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');

    // Step 2: Set Up React State
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError("Please select a PDF file first.");
            return;
        }

        setUploadLoading(true);
        setUploadError(null);
        setVerificationResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/verify', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Verification failed');
            }

            const data = await response.json();
            setVerificationResult(data);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploadLoading(false);
        }
    };

    // Mock Data
    const [certificates] = useState([
        { id: 1, name: 'Intro to AI', type: 'NPTEL', status: 'Verified', points: 20 },
        { id: 2, name: 'Python Bootcamp', type: 'Coursera', status: 'Pending', points: 0 },
        { id: 3, name: 'Inter-College Football', type: 'Sports', status: 'Rejected', points: 0 },
    ]);

    const totalPoints = useMemo(() => certificates.reduce((acc, curr) => acc + (curr.status === 'Verified' ? curr.points : 0), 0), [certificates]);

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="grid-container fade-in">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="card">
                                <h3>{cert.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{cert.type}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span className={`status-badge status-${cert.status.toLowerCase()}`}>
                                        {cert.status}
                                    </span>
                                    <span>{buttonsRender(cert)}</span>
                                </div>
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
                                <label className="form-label">Certificate File (PDF)</label>
                                <div className="upload-area" style={{ position: 'relative' }}>
                                    <p>{selectedFile ? selectedFile.name : "Click or Drag to Upload PDF"}</p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Certificate Type</label>
                                <select className="form-select">
                                    <option value="NPTEL">NPTEL</option>
                                    <option value="Coursera">Coursera</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Fest">Fest</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={uploadLoading}>
                                {uploadLoading ? 'Verifying...' : 'Upload'}
                            </button>
                        </form>

                        {uploadError && (
                            <div style={{ marginTop: '1rem', color: '#ff4d4f' }}>
                                <strong>Error:</strong> {uploadError}
                            </div>
                        )}

                        {verificationResult && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Verification Result</h3>
                                <p><strong>Status:</strong> <span className={`status-badge status-${verificationResult.status.toLowerCase()}`}>{verificationResult.status}</span></p>

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
                    </div>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    const buttonsRender = () => {
        // Just a placeholder for potential future buttons
        return null;
    }

    return (
        <div>
            <nav className="dashboard-nav">
                <div className="nav-brand">AUTOCRED VAULT</div>
                <div className="nav-links">
                    <button className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
                    <button className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>Upload</button>
                    <button className={`nav-link ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>Status</button>
                    <button className={`nav-link ${activeTab === 'points' ? 'active' : ''}`} onClick={() => setActiveTab('points')}>Total Points</button>
                    <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--warning-color)' }}>Logout</button>
                </div>
            </nav>

            <div className="container">
                {renderContent()}
            </div>
        </div>
    );
};

export default StudentDashboard;
