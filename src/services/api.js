import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, updateAccessToken } from '../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.SERVER_URL + 'api' || 'http://localhost:5000/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper để handle refresh token tự động
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Nếu AT hết hạn (401)
  if (result?.error?.status === 401) {
    console.log('Access token expired, refreshing...');

    // Gọi refresh token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Lưu AT mới
      const { accessToken } = refreshResult.data;
      api.dispatch(updateAccessToken(accessToken));

      // Retry request ban đầu với AT mới
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh thất bại -> logout
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', 'User', 'Comment', 'Story', 'Message', 'Notification'],
  endpoints: () => ({}),
});