import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Loader2, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const UpgradePage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const plans = [
        {
            title: 'Department Pro',
            price: '₹4,999',
            amount: 4999,
            tier: 'department_pro',
            features: ['Up to 30 Faculty', 'Up to 800 Students', 'Department Siloed Reporting', 'Basic Support']
        },
        {
            title: 'Institution Max',
            price: '₹19,999',
            amount: 19999,
            tier: 'institution_plan',
            features: ['Up to 100 Faculty', 'Up to 5000 Students', 'Cross-Department Analytics', 'Priority 24/7 Support', 'Custom Branding']
        }
    ];

    const handleSubscribe = async (plan) => {
        setLoadingPlan(plan.tier);
        setError('');
        try {
            // 1. Create order on backend
            const orderJsonStr = await apiService.createPaymentOrder(plan.amount, plan.tier);
            const orderData = JSON.parse(orderJsonStr);

            // 2. Configure Razorpay
            const options = {
                key: 'rzp_test_Sb6hgVlyzEKXdq', // Typically from env, but fallback here
                amount: orderData.amount,
                currency: 'INR',
                name: 'Schedulix SaaS',
                description: `Subscription: ${plan.title}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const verifyPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planTier: plan.tier
                        };
                        await apiService.verifyPayment(verifyPayload);
                        setSuccess(true);
                        setTimeout(() => window.location.href = '/dashboard', 3000);
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                    }
                },
                theme: {
                    color: '#3b82f6'
                }
            };

            if (options.key === 'rzp_test_placeholder_key' || !options.key) {
                // MOCK BYPASS: Since there are no real Razorpay Keys installed, simulate successful payment after 1.5 seconds.
                console.warn("Using Razorpay Mock Bypass because real keys are missing.");
                setTimeout(async () => {
                    try {
                        const verifyPayload = {
                            razorpay_order_id: orderData.id || "mock_order_123",
                            razorpay_payment_id: "mock_payment_456",
                            razorpay_signature: "mock_signature_789",
                            planTier: plan.tier,
                            mock_bypass: true
                        };
                        await apiService.verifyPayment(verifyPayload);
                        setSuccess(true);
                        setTimeout(() => window.location.href = '/dashboard', 3000);
                    } catch (err) {
                        setError('Mock Payment verification failed. Did you update the backend? ' + err.message);
                    }
                }, 1500);
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (err) {
            setError(err.message || 'Failed to initiate payment.');
        } finally {
            setLoadingPlan(null);
        }
    };

    if (success) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0fdf4' }}>
                <div style={{ textAlign: 'center' }}>
                    <CheckCircle2 color="#16a34a" size={64} style={{ margin: '0 auto 20px' }} />
                    <h1 style={{ color: '#16a34a', marginBottom: '10px' }}>Payment Successful!</h1>
                    <p style={{ color: '#15803d', fontSize: '1.2rem' }}>Your sandbox limits have been lifted. Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <nav style={{ padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>S</div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>Schedulix</span>
                </div>
                <button onClick={() => { logout(); navigate('/auth'); }} style={{ appearance: 'none', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}>
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
                <AlertTriangle size={64} color="#f59e0b" style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '15px', textAlign: 'center' }}>Your Demo Has Expired</h1>
                <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', textAlign: 'center', marginBottom: '40px', lineHeight: '1.6' }}>
                    Your 14-day free trial sandbox for Schedulix has completed. To restore access for your faculty and students, please upgrade to a production tier below.
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '15px 20px', borderRadius: '8px', marginBottom: '30px', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '1000px', width: '100%' }}>
                    {plans.map((plan, idx) => (
                        <div key={idx} style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '10px' }}>{plan.title}</h2>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', marginBottom: '30px' }}>{plan.price}<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>/month</span></div>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px', flex: 1 }}>
                                {plan.features.map((opt, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#475569' }}>
                                        <CheckCircle2 size={18} color="#10b981" /> {opt}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handleSubscribe(plan)}
                                disabled={loadingPlan !== null}
                                style={{ width: '100%', padding: '15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                {loadingPlan === plan.tier ? <Loader2 className="animate-spin" size={24} /> : 'Subscribe via Razorpay'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
