import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../../services/api';
import authReducer from '../../features/auth/authSlice';
import { authMiddleware } from '../../features/auth/authMiddleware';

export const store = configureStore({
  reducer: {
    // RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
    // Auth slice
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, authMiddleware),
});