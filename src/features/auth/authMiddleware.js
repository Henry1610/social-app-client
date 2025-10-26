import { updateAccessToken, logout } from '../../features/auth/authSlice';

// Decode JWT token để lấy expiration time
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Middleware để tự động refresh token trước khi hết hạn
export const authMiddleware = (store) => (next) => async (action) => {
  // Gọi action trước
  const result = next(action);

  // Sau khi setCredentials hoặc updateAccessToken, bắt đầu countdown refresh
  if (action.type === 'auth/setCredentials' || action.type === 'auth/updateAccessToken') {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (accessToken) {
      scheduleTokenRefresh(store, accessToken);
    }
  }

  return result;
};

// Lưu timeout ID để cancel nếu cần
let refreshTimeout = null;

const scheduleTokenRefresh = (store, token) => {
  // Clear timeout cũ nếu có
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    console.warn(' Cannot decode token expiration');
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = decoded.exp - now; // Seconds
  const refreshThreshold = 60; // Refresh 1 phút trước khi hết hạn

  // Nếu token sắp hết hạn (< 1 phút) hoặc đã hết, refresh ngay
  if (expiresIn <= refreshThreshold) {
    console.log(' Token sắp hết hạn, refresh ngay...');
    refreshAccessToken(store);
  } else {
    // Schedule refresh vào lúc: (expiresIn - refreshThreshold) giây
    const delayMs = (expiresIn - refreshThreshold) * 1000;

    refreshTimeout = setTimeout(() => {
      console.log(' Proactive token refresh...');
      refreshAccessToken(store);
    }, delayMs);
  }
};

const refreshAccessToken = async (store) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Gửi HttpOnly Cookie
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    // Update token
    store.dispatch(updateAccessToken(newAccessToken));
    console.log('✅ Token refreshed successfully');

    // Schedule next refresh
    scheduleTokenRefresh(store, newAccessToken);
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    store.dispatch(logout());
  }
};

// Export function để manual refresh nếu cần
export const manualRefreshToken = (store) => {
  refreshAccessToken(store);
};