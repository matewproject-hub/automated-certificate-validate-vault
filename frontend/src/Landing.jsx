import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 1500);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="landing-container fade-in">
            <h1 className="landing-title">AUTOCRED VAULT</h1>
            <p className="landing-subtitle">Automatic Certificate Validation Vault</p>
        </div>
    );
};

export default Landing;
