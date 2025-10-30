import { baseApi } from '../../services/api';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== CONVERSATION ENDPOINTS =====
    
    // Lấy danh sách cuộc trò chuyện
    getConversations: builder.query({
      query: () => '/user/chat/conversations',
      providesTags: ['Conversation']
    }),
    
    // Lấy thông tin cuộc trò chuyện
    getConversation: builder.query({
      query: (conversationId) => `/user/chat/conversations/${conversationId}`,
      providesTags: (result, error, conversationId) => [
        { type: 'Conversation', id: conversationId }
      ]
    }),
    
    // Tạo cuộc trò chuyện mới (hoặc lấy conversation đã tồn tại)
    createConversation: builder.mutation({
      query: (data) => ({
        url: '/user/chat/conversations',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Conversation']
    }),
    //------------------------------------------------------------------------------------------------------------------------------------------------
    // Lấy thành viên cuộc trò chuyện
    getConversationMembers: builder.query({
      query: (conversationId) => `/user/chat/conversations/${conversationId}/members`,
      providesTags: (result, error, conversationId) => [
        { type: 'ConversationMembers', id: conversationId }
      ]
    }),
    
    // Thêm thành viên
    addMember: builder.mutation({
      query: ({ conversationId, userId }) => ({
        url: `/user/chat/conversations/${conversationId}/members`,
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
        url: `/user/chat/conversations/${conversationId}/members/${userId}`,
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
        `/user/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      providesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId }
      ]
    }),
    
    // Gửi tin nhắn
    sendMessage: builder.mutation({
      query: ({ conversationId, content, type = 'TEXT' }) => ({
        url: `/user/chat/messages`,
        method: 'POST',
        body: { conversationId, content, type }
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation'
      ]
    }),
    
    
    // Xóa tin nhắn
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/user/chat/messages/${messageId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    

    // ===== MESSAGE REACTIONS =====
    
    // Thêm/xóa phản ứng tin nhắn
    toggleMessageReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: `/user/chat/messages/${messageId}/reactions`,
        method: 'POST',
        body: { emoji }
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Lấy phản ứng của tin nhắn
    getMessageReactions: builder.query({
      query: (messageId) => `/user/chat/messages/${messageId}/reactions`,
      providesTags: (result, error, messageId) => [
        { type: 'MessageReactions', id: messageId }
      ]
    }),

    // ===== PINNED MESSAGES =====
    
    // Ghim/bỏ ghim tin nhắn
    togglePinMessage: builder.mutation({
      query: (messageId) => ({
        url: `/user/chat/messages/${messageId}/pin`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: 'Message', id: messageId }
      ]
    }),
    
    // Lấy tin nhắn đã ghim
    getPinnedMessages: builder.query({
      query: (conversationId) => `/user/chat/conversations/${conversationId}/pinned`,
      providesTags: (result, error, conversationId) => [
        { type: 'PinnedMessages', id: conversationId }
      ]
    }),


    // ===== MESSAGE EDIT HISTORY =====
    
    // Lấy lịch sử chỉnh sửa tin nhắn
    getMessageEditHistory: builder.query({
      query: (messageId) => `/user/chat/messages/${messageId}/edit-history`,
      providesTags: (result, error, messageId) => [
        { type: 'MessageEditHistory', id: messageId }
      ]
    }),

    // Upload media for chat
    uploadChatMedia: builder.mutation({
      query: ({ conversationId, files }) => {
        const formData = new FormData()
        formData.append('conversationId', conversationId)
        files.forEach(f => formData.append('files', f))
        return {
          url: `/user/chat/uploads`,
          method: 'POST',
          body: formData
        }
      }
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
  useDeleteMessageMutation
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

export const {
  useUploadChatMediaMutation
} = chatApi;
