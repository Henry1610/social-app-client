import { baseApi } from '../../../services/api';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query({
      query: (q) => ({ url: `/user/search`, params: { q } }),
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
  })
});

export const {
  useLazySearchUsersQuery,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useRecordSearchSelectionMutation,
  useDeleteSearchHistoryItemMutation,
} = searchApi;

