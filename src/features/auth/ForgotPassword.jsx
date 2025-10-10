import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequestResetPasswordMutation, useResetPasswordMutation } from './authApi';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const navigate = useNavigate();
  const [requestReset, { isLoading: isRequesting }] = useRequestResetPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    try {
      await requestReset(formData.email).unwrap();
      setStep(2);
      alert('OTP sent to your email!');
    } catch (err) {
      alert(err.data?.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      }).unwrap();
      
      alert('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      alert(err.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      
      {step === 1 && (
        <form onSubmit={handleRequestReset}>
          <p className="text-sm text-gray-600 mb-4">
            Enter your email to receive a password reset code
          </p>
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
            disabled={isRequesting}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {isRequesting ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            value={formData.otp}
            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
            placeholder="Enter OTP"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="New Password"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm Password"
            required
            className="w-full p-2 border rounded mb-4"
          />
          <button 
            type="submit" 
            disabled={isResetting}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            {isResetting ? 'Resetting...' : 'Reset Password'}
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

export default ForgotPassword;