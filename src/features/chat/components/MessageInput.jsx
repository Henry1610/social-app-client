import React, { useRef } from "react";
import { Send, Smile, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

const MessageInput = ({
  message,
  setMessage,
  onTyping,
  onKeyPress,
  onSendMessage,
  replyingTo,
  selectedConversation,
  selectedMedia,
  onMediaSelect,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error('Chỉ chấp nhận hình ảnh hoặc video');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        onMediaSelect(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: reader.result,
          type: isImage ? 'IMAGE' : 'VIDEO',
          mediaType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const handleRemoveMedia = (mediaId) => {
    onMediaSelect(prev => prev.filter(m => m.id !== mediaId));
  };

  return (
    <div className="p-4 border-gray-200 bg-white">
      {/* Media preview */}
      {selectedMedia && selectedMedia.length > 0 && (
        <div className="mb-3 overflow-x-auto pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-20 h-20 bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Paperclip className="w-6 h-6 text-gray-600" />
            </button>
            {selectedMedia.map((media) => (
              <div key={media.id} className="relative flex-shrink-0">
                <button
                  onClick={() => handleRemoveMedia(media.id)}
                  className="absolute top-[-10px] right-[-10px] bg-gray-700 text-white rounded-full p-1 hover:bg-gray-800 transition-colors z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {media.type === 'IMAGE' ? (
                  <img 
                    src={media.preview} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <video 
                    src={media.preview} 
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* Attachment button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Message input */}
        <div className="flex-1 relative border rounded-full">
          <input
            type="text"
            placeholder={replyingTo ? "Nhập tin nhắn trả lời..." : "Nhập tin nhắn..."}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyPress={onKeyPress}
            className="w-full py-2 px-4 pr-12 rounded-full text-gray-900 focus:outline-none focus:bg-white transition-colors"
            disabled={!selectedConversation}
          />

          {/* Emoji button */}
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={onSendMessage}
          className={`p-2 rounded-full text-white transition-colors ${
            (message.trim() || selectedMedia.length > 0) && selectedConversation
              ? "bg-primary-btn hover:bg-primary-btn-hover"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={(!message.trim() && selectedMedia.length === 0) || !selectedConversation}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
