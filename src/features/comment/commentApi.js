import { baseApi } from '../../services/api';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `/user/comments/posts/${postId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: postId },
        { type: 'Post', id: 'LIST' },
        { type: 'User', id: 'LIST' },
      ],
    }),
    
    getCommentsByPost: builder.query({
      query: ({ postId, page = 1, limit = 20, sortBy = 'desc' }) => {
        const url = `/user/comments/posts/${Number(postId)}`;
        return {
          url,
          params: { page, limit, sortBy },
        };
      },
      providesTags: (result, error, { postId }) => [
        { type: 'Comment', id: postId },
      ],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByPostQuery,
} = commentApi;

