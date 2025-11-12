import { baseApi } from '../../../services/api';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/user/notifications`,
        params: { page, limit },
      })
    }),
  })
});

export const {
  useGetNotificationsQuery,
} = notificationApi;

