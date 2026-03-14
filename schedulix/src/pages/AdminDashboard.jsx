import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminThemeSwitcher from '../components/AdminThemeSwitcher';
import apiService from '../services/api';
import Message from '../components/Message';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [themeColor, setThemeColor] = useState('#3b82f6');
    
    // Add User Modal State
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'ROLE_STUDENT',
        collegeId: ''
    });

    useEffect(() => {
        // UserDTO flattens department and themeColor
        if (user?.themeColor) {
            setThemeColor(user.themeColor);
            applyTheme(user.themeColor);
        }
    }, [user]);

    const applyTheme = (color) => {
        document.documentElement.style.setProperty('--primary-color', color);
    };

    const handleThemeChange = (newColor) => {
        setThemeColor(newColor);
        applyTheme(newColor);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: null, text: '' });
        
        try {
            // Include the admin's department name in the request
            const payload = {
                ...formData,
                departmentName: user?.department
            };
            const responseText = await apiService.adminCreateUser(payload);
            setMessage({ type: 'success', text: responseText });
            setFormData({ email: '', fullName: '', role: 'ROLE_STUDENT' }); // Reset form
            setTimeout(() => {
                setShowModal(false);
                setMessage({ type: null, text: '' });
            }, 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to create user.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="layout-container">
            <div className="dashboard-content">
                <h1>Admin Dashboard - {user?.department || 'Your Department'}</h1>
                <p>Welcome, {user?.fullName || user?.username}. You have administrative privileges for this department.</p>
                
                <AdminThemeSwitcher 
                    currentTheme={themeColor} 
                    departmentName={user?.department}
                    onThemeChange={handleThemeChange} 
                />

                <div className="admin-actions">
                    <div className="card">
                        <h3>Manage Users</h3>
                        <p>Add new Faculty or Students to your department.</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            style={{ backgroundColor: themeColor, color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Add User
                        </button>
                    </div>
                </div>

                {/* Add User Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                            <h2 style={{marginTop: 0, marginBottom: '20px'}}>Add New User</h2>
                            {message.text && <Message message={message} />}
                            
                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>College ID (Optional)</label>
                                    <input 
                                        type="text" 
                                        name="collegeId"
                                        placeholder="Leave blank to auto-generate"
                                        value={formData.collegeId}
                                        onChange={handleInputChange}
                                        style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Full Name</label>
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Email Address</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Role</label>
                                    <select 
                                        name="role" 
                                        value={formData.role} 
                                        onChange={handleInputChange}
                                        style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'}}
                                    >
                                        <option value="ROLE_STUDENT">Student</option>
                                        <option value="ROLE_FACULTY">Faculty</option>
                                    </select>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        style={{ flex: 1, backgroundColor: themeColor, color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Invite'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
