import { baseApi } from '../../../services/api';

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

    // Xóa bài viết
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/user/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', { type: 'Post', id: 'LIST' }, { type: 'User', id: 'LIST' }],
    }),

    // Đánh dấu bài viết đã xem
    markPostAsViewed: builder.mutation({
      query: (postId) => ({
        url: `/user/posts/${postId}/view`,
        method: 'POST',
      }),
    }),

    // Lấy feed posts (từ users đang follow + chính mình)
    getFeedPosts: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/user/posts/feed',
        params: { page, limit },
      }),
      providesTags: ['Post'],
    }),

    // Lưu bài viết
    savePost: builder.mutation({
      query: (postId) => ({
        url: `/user/posts/${postId}/save`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
      ],
    }),

    // Bỏ lưu bài viết
    unsavePost: builder.mutation({
      query: (postId) => ({
        url: `/user/posts/${postId}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
      ],
    }),

    // Lấy danh sách bài viết đã lưu
    getSavedPosts: builder.query({
      query: ({ username, page = 1, limit = 20 } = {}) => ({
        url: `/user/${username}/saved-posts`,
        params: { page, limit },
      }),
      providesTags: ['Post'],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useUploadPostMediaMutation,
  useGetMyPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useMarkPostAsViewedMutation,
  useGetFeedPostsQuery,
  useSavePostMutation,
  useUnsavePostMutation,
  useGetSavedPostsQuery,
} = postApi;

