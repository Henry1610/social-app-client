import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, updateAccessToken } from '../features/auth/authSlice';

const serverUrl = process.env.REACT_APP_SERVER_URL;
const baseQuery = fetchBaseQuery({
  baseUrl: `${serverUrl}/api`,
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
  
  if (result?.error?.status === 401 ) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );
    
    if (refreshResult?.data) {
      
      const { accessToken } = refreshResult.data;
      api.dispatch(updateAccessToken(accessToken));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};


export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', 'User', 'Comment', 'Story', 'Message', 'Notification', 'Reaction'],
  endpoints: () => ({}),
});