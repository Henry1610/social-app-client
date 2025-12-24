import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatLogic } from "./hooks/useChatLogic";
import MessageItem from "./components/MessageItem";
import ReplyPreview from "./components/ReplyPreview";
import MessageInput from "./components/MessageInput";
import EditHistoryModal from "./components/EditHistoryModal";
import AddMemberModal from "./components/AddMemberModal";
import PinnedMessagesBar from "./components/PinnedMessagesBar";
import ConversationMembersModal from "./components/ConversationMembersModal";
import ChatProfileCard from "./components/ChatProfileCard";
import ChatHeader from "./components/ChatHeader";
import TypingIndicator from "./components/TypingIndicator";
import DateSeparator from "./components/DateSeparator";
import SystemMessage from "./components/SystemMessage";
import EmptyMessagesState from "./components/EmptyMessagesState";
import {
  MessageSkeleton,
  ChatHeaderSkeleton,
  UserProfileCardSkeleton,
  MessageInputSkeleton,
} from "../../components/common/skeletons";

const ChatMain = ({ onStartNewMessage }) => {
  const { username, conversationId } = useParams();
  const navigate = useNavigate();
  
  // Sử dụng useChatLogic hook để lấy tất cả logic
  const {
    // State
    message,
    setMessage,
    typingUsers,
    showMessageMenu,
    editingMessage,
    editContent,
    setEditContent,
    showEditHistory,
    replyingTo,
    setReplyingTo,
    showAddMemberModal,
    setShowAddMemberModal,
    showMembersModal,
    setShowMembersModal,
    selectedMedia,
    setSelectedMedia,
    messagesEndRef,
    messageRefs,
    isEditing,
    pinnedMessagesExpanded,
    setPinnedMessagesExpanded,
    editHistoryData,
    
    // Data
    selectedConversation,
    displayUserInfo,
    displayIsLoading,
    messages,
    isLoadingMessages,
    conversationUserInfo,
    userInfo,
    canMessage,
    pinnedMessages,
    currentUserId,
    isGroupAdmin,
    
    // Functions
    handleTyping,
    handleSendMessage,
    handleKeyPress,
    handleMessageMenuClick,
    handleMenuAction,
    handleSaveEdit,
    handleCancelEdit,
    handleEditKeyPress,
    handleShowEditHistory,
    scrollToMessage,
    handleRecallMessage,
    handlePinMessage,
    handleReactMessage,
    handleLeaveGroup,
    handleRemoveMember,
      isLastMessageInConversation,
    canEditMessage,
    getMessageStatusIconWrapper,
  } = useChatLogic({ conversationId, username });

  // Hiển thị loading state
  if (displayIsLoading) {
    return (
      <div className="flex flex-col h-full bg-white text-gray-900">
        <ChatHeaderSkeleton />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center justify-start pt-8">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <UserProfileCardSkeleton />
            </div>
          </div>
        </div>
        <MessageInputSkeleton />
      </div>
    );
  }

  // Hiển thị chat interface với username
  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Chat Header */}
      <ChatHeader
        selectedConversation={selectedConversation}
        displayUserInfo={displayUserInfo}
        username={username}
        onViewMembers={() => setShowMembersModal(true)}
        onAddMember={() => setShowAddMemberModal(true)}
        onLeaveGroup={handleLeaveGroup}
      />

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Messages Bar */}
        {selectedConversation && (
          <PinnedMessagesBar
            pinnedMessages={pinnedMessages}
            isExpanded={pinnedMessagesExpanded}
            onToggle={() => setPinnedMessagesExpanded(!pinnedMessagesExpanded)}
            onMessageClick={scrollToMessage}
          />
        )}
        <div className="flex flex-col h-full">
          {/* User Profile Card - Luôn hiển thị */}
          <ChatProfileCard
            userInfo={displayUserInfo?.user || conversationUserInfo}
            conversationType={selectedConversation?.type}
            members={selectedConversation?.members || []}
            conversationName={selectedConversation?.name || ''}
            onViewProfile={() => {
              const targetUsername = conversationUserInfo?.username || userInfo?.username;
              if (targetUsername) {
                navigate(`/${targetUsername}`);
              }
            }}
            onViewMembers={() => setShowMembersModal(true)}
          />

          {/* Messages Area - Chiếm phần còn lại và sát mép dưới */}
          <div className="flex-1 flex flex-col justify-end px-4">
            {selectedConversation && (
              <div className="w-full">
                {isLoadingMessages ? (
                  <MessageSkeleton count={3} />
                ) : messages.length > 0 ? (
                  // Hiển thị danh sách tin nhắn với UI đẹp hơn
                  <div className="space-y-1 pb-4">
                    {messages.map((msg, index) => {
                      
                      const isOwnMessage = msg.senderId === currentUserId;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1]?.senderId !== msg.senderId;

                      const currentDate = new Date(
                        msg.createdAt
                      ).toDateString();
                      const prevDate =
                        index > 0
                          ? new Date(
                              messages[index - 1]?.createdAt
                            ).toDateString()
                          : null;
                      const showDateSeparator =
                        index === 0 || currentDate !== prevDate;

                      return (
                        <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)}>
                          {/* Date Separator */}
                          {showDateSeparator && <DateSeparator date={msg.createdAt} />}

                          {/* System Message */}
                          {msg.isSystem ? (
                            <SystemMessage content={msg.content} />
                          ) : (
                            <MessageItem
                            message={msg}
                            isOwnMessage={isOwnMessage}
                            showAvatar={showAvatar}
                            currentUserId={currentUserId}
                            isLastMessageInConversation={isLastMessageInConversation}
                            canEditMessage={canEditMessage}
                            onMenuAction={handleMenuAction}
                            onShowEditHistory={handleShowEditHistory}
                            onMessageMenuClick={handleMessageMenuClick}
                            showMessageMenu={showMessageMenu}
                            editingMessage={editingMessage}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            onEditKeyPress={handleEditKeyPress}
                            isEditing={isEditing}
                            getMessageStatusIcon={getMessageStatusIconWrapper}
                            onScrollToMessage={scrollToMessage}
                            onRecallMessage={handleRecallMessage}
                            onPinMessage={handlePinMessage}
                            onReactMessage={handleReactMessage}
                          />
                          )}
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    <TypingIndicator typingUsers={typingUsers} />

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <EmptyMessagesState />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Preview */}
      <ReplyPreview 
        replyingTo={replyingTo} 
        onCancelReply={() => setReplyingTo(null)} 
      />

      {/* Message Input */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        onTyping={handleTyping}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        selectedConversation={selectedConversation}
        selectedMedia={selectedMedia}
        onMediaSelect={setSelectedMedia}
        canMessage={canMessage}
      />


      {/* Edit History Modal */}
      <EditHistoryModal
        showEditHistory={showEditHistory}
        onClose={() => {
          const messageId = showEditHistory;
          handleShowEditHistory(messageId);
        }}
        editHistoryData={editHistoryData}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        conversationId={selectedConversation?.id}
        currentMembers={selectedConversation?.members || []}
        onMemberAdded={(newMembers) => {
          
          // TODO: Cập nhật danh sách thành viên và refetch conversation
        }}
      />

      <ConversationMembersModal
        isOpen={showMembersModal}
        members={selectedConversation?.members || []}
        isAdmin={isGroupAdmin}
        currentUserId={currentUserId}
        onClose={() => setShowMembersModal(false)}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
};

export default ChatMain;
