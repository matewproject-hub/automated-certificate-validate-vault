// React import removed due to unused

const StatusPage = ({ certificates, readOnly }) => {
    const handleView = (cert) => {
        // TEMP: open static file
        // Later replace with backend URL (cert.file_url)
        const fileUrl = cert.file_url || "/sample.pdf";
        window.open(fileUrl, "_blank");
    };

    const handleDownload = (cert) => {
        const fileUrl = cert.file_url || "/sample.pdf";
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = cert.name + ".pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                                {readOnly ? (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                        onClick={() => handleView(cert)}
                                    >
                                        👁 View
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                        onClick={() => handleDownload(cert)}
                                    >
                                        ⬇ Download
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatusPage;