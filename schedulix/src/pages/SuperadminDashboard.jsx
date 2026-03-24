import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Message from '../components/Message';
import { Loader2 } from 'lucide-react';

const SuperadminDashboard = () => {
    const { user } = useAuth();
    
    // Add Admin Modal State
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });
    const [departments, setDepartments] = useState([]);
    const [isAddingNewDept, setIsAddingNewDept] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'ROLE_ADMIN',
        departmentName: '',
        collegeId: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await apiService.getAllDepartments();
                setDepartments(data);
            } catch (error) {
                console.error("Failed to load departments:", error);
            }
        };
        fetchDepartments();
    }, []);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: null, text: '' });
        
        try {
            const responseText = await apiService.adminCreateUser(formData);
            setMessage({ type: 'success', text: responseText });
            setFormData({ email: '', fullName: '', role: 'ROLE_ADMIN', departmentName: '' }); // Reset form
            setTimeout(() => {
                setShowModal(false);
                setMessage({ type: null, text: '' });
            }, 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to create admin.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="layout-container">
            <div className="dashboard-content">
                <h1>Superadmin Dashboard</h1>
                <p>Welcome, {user?.fullName || user?.username}. You have global administrative access.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    <div className="card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3>Manage Departments</h3>
                        <p>Create new departments or archive existing ones.</p>
                        <button className="btn-primary">View Departments</button>
                    </div>
                    
                    <div className="card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3>Manage Admins (HODs)</h3>
                        <p>Assign Admins to specific departments.</p>
                        <button 
                            className="btn-primary" 
                            style={{marginRight: '10px', padding: '10px 15px', border: 'none', borderRadius: '5px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}
                            onClick={() => setShowModal(true)}
                        >
                            Add Admin
                        </button>
                    </div>
                </div>

                {/* Add Admin Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                            <h2 style={{marginTop: 0, marginBottom: '20px'}}>Add New Admin (HOD)</h2>
                            {message.text && <Message message={message} />}
                            
                            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Department Name</label>
                                    {!isAddingNewDept ? (
                                        <select 
                                            name="departmentName"
                                            value={formData.departmentName}
                                            onChange={(e) => {
                                                if (e.target.value === 'ADD_NEW') {
                                                    setIsAddingNewDept(true);
                                                    setFormData({ ...formData, departmentName: '' });
                                                } else {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            required
                                            style={{width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'}}
                                        >
                                            <option value="" disabled>Select a department</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                            <option value="ADD_NEW">+ Add New Department...</option>
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="text" 
                                                name="departmentName"
                                                placeholder="e.g., Computer Science"
                                                value={formData.departmentName}
                                                onChange={handleInputChange}
                                                required
                                                style={{flex: 1, padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px'}}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setIsAddingNewDept(false);
                                                    setFormData({ ...formData, departmentName: '' });
                                                }}
                                                style={{ padding: '0 15px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <small style={{color: '#666', fontSize: '12px', marginTop: '5px', display: 'block'}}>The department will be created if it doesn't already exist.</small>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Admin'}
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

export default SuperadminDashboard;
