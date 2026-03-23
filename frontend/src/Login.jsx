import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { mockUsers } from './users';


const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        regNo: '',
        branch: 'CSE'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            // Find matching user by email, password, and selected role
            const user = mockUsers.find(
                (u) => u.email === formData.email &&
                    u.password === formData.password &&
                    u.role === role
            );
            if (user) {
                // Valid: Set auth state and redirect
                login({ email: formData.email, role });
                if (role === 'student') {
                    navigate('/student');
                } else {
                    navigate('/admin');
                }
            } else {
                // Invalid credentials/role mismatch
                alert('Invalid email, password, or role');
                return;  // Stop execution
            }
        } else {
            // Registration unchanged (mock for now)
            console.log('Registering user', formData);
            setIsLogin(true);
        }
    };


    return (
        <div className="auth-container fade-in">
            <div className="auth-card card">
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={role === 'student'}
                                    onChange={handleRoleChange}
                                />
                                Student
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === 'admin'}
                                    onChange={handleRoleChange}
                                />
                                Admin
                            </label>
                        </div>
                    </div>

                    {!isLogin && role === 'student' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Register Number</label>
                                <input
                                    type="text"
                                    name="regNo"
                                    className="form-input"
                                    value={formData.regNo}
                                    onChange={handleChange}
                                    placeholder="e.g. MGP23CS142"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Branch</label>
                                <select
                                    name="branch"
                                    className="form-select"
                                    value={formData.branch}
                                    onChange={handleChange}
                                >
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="ME">ME</option>
                                    <option value="CE">CE</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
