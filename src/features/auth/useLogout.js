import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from './authApi';
import { logout as logoutAction } from './authSlice';

const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logoutAction());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
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