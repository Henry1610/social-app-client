import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSendOtpMutation, useVerifyOtpAndRegisterMutation } from './authApi';
import { setCredentials } from './authSlice';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + Info
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    username: '',
    password: '',
    fullName: '',
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtpAndRegister, { isLoading: isRegistering }] = useVerifyOtpAndRegisterMutation();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    try {
      await sendOtp(formData.email).unwrap();
      setStep(2);
      alert('OTP sent to your email!');
    } catch (err) {
      alert(err.data?.message || 'Failed to send OTP');
    }
  };

  // Step 2: Verify OTP and Register
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const result = await verifyOtpAndRegister(formData).unwrap();
      
      dispatch(setCredentials({
        user: result.data.user,
        accessToken: result.data.accessToken,
      }));
      
      navigate('/');
    } catch (err) {
      alert(err.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <button 
            type="submit" 
            disabled={isSendingOtp}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {isSendingOtp ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={formData.otp}
            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
            placeholder="Enter OTP"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Username"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Full Name"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <button 
            type="submit" 
            disabled={isRegistering}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {isRegistering ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full mt-2 text-blue-500"
          >
            Resend OTP
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;