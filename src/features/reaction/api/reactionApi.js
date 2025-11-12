import { baseApi } from '../../../services/api';

export const reactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrUpdateReaction: builder.mutation({
      query: ({ targetId, targetType, type }) => ({
        url: '/user/reactions',
        method: 'POST',
        body: { targetId, targetType, type },
      }),
      invalidatesTags: (result, error, { targetId, targetType }) => {
        const tags = [
          { type: 'Reaction', id: `${targetType}_${targetId}_me` },
          { type: 'Reaction', id: `${targetType}_${targetId}` },
        ];
        
        // Chỉ invalidate Post tag khi targetType là POST và có targetId
        if (targetType === 'POST' && targetId) {
          tags.push({ type: 'Post', id: targetId });
        }
        
        // Chỉ invalidate Comment tag khi targetType là COMMENT và có targetId
        if (targetType === 'COMMENT' && targetId) {
          tags.push({ type: 'Comment', id: targetId });
        }
        
        return tags;
      },
    }),

    getReactions: builder.query({
      query: ({ targetId, targetType }) => ({
        url: '/user/reactions',
        params: { targetId, targetType },
      }),
      providesTags: (result, error, { targetId, targetType }) => [
        { type: 'Reaction', id: `${targetType}_${targetId}` },
      ],
    }),

    getMyReaction: builder.query({
      query: ({ targetId, targetType }) => ({
        url: '/user/reactions/me',
        params: { targetId, targetType },
      }),
      providesTags: (result, error, { targetId, targetType }) => [
        { type: 'Reaction', id: `${targetType}_${targetId}_me` },
      ],
    }),
  }),
});

export const {
  useCreateOrUpdateReactionMutation,
  useGetReactionsQuery,
  useGetMyReactionQuery,
} = reactionApi;

