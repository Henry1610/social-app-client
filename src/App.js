import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateAccessToken, logout } from './features/auth/authSlice';
import { useRefreshTokenMutation } from './features/auth/authApi';
import AppRoutes from './routes';
import './App.css';
import InstagramSpinner from './components/common/InstagramSpinner';
function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken] = useRefreshTokenMutation();

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

  return <AppRoutes />;
}

export default App;
