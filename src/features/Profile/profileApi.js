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
    getFollowers: builder.query({
      query: (username) => `/user/follows/${username}/follower`,
      providesTags: (result, error, username) => [
        { type: 'User', id: `followers-${username}` },
      ],
    }),
    getFollowings: builder.query({
      query: (username) => `/user/follows/${username}/following`,
      providesTags: (result, error, username) => [
        { type: 'User', id: `followings-${username}` },
      ],
    }),
    
    followUser: builder.mutation({
      query: (username) => ({ url: `/user/follows/${username}`, method: 'POST' }),
      async onQueryStarted(username, { dispatch, queryFulfilled, getState }) {
        const currentUsername = getState().auth?.user?.username;
        
        // Update follow status
        const patchStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.isFollowing = true;
              draft.isPending = false;
              draft.isSelf = false;
            }
          })
        );
        
        // Update follower count của target user
        const patchTargetStats = dispatch(
          profileApi.util.updateQueryData('getFollowStats', username, (draft) => {
            if (draft?.stats?.followerCount !== undefined) {
              draft.stats.followerCount = (draft.stats.followerCount || 0) + 1;
            }
          })
        );
        
        // Update following count của current user
        const patchMyStats = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowStats', currentUsername, (draft) => {
            if (draft?.stats?.followingCount !== undefined) {
              draft.stats.followingCount = (draft.stats.followingCount || 0) + 1;
            }
          })
        ) : null;
        
        // Update danh sách followings của current user
        const patchCurrentUserFollowings = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowings', currentUsername, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const isAlreadyInList = draft.users.some(u => u.username === username);
              if (!isAlreadyInList) {
                draft.users.unshift({
                  username,
                });
                if (draft.totalCount !== undefined) {
                  draft.totalCount += 1;
                }
              }
            }
          })
        ) : null;
        
        // Update danh sách followers của target user
        const patchTargetFollowers = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowers', username, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const isAlreadyInList = draft.users.some(u => u.username === currentUsername);
              if (!isAlreadyInList) {
                draft.users.unshift({
                  username: currentUsername,
                });
                if (draft.totalCount !== undefined) {
                  draft.totalCount += 1;
                }
              }
            }
          })
        ) : null;
        
        try {
          await queryFulfilled;
        } catch {
          patchStatus.undo();
          patchTargetStats.undo();
          patchMyStats?.undo();
          patchCurrentUserFollowings?.undo();
          patchTargetFollowers?.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
        { type: 'User', id: `follow-stats-${username}` },
        { type: 'User', id: `followers-${username}` },
        'User',
      ],
    }),
    
    unfollowUser: builder.mutation({
      query: (username) => ({ url: `/user/follows/${username}`, method: 'DELETE' }),
      async onQueryStarted(username, { dispatch, queryFulfilled, getState }) {
        const currentUsername = getState().auth?.user?.username;
        
        // Update follow status
        const patchStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.isFollowing = false;
              draft.isSelf = false;
            }
          })
        );
        
        // Update follower count của target user
        const patchTargetStats = dispatch(
          profileApi.util.updateQueryData('getFollowStats', username, (draft) => {
            if (draft?.stats?.followerCount !== undefined) {
              draft.stats.followerCount = Math.max(0, (draft.stats.followerCount || 0) - 1);
            }
          })
        );
        
        // Update following count của current user
        const patchMyStats = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowStats', currentUsername, (draft) => {
            if (draft?.stats?.followingCount !== undefined) {
              draft.stats.followingCount = Math.max(0, (draft.stats.followingCount || 0) - 1);
            }
          })
        ) : null;
        
        // Remove khỏi danh sách followings của current user
        const patchCurrentUserFollowings = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowings', currentUsername, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const index = draft.users.findIndex(u => u.username === username);
              if (index !== -1) {
                draft.users.splice(index, 1);
                if (draft.totalCount !== undefined) {
                  draft.totalCount = Math.max(0, draft.totalCount - 1);
                }
              }
            }
          })
        ) : null;
        
        // Remove khỏi danh sách followers của target user
        const patchTargetFollowers = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowers', username, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const index = draft.users.findIndex(u => u.username === currentUsername);
              if (index !== -1) {
                draft.users.splice(index, 1);
                if (draft.totalCount !== undefined) {
                  draft.totalCount = Math.max(0, draft.totalCount - 1);
                }
              }
            }
          })
        ) : null;
        
        try {
          await queryFulfilled;
        } catch {
          patchStatus.undo();
          patchTargetStats.undo();
          patchMyStats?.undo();
          patchCurrentUserFollowings?.undo();
          patchTargetFollowers?.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
        { type: 'User', id: `follow-stats-${username}` },
        { type: 'User', id: `followers-${username}` },
        'User',
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
    
    acceptFollowRequest: builder.mutation({
      query: (username) => ({
        url: `/user/follows/requests/${username}/accept`,
        method: 'POST',
      }),
      async onQueryStarted(username, { dispatch, queryFulfilled, getState }) {
        const currentUsername = getState().auth?.user?.username;
        
        // 👇 Update follow status của requester (xóa hasIncomingRequest)
        const patchRequesterStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.hasIncomingRequest = false;
              draft.isFollower = true;
            }
          })
        );
        
        // 👇 Update follow status của current user (xóa khỏi incomingRequests nếu isSelf)
        const patchMyStatus = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowStatus', currentUsername, (draft) => {
            if (draft?.isSelf && draft.incomingRequests) {
              draft.incomingRequests = draft.incomingRequests.filter(
                req => req.fromUser.username !== username
              );
            }
          })
        ) : null;
        
        // Update follower count của current user
        const patchStats = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowStats', currentUsername, (draft) => {
            if (draft?.stats?.followerCount !== undefined) {
              draft.stats.followerCount = (draft.stats.followerCount || 0) + 1;
            }
          })
        ) : null;
        
        // Thêm requester vào danh sách followers của current user
        const patchCurrentUserFollowers = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowers', currentUsername, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const isAlreadyInList = draft.users.some(u => u.username === username);
              if (!isAlreadyInList) {
                draft.users.unshift({
                  username,
                });
                if (draft.totalCount !== undefined) {
                  draft.totalCount += 1;
                }
              }
            }
          })
        ) : null;
        
        try {
          await queryFulfilled;
        } catch {
          patchRequesterStatus.undo();
          patchMyStatus?.undo();
          patchStats?.undo();
          patchCurrentUserFollowers?.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
        'User', 
      ],
    }),
    
    rejectFollowRequest: builder.mutation({
      query: (username) => ({
        url: `/user/follows/requests/${username}/reject`,
        method: 'DELETE',
      }),
      async onQueryStarted(username, { dispatch, queryFulfilled, getState }) {
        const currentUsername = getState().auth?.user?.username;
        
        // Update follow status của requester
        const patchRequesterStatus = dispatch(
          profileApi.util.updateQueryData('getFollowStatus', username, (draft) => {
            if (draft) {
              draft.hasIncomingRequest = false;
            }
          })
        );
        
        // 👇 Update follow status của current user (xóa khỏi incomingRequests)
        const patchMyStatus = currentUsername ? dispatch(
          profileApi.util.updateQueryData('getFollowStatus', currentUsername, (draft) => {
            if (draft?.isSelf && draft.incomingRequests) {
              draft.incomingRequests = draft.incomingRequests.filter(
                req => req.fromUser.username !== username
              );
            }
          })
        ) : null;
        
        try {
          await queryFulfilled;
        } catch {
          patchRequesterStatus.undo();
          patchMyStatus?.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-status-${username}` },
      ],
    }),
    
    getSearchHistory: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/user/search/history`,
        params: { page, limit },
      }),
    }),
    clearSearchHistory: builder.mutation({
      query: () => ({ url: `/user/search/history`, method: 'DELETE' }),
    }),
    recordSearchSelection: builder.mutation({
      query: (payload) => ({ url: `/user/search/selection`, method: 'POST', body: payload }),
    }),
    deleteSearchHistoryItem: builder.mutation({
      query: ({ type, id }) => ({ url: `/user/search/history/${type}/${id}`, method: 'DELETE' }),
    }),
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/user/notifications`,
        params: { page, limit },
      })
    }),
    removeFollower: builder.mutation({
      query: (username) => ({ url: `/user/follows/${username}/remove-follower`, method: 'DELETE' }),
      async onQueryStarted(username, { dispatch, queryFulfilled, getState }) {
        const currentUsername = getState().auth?.user?.username;
        
        // Update follower count của current user (người bị xóa follower)
        const patchMyStats = dispatch(
          profileApi.util.updateQueryData('getFollowStats', currentUsername, (draft) => {
            if (draft?.stats?.followerCount !== undefined) {
              draft.stats.followerCount = Math.max(0, (draft.stats.followerCount || 0) - 1);
            }
          })
        );
        
        // Update following count của target user (người bị xóa khỏi followers)
        const patchTargetStats = dispatch(
          profileApi.util.updateQueryData('getFollowStats', username, (draft) => {
            if (draft?.stats?.followingCount !== undefined) {
              draft.stats.followingCount = Math.max(0, (draft.stats.followingCount || 0) - 1);
            }
          })
        );
        
        // Remove khỏi danh sách followers của current user
        const patchMyFollowers = dispatch(
          profileApi.util.updateQueryData('getFollowers', currentUsername, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const index = draft.users.findIndex(u => u.username === username);
              if (index !== -1) {
                draft.users.splice(index, 1);
                if (draft.totalCount !== undefined) {
                  draft.totalCount = Math.max(0, draft.totalCount - 1);
                }
              }
            }
          })
        );
        
        // Remove khỏi danh sách followings của target user
        const patchTargetFollowings = dispatch(
          profileApi.util.updateQueryData('getFollowings', username, (draft) => {
            if (draft?.users && Array.isArray(draft.users)) {
              const index = draft.users.findIndex(u => u.username === currentUsername);
              if (index !== -1) {
                draft.users.splice(index, 1);
                if (draft.totalCount !== undefined) {
                  draft.totalCount = Math.max(0, draft.totalCount - 1);
                }
              }
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchMyStats.undo();
          patchTargetStats.undo();
          patchMyFollowers.undo();
          patchTargetFollowings.undo();
        }
      },
      invalidatesTags: (result, error, username) => [
        { type: 'User', id: `follow-stats-${username}` },
        { type: 'User', id: `followers-${username}` },
        { type: 'User', id: `followings-${username}` },
        'User',
      ],
    }),
  })
});

export const {
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  useGetNotificationsQuery,
  useGetFollowStatsQuery,
  useLazySearchUsersQuery,
  useGetPublicProfileQuery,
  useGetFollowStatusQuery,
  useGetFollowersQuery,
  useGetFollowingsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCancelFollowRequestMutation,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useRecordSearchSelectionMutation,
  useDeleteSearchHistoryItemMutation,
  useRemoveFollowerMutation
} = profileApi;