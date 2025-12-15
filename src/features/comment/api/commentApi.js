import { baseApi } from '../../../services/api';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: ({ postId, repostId, content }) => {
        if (repostId) {
          return {
            url: `/user/comments/reposts/${repostId}`,
            method: 'POST',
            body: { content },
          };
        }
        return {
          url: `/user/comments/posts/${postId}`,
          method: 'POST',
          body: { content },
        };
      },
      invalidatesTags: (result, error, { postId, repostId }) => [
        { type: 'Comment', id: postId || repostId },
      ],
    }),
    
    getCommentsByPost: builder.query({
      query: ({ postId, repostId, page = 1, limit = 20, sortBy = 'desc' }) => {
        if (repostId) {
          const url = `/user/comments/reposts/${Number(repostId)}`;
          return {
            url,
            params: { page, limit, sortBy },
          };
        }
        const url = `/user/comments/posts/${Number(postId)}`;
        return {
          url,
          params: { page, limit, sortBy },
        };
      },
      providesTags: (result, error, { postId, repostId }) => [
        { type: 'Comment', id: postId || repostId },
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ commentId, postId, repostId }) => {
        if (repostId) {
          return {
            url: `/user/comments/reposts/${commentId}`,
            method: 'DELETE',
          };
        }
        return {
          url: `/user/comments/posts/${commentId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { postId, repostId }) => [
        { type: 'Comment', id: postId || repostId },
      ],
    }),

    replyComment: builder.mutation({
      query: ({ commentId, content }) => ({
        url: `/user/comments/${commentId}/reply`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { commentId, postId, repostId }) => {
        const tags = [{ type: 'Reply', id: commentId }];
        if (postId || repostId) {
          tags.push({ type: 'Comment', id: postId || repostId });
        }
        return tags;
      },
    }),

    getRepliesByComment: builder.query({
      query: ({ commentId, page = 1, limit = 20, sortBy = 'desc' }) => ({
        url: `/user/comments/${commentId}/replies`,
        params: { page, limit, sortBy },
      }),
      providesTags: (result, error, { commentId }) => [
        { type: 'Reply', id: commentId },
      ],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
  useDeleteCommentMutation,
  useReplyCommentMutation,
  useGetRepliesByCommentQuery,
} = commentApi;

