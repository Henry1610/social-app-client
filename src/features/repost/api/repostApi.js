import { baseApi } from '../../../services/api';

export const repostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Repost một bài viết
    repostPost: builder.mutation({
      query: ({ postId, content = '' }) => ({
        url: `/user/reposts/${postId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Repost' },
      ],
    }),

    // Hủy repost
    undoRepost: builder.mutation({
      query: (postId) => ({
        url: `/user/reposts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Repost' },
      ],
    }),

    // Lấy danh sách reposts của một user (có thể là mình hoặc người khác)
    getUserReposts: builder.query({
      query: ({ username } = {}) => ({
        url: `/user/${username}/reposts`,
      }),
      providesTags: ['Repost'],
    }),

    // Lấy repost theo ID với post gốc
    getRepostById: builder.query({
      query: (repostId) => ({
        url: `/user/reposts/${repostId}`,
      }),
      providesTags: (result, error, repostId) => [
        { type: 'Repost', id: repostId },
      ],
    }),

    // Đánh dấu repost đã xem
    markRepostAsViewed: builder.mutation({
      query: (repostId) => ({
        url: `/user/reposts/${repostId}/view`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRepostPostMutation,
  useUndoRepostMutation,
  useGetUserRepostsQuery,
  useGetRepostByIdQuery,
  useMarkRepostAsViewedMutation,
} = repostApi;

