import { api } from '../../services/api';

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== CONVERSATION ENDPOINTS =====
    
    // Lấy danh sách cuộc trò chuyện
    getConversations: builder.query({
      query: () => '/chat/conversations',
      providesTags: ['Conversation']
    }),
    
    // Lấy thông tin cuộc trò chuyện
    getConversation: builder.query({
      query: (conversationId) => `/chat/conversations/${conversationId}`,
      providesTags: (result, error, conversationId) => [
        { type: 'Conversation', id: conversationId }
      ]
    }),
    
    // Tạo cuộc trò chuyện mới
    createConversation: builder.mutation({
      query: (data) => ({
        url: '/chat/conversations',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Conversation']
    }),
    //------------------------------------------------------------------------------------------------------------------------------------------------
    // Lấy thành viên cuộc trò chuyện
    getConversationMembers: builder.query({
      query: (conversationId) => `/chat/conversations/${conversationId}/members`,
      providesTags: (result, error, conversationId) => [
        { type: 'ConversationMembers', id: conversationId }
      ]
    }),
    
    // Thêm thành viên
    addMember: builder.mutation({
      query: ({ conversationId, userId }) => ({
        url: `/chat/conversations/${conversationId}/members`,
        method: 'POST',
        body: { userId }
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'ConversationMembers', id: conversationId },
        'Conversation'
      ]
    }),
    
    // Xóa thành viên
    removeMember: builder.mutation({
      query: ({ conversationId, userId }) => ({
        url: `/chat/conversations/${conversationId}/members/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'ConversationMembers', id: conversationId },
        'Conversation'
      ]
    }),

    // ===== MESSAGE ENDPOINTS =====
    
    // Lấy tin nhắn trong cuộc trò chuyện
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }) => 
        `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      providesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId }
      ]
    }),
    
    // Gửi tin nhắn
    sendMessage: builder.mutation({
      query: ({ conversationId, content, type = 'text' }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { content, type }
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation'
      ]
    }),
    
    // Chỉnh sửa tin nhắn
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: `/chat/messages/${messageId}`,
        method: 'PUT',
        body: { content }
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Xóa tin nhắn
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Đánh dấu tin nhắn đã đọc
    markMessageAsRead: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}/read`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Đánh dấu cuộc trò chuyện đã đọc
    markConversationAsRead: builder.mutation({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Message', id: conversationId },
        'Conversation'
      ]
    }),

    // ===== MESSAGE REACTIONS =====
    
    // Thêm/xóa phản ứng tin nhắn
    toggleMessageReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: `/chat/messages/${messageId}/reactions`,
        method: 'POST',
        body: { emoji }
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Lấy phản ứng của tin nhắn
    getMessageReactions: builder.query({
      query: (messageId) => `/chat/messages/${messageId}/reactions`,
      providesTags: (result, error, messageId) => [
        { type: 'MessageReactions', id: messageId }
      ]
    }),

    // ===== PINNED MESSAGES =====
    
    // Ghim/bỏ ghim tin nhắn
    togglePinMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}/pin`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Lấy tin nhắn đã ghim
    getPinnedMessages: builder.query({
      query: (conversationId) => `/chat/conversations/${conversationId}/pinned`,
      providesTags: (result, error, conversationId) => [
        { type: 'PinnedMessages', id: conversationId }
      ]
    }),

    // ===== MESSAGE EDIT HISTORY =====
    
    // Lấy lịch sử chỉnh sửa tin nhắn
    getMessageEditHistory: builder.query({
      query: (messageId) => `/chat/messages/${messageId}/edit-history`,
      providesTags: (result, error, messageId) => [
        { type: 'MessageEditHistory', id: messageId }
      ]
    })
  })
});

// ===== EXPORT HOOKS =====

// Conversation hooks
export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useGetConversationMembersQuery,
  useAddMemberMutation,
  useRemoveMemberMutation
} = chatApi;

// Message hooks
export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useMarkMessageAsReadMutation,
  useMarkConversationAsReadMutation
} = chatApi;

// Reaction hooks
export const {
  useToggleMessageReactionMutation,
  useGetMessageReactionsQuery
} = chatApi;

// Pinned message hooks
export const {
  useTogglePinMessageMutation,
  useGetPinnedMessagesQuery
} = chatApi;

// Edit history hooks
export const {
  useGetMessageEditHistoryQuery
} = chatApi;
