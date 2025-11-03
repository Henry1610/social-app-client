import { baseApi } from '../../services/api';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo bài viết mới
    createPost: builder.mutation({
      query: (data) => ({
        url: '/user/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),

    // Upload media cho post
    uploadPostMedia: builder.mutation({
      query: (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        return {
          url: '/user/posts/upload-media',
          method: 'POST',
          body: formData,
        };
      },
    }),

    // Lấy tất cả bài viết của mình
    getMyPosts: builder.query({
      query: () => '/user/posts',
      providesTags: ['Post'],
    }),

    // Lấy bài viết theo ID
    getPostById: builder.query({
      query: (postId) => `/user/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    // Cập nhật bài viết
    updatePost: builder.mutation({
      query: ({ postId, ...data }) => ({
        url: `/user/posts/${postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Post', { type: 'Post', id: 'LIST' }, { type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useUploadPostMediaMutation,
  useGetMyPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
} = postApi;

