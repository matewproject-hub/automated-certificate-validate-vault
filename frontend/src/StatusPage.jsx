import React from 'react';

const StatusPage = ({ certificates, readOnly = false }) => {
    return (
        <div className="card fade-in">
            <h2>Certificate Status</h2>
            <table className="status-table">
                <thead>
                    <tr>
                        <th>Certificate Name</th>
                        <th>Type</th>
                        <th>Verification Status</th>
                        <th>Activity Points</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {certificates.map((cert) => (
                        <tr key={cert.id}>
                            <td>{cert.name}</td>
                            <td>{cert.type}</td>
                            <td>
                                <span className={`status-badge status-${cert.status.toLowerCase()}`}>
                                    {cert.status}
                                </span>
                            </td>
                            <td>{cert.points}</td>
                            <td>
                                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatusPage;
