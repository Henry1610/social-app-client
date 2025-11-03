import { baseApi } from '../../services/api';

export const reactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrUpdateReaction: builder.mutation({
      query: ({ targetId, targetType, type }) => ({
        url: '/user/reactions',
        method: 'POST',
        body: { targetId, targetType, type },
      }),
      invalidatesTags: (result, error, { targetId, targetType }) => [
        { type: 'Post', id: targetType === 'POST' ? targetId : undefined },
        { type: 'Comment', id: targetType === 'COMMENT' ? targetId : undefined },
        { type: 'Post', id: 'LIST' },
        { type: 'Reaction', id: `${targetType}_${targetId}_me` },
        { type: 'Reaction', id: `${targetType}_${targetId}` },
        { type: 'Reaction', id: `${targetType}_${targetId}_summary` },
      ],
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

    getReactionSummary: builder.query({
      query: ({ targetId, targetType }) => ({
        url: '/user/reactions/summary',
        params: { targetId, targetType },
      }),
      providesTags: (result, error, { targetId, targetType }) => [
        { type: 'Reaction', id: `${targetType}_${targetId}_summary` },
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
  useGetReactionSummaryQuery,
  useGetMyReactionQuery,
} = reactionApi;

