import { useState } from 'react';
import { useChangePasswordMutation } from './authApi';
import { toast } from 'sonner';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      }).unwrap();
      
      toast.success('Password changed successfully!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={formData.oldPassword}
          onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
          placeholder="Current Password"
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
          placeholder="Confirm New Password"
          required
          className="w-full p-2 border rounded mb-4"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;