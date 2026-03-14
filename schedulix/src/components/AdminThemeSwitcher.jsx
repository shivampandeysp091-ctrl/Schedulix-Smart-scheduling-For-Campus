import React, { useState } from 'react';
import apiService from '../services/api';

const AdminThemeSwitcher = ({ currentTheme, onThemeChange, departmentName }) => {
    const [color, setColor] = useState(currentTheme || '#3b82f6'); // Default blue
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            // Using generic request method if updateDepartmentTheme is not explicitly in apiService
            await apiService.setToken(localStorage.getItem('token')); // Ensure token
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
            const response = await fetch(`${backendUrl}/api/admin/department/update-theme`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ themeColor: color, departmentName })
            });
            
            if (response.ok) {
                setMessage('Theme updated successfully!');
                onThemeChange(color);
            } else {
                setMessage('Failed to update theme.');
            }
        } catch (error) {
            setMessage('Error updating theme.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9fafb' }}>
            <h3 style={{ marginTop: 0 }}>Department Theme Customization</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Change the primary color for all users in your department.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    style={{ width: '50px', height: '40px', cursor: 'pointer', border: 'none', padding: 0 }}
                />
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Saving...' : 'Save Theme'}
                </button>
            </div>
            {message && <p style={{ marginTop: '10px', fontSize: '14px', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
};

export default AdminThemeSwitcher;
