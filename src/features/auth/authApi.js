import { baseApi } from '../../services/api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send OTP to email
    sendOtp: builder.mutation({
      query: (email) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: { email },
      }),
    }),
    
    // Verify OTP and Register
    verifyOtpAndRegister: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp-register',
        method: 'POST',
        body: data, // { email, otp, username, password, fullName }
        credentials: 'include',
      }),
    }),
    
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials, // { email, password }
        credentials: 'include',
      }),
    }),
    
    // Refresh Token
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    
    // Change Password (khi đã login)
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data, // { oldPassword, newPassword }
        credentials: 'include',
      }),
    }),
    
    // Forgot Password - Request Reset
    requestResetPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    // Reset Password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data, // { email, otp, newPassword }
      }),
    }),
    
    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    
    // Get Current User
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpAndRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestResetPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;