import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Building2, Users, Loader2, CreditCard, Clock, Activity } from 'lucide-react';
import '../App.css';

const PlatformAdminConsole = () => {
    const { user } = useAuth();
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const data = await apiService.getAllColleges();
                setColleges(data);
            } catch (error) {
                console.error("Failed to fetch colleges:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchColleges();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '50px' }}>
                <Loader2 className="animate-spin" size={48} color="#3b82f6" />
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building2 size={32} color="#3b82f6" /> Platform Matrix
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Superadmin Global View of All Registered Institutions</p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '15px 25px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{colleges.length}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Tenants</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {colleges.map((college) => {
                    const expired = college.paymentStatus !== 'paid' && isExpired(college.demoExpiresAt);
                    const statusColor = college.status === 'active' && !expired ? '#10b981' : '#f43f5e';
                    
                    return (
                        <div key={college.id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {college.collegeName}
                                </h3>
                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: `${statusColor}20`, color: statusColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Activity size={12} />
                                    {expired ? 'EXPIRED' : college.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={14} /> Max Faculty
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#334155' }}>
                                            {college.maxFaculty === 999999 ? 'Unlimited' : college.maxFaculty}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={14} /> Max Students
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#334155' }}>
                                            {college.maxStudents === 999999 ? 'Unlimited' : college.maxStudents}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CreditCard size={14} /> Payment Plan
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#334155', textTransform: 'capitalize' }}>
                                            {college.planTier.replace('_', ' ')}
                                            {college.paymentStatus === 'paid' && <CheckCircle2 size={14} color="#10b981" style={{marginLeft: '5px'}}/>}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: expired ? '#ef4444' : '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={14} /> Demo Expires
                                        </div>
                                        <div style={{ fontWeight: '600', color: expired ? '#ef4444' : '#334155' }}>
                                            {college.paymentStatus === 'paid' ? 'N/A' : formatDate(college.demoExpiresAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '15px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                                <button style={{ flex: 1, padding: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>Manage Limits</button>
                                <button style={{ flex: 1, padding: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>Extend Trial</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {colleges.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <Building2 size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                    <h3 style={{ color: '#475569', margin: '0 0 10px 0' }}>No Institutions Found</h3>
                    <p style={{ color: '#64748b', margin: 0 }}>Start by approving demo requests to populate the matrix.</p>
                </div>
            )}
        </div>
    );
};

export default PlatformAdminConsole;
