import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAccessToken, logout } from './features/auth/authSlice';
import { useRefreshTokenMutation } from './features/auth/api/authApi';
import AppRoutes from './routes';
import './App.css';
import './styles/sidebar.css';
import InstagramSpinner from './components/common/InstagramSpinner';
import NotificationToast from './features/notification/components/NotificationToast';
import { useSocket } from './hooks/useSocket';

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken] = useRefreshTokenMutation();
  
  // Get user info from Redux store
  const { user, accessToken } = useSelector(state => state.auth);
  
  // Initialize socket connection
  useSocket(user?.id, accessToken);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const result = await refreshToken().unwrap();
        const { accessToken } = result;
        dispatch(updateAccessToken(accessToken));
      } catch (error) {
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [dispatch, refreshToken]);

  if (isLoading) {
    return <div style={{ padding: 16 }}><InstagramSpinner /></div>;
  }

  return (
    <>
      <AppRoutes />
      <NotificationToast />
    </>
  );
}

export default App;
