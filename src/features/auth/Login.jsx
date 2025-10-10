import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from './authApi';
import { setCredentials } from './authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await login(formData).unwrap();
      
      dispatch(setCredentials({
        user: result.data.user,
        accessToken: result.data.accessToken,
      }));
      
      navigate('/');
    } catch (err) {
      alert(err.data?.message || 'Login failed');
    }
  };

  // Facebook Login
  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
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
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <button
        onClick={handleFacebookLogin}
        className="w-full bg-blue-600 text-white p-2 rounded mb-4 flex items-center justify-center"
      >
        <span className="mr-2">📘</span>
        Login with Facebook
      </button>

      <div className="text-center mt-4">
        <Link to="/forgot-password" className="text-blue-500 text-sm">
          Forgot password?
        </Link>
      </div>
      
      <div className="text-center mt-2">
        <span className="text-sm">Don't have an account? </span>
        <Link to="/register" className="text-blue-500 text-sm">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;