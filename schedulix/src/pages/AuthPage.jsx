// src/pages/AuthPage.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Context ko import karein
import Message from '../components/Message'; // Message component ko import karein
import { Loader2 } from 'lucide-react'; // Loading spinner ke liye
import './AuthPage.css'; // Aapka naya CSS file

// Font Awesome icons ke liye, index.html mein script add karna hoga
// <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
// Yahaan hum React icons use kar rahe hain (example ke liye)

export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);
  const { login, register } = useAuth(); // Context se functions lein
  const navigate = useNavigate();

  // Form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', role: 'STUDENT' }); // Default role
  
  // Loading aur Message state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: '' });
  
  // Force Reset State
  const [requireReset, setRequireReset] = useState(false);
  const [resetData, setResetData] = useState({ username: '', currentPassword: '', newPassword: '' });

  // Role dropdown state
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  // Message dikhane ke liye helper
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 5000);
  }, []);

  // Panel slide handlers
  const handleRegisterClick = () => setIsActive(true);
  const handleLoginClick = () => setIsActive(false);

  // Form input change handlers
  const handleLoginChange = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleRegisterChange = (e) => {
    setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleRoleSelect = (role) => {
    // Backend ko "ROLE_STUDENT" ya "ROLE_FACULTY" chahiye
    const roleValue = role === 'Student' ? 'ROLE_STUDENT' : 'ROLE_FACULTY';
    setRegisterData(prev => ({ ...prev, role: roleValue }));
    setIsRoleOpen(false);
  };
  const toggleRoleDropdown = () => setIsRoleOpen(!isRoleOpen);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: null, text: '' });
    try {
      await login(loginData.username, loginData.password);
      showMessage('success', 'Login successful! Redirecting...');
      // AuthContext token set kar dega aur App.jsx redirect handle karega
      navigate('/'); 
    } catch (error) {
      if (error.requirePasswordReset) {
         setRequireReset(true);
         setResetData({ username: error.username, currentPassword: loginData.password, newPassword: '' });
         showMessage('error', 'First login detected. You must change your temporary password to continue.');
      } else {
         showMessage('error', error.message || 'Login failed.');
      }
    } finally {
        setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage({ type: null, text: '' });
      try {
          const apiService = (await import('../services/api')).default;
          await apiService.firstLoginReset(resetData.username, resetData.currentPassword, resetData.newPassword);
          showMessage('success', 'Password reset successfully! Please log in again with your new password.');
          setRequireReset(false);
          setLoginData({ username: resetData.username, password: '' });
      } catch(error) {
          showMessage('error', error.message || 'Failed to reset password.');
      } finally {
          setLoading(false);
      }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.role === '') {
        showMessage('error', 'Please select a role.');
        return;
    }
    setLoading(true);
    setMessage({ type: null, text: '' });
    try {
      const responseText = await register(registerData.username, registerData.password, registerData.role);
      showMessage('success', `${responseText}. Please log in.`);
      setIsActive(false); // Login panel par slide karo
      setRegisterData({ username: '', password: '', role: 'STUDENT' }); // Form clear karo
    } catch (error) {
      showMessage('error', error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Wrapper jo page ko center karta hai
    <div className="auth-page-wrapper">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        
        {/* Registration Form (sign-up) */}
        <div className="form-container sign-up">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>REGISTER</h1>
            <div className="social-icons">
            <a href="#" className="icon"><i className="fa-solid fa-chalkboard-teacher"></i></a>
            <a href="#" className="icon"><i className="fa-solid fa-graduation-cap"></i></a>
            <a href="#" className="icon"><i className="fa-solid fa-book"></i></a>
            <a href="#" className="icon"><i className="fa-solid fa-calendar-alt"></i></a>
          </div>
            
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ marginBottom: '15px' }}>Registration is currently restricted to prevent unauthorized access.</p>
              <p style={{ fontWeight: 'bold', color: '#3b82f6' }}>Please contact your Department HOD (Admin) to manually add your account or receive an invite.</p>
            </div>

            <button type="button" onClick={handleLoginClick} style={{ marginTop: '20px' }}>
              Go to Login
            </button>
          </form>
        </div>
        
        {/* Login or Force Reset Form (sign-in) */}
        <div className="form-container sign-in">
          {requireReset ? (
              <form onSubmit={handleResetSubmit}>
                <h1>Change Password</h1>
                <p style={{marginBottom: '20px', fontSize: '14px', color: '#666'}}>Please change your temporary dummy password before continuing.</p>
                {/* Error/Success message yahaan dikhayein */}
                {message.text && <Message message={message} />}
                
                <input 
                  type="text" 
                  value={resetData.username}
                  disabled
                  style={{ backgroundColor: '#eee', cursor: 'not-allowed' }}
                /> 
                <input 
                  type="password" 
                  name="newPassword"
                  placeholder="New Password" 
                  value={resetData.newPassword}
                  onChange={(e) => setResetData(prev => ({...prev, newPassword: e.target.value}))}
                  required
                />
                
                <button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                </button>
                <button type="button" onClick={() => setRequireReset(false)} style={{ marginTop: '10px', backgroundColor: 'transparent', color: '#333', border: '1px solid #ccc' }}>
                    Cancel
                </button>
              </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <h1>Login</h1>
              <div className="social-icons">
                <a href="#" className="icon"><i className="fa-solid fa-user-graduate"></i></a>
                <a href="#" className="icon"><i className="fa-solid fa-book-open"></i></a>
                <a href="#" className="icon"><i className="fa-solid fa-school"></i></a>
                <a href="#" className="icon"><i className="fa-solid fa-clock"></i></a>
              </div>
              {/* Error/Success message yahaan dikhayein */}
              {message.text && isActive && <Message message={message} />}
              
              <input 
                type="text" 
                name="username"
                placeholder="College ID / Username" 
                value={loginData.username}
                onChange={handleLoginChange}
                required
              /> 
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              
              <a href="#">Forgot Your Password?</a>
              <button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Login'}
              </button>
            </form>
          )}
        </div>
        
        {/* The Sliding Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome to Schedulix</h1>
              <p>Already have an account? Login to access your dashboard.</p> 
              <button type="button" className="hidden" onClick={handleLoginClick}>Login</button>
            </div>
            
            <div className="toggle-panel toggle-right">
              <h1>Welcome to Schedulix</h1> 
              <p>Don't have an account? Register to get started.</p> 
              <button type="button" className="hidden" onClick={handleRegisterClick}>Register</button> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}