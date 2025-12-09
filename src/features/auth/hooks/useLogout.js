import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '../api/authApi';
import { logout as logoutAction } from '../authSlice';
import { chatApi } from '../../chat/api/chatApi';
import { profileApi } from '../../profile/api/profileApi.js';
import { baseApi } from '../../../services/api';

const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      
      // Clear all RTK Query cache
      dispatch(baseApi.util.resetApiState());
      dispatch(chatApi.util.resetApiState());
      dispatch(profileApi.util.resetApiState());
      
      dispatch(logoutAction());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      
      // Clear all RTK Query cache even if API fails
      dispatch(baseApi.util.resetApiState());
      dispatch(chatApi.util.resetApiState());
      dispatch(profileApi.util.resetApiState());
      
      // Vẫn logout local nếu API fail
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  return handleLogout;
};

export default useLogout;

// Sử dụng trong component:
// const logout = useLogout();
// <button onClick={logout}>Logout</button>