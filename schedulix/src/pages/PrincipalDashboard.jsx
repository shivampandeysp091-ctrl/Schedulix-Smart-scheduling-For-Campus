import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Message from '../components/Message';
import { Loader2, Plus, Users, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const PrincipalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(true);
    
    // Add Admin (HOD) Modal State
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: '' });
    const [isAddingNewDept, setIsAddingNewDept] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'ROLE_ADMIN',
        departmentName: '' // Principal creates Admin and assigns them a Dept
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchDepartments = async () => {
        try {
            const data = await apiService.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to load departments:", error);
        } finally {
            setLoadingDepts(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: null, text: '' });
        
        try {
            // Note: Principal's collegeId is automatically injected by backend!
            const responseText = await apiService.adminCreateUser({...formData, collegeId: ''});
            setMessage({ type: 'success', text: responseText });
            setFormData({ email: '', fullName: '', role: 'ROLE_ADMIN', departmentName: '' }); 
            fetchDepartments(); // refresh
            setTimeout(() => {
                setShowModal(false);
                setMessage({ type: null, text: '' });
            }, 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to create Department HOD.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="layout-container">
            <div className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><School size={32} color="#3b82f6" /> Principal Dashboard</h1>
                        <p>Welcome, Principal {user?.fullName || user?.username}. Manage your institutional departments and HODs.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    <div className="card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Manage Departments (HODs)</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Create new academic departments and assign Heads of Department.</p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                            <button 
                                className="btn-primary" 
                                style={{ padding: '10px 15px', border: 'none', borderRadius: '5px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                onClick={() => setShowModal(true)}
                            >
                                <Plus size={16}/> Add Department (HOD)
                            </button>
                            <button 
                                onClick={() => navigate('/upgrade')}
                                style={{ padding: '10px 15px', border: '1px solid #f59e0b', borderRadius: '5px', backgroundColor: '#fffbeb', color: '#b45309', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
                            >
                                🔥 Upgrade Plan
                            </button>
                        </div>
                    </div>
                </div>

                <h2 style={{ marginTop: '40px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>Active Departments</h2>
                {loadingDepts ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={32} color="#3b82f6" /></div>
                ) : departments.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>No departments created yet. Click "Add Department" to start building your college.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', marginTop: '20px' }}>
                        {departments.map(dept => (
                            <div key={dept.id} style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{dept.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '14px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dept.themeColor || '#3b82f6' }}></div> Theme Color
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Admin Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                            <h2 style={{marginTop: 0, marginBottom: '20px'}}>Create Department & HOD</h2>
                            
                            {message.text && (
                                <div style={{ 
                                    padding: '12px', 
                                    marginBottom: '20px', 
                                    borderRadius: '6px', 
                                    backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                                    color: message.type === 'error' ? '#991b1b' : '#166534',
                                    border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                                    fontSize: '14px',
                                    lineHeight: '1.4'
                                }}>
                                    {message.text}
                                    {message.text.includes('Demo limit reached') && (
                                        <button 
                                            onClick={() => navigate('/upgrade')}
                                            style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Upgrade Plan Now
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>HOD Full Name</label>
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
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>HOD Email Address</label>
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
                                            <option value="ADD_NEW">+ Create New Department...</option>
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
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Department'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Close
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

export default PrincipalDashboard;
