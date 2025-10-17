import { baseApi } from '../../services/api';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFollowStats: builder.query({
      query: (username) => `/user/follows/${username}/stats`,
      providesTags: (result, error, username) => [
        { type: 'User', id: `follow-stats-${username}` },
      ],
    }),
    searchUsers: builder.query({
      query: (q) => ({ url: `/user/search`, params: { q } }),
    }),
    getPublicProfile: builder.query({
      query: (username) => `/user/${username}/profile`,
      providesTags: (result, error, username) => [
        { type: 'User', id: `profile-${username}` },
      ],
    }),
    getFollowStatus: builder.query({
      query: (username) => `/user/follows/${username}/status`,
      providesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
      ],
    }),
    followUser: builder.mutation({
      query: (username) => ({ url: `/user/follows/${username}`, method: 'POST' }),
      async onQueryStarted(username, { dispatch, queryFulfilled }) {
        const patchStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.isFollowing = true;
              draft.isSelf = false;
            }
          })
        );
        const patchStats = dispatch(
          profileApi.util.updateQueryData('getFollowStats', username, (draft) => {
            if (draft?.stats?.followerCount !== undefined) {
              draft.stats.followerCount = (draft.stats.followerCount || 0) + 1;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchStatus.undo();
          patchStats.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
        { type: 'User', id: `follow-stats-${username}` },
      ],
    }),
    unfollowUser: builder.mutation({
      query: (username) => ({ url: `/user/follows/${username}`, method: 'DELETE' }),
      async onQueryStarted(username, { dispatch, queryFulfilled }) {
        const patchStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.isFollowing = false;
              draft.isSelf = false;
            }
          })
        );
        const patchStats = dispatch(
          profileApi.util.updateQueryData('getFollowStats', username, (draft) => {
            if (draft?.stats?.followerCount !== undefined) {
              draft.stats.followerCount = Math.max(0, (draft.stats.followerCount || 0) - 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchStatus.undo();
          patchStats.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
        { type: 'User', id: `follow-stats-${username}` },
      ],
    }),
    cancelFollowRequest: builder.mutation({
      query: (username) => ({
        url: `/user/follows/${username}/cancel-request`,
        method: 'DELETE',
      }),
      async onQueryStarted(username, { dispatch, queryFulfilled }) {
        const patchStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.isPending = false;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchStatus.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
      ],
    }),
  }),
});

export const { useGetFollowStatsQuery, useLazySearchUsersQuery, useGetPublicProfileQuery, useGetFollowStatusQuery, useFollowUserMutation, useUnfollowUserMutation,useCancelFollowRequestMutation } = profileApi;