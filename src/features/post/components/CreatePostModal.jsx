import React, { useState, useRef, useEffect } from "react";
import { X, Image, Play, ChevronLeft, ChevronRight, Plus, Maximize2, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useCreatePostMutation, useUploadPostMediaMutation } from "../postApi";

const CreatePostModal = ({ isOpen, onClose }) => {
  const aspectRatioMenuRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [content, setContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [whoCanSee, setWhoCanSee] = useState("everyone");
  const [whoCanComment, setWhoCanComment] = useState("everyone");
  const [showAspectRatioMenu, setShowAspectRatioMenu] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("original"); // original, 1:1, 4:5, 16:9
  const fileInputRef = useRef(null);
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [uploadPostMedia] = useUploadPostMediaMutation();

  // Đóng menu aspect ratio khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aspectRatioMenuRef.current && !aspectRatioMenuRef.current.contains(event.target)) {
        setShowAspectRatioMenu(false);
      }
    };

    if (showAspectRatioMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAspectRatioMenu]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    const newFiles = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const newFiles = prev.filter((f) => f.id !== fileId);
      if (currentIndex >= newFiles.length && newFiles.length > 0) {
        setCurrentIndex(newFiles.length - 1);
      }
      return newFiles;
    });
  };

  const handleNext = () => {
    if (selectedFiles.length > 0) {
      setShowCaption(true);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error("Bài viết phải có nội dung hoặc media!");
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrls = [];

      // Upload media nếu có
      if (selectedFiles.length > 0) {
        const files = selectedFiles.map((f) => f.file);
        const uploadResult = await uploadPostMedia(files).unwrap();
        mediaUrls = uploadResult.data.files.map((f) => ({
          url: f.url,
          type: f.type,
        }));
      }

      // Tạo post
      await createPost({
        content: content.trim() || undefined,
        mediaUrls,
        hashtags: [],
        mentions: [],
        privacySettings: {
          whoCanSee,
          whoCanComment,
        },
      }).unwrap();

      toast.success("Tạo bài viết thành công!");
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error?.data?.message || "Tạo bài viết thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setContent("");
    setIsDragging(false);
    setShowCaption(false);
    setCurrentIndex(0);
    setWhoCanSee("everyone");
    setWhoCanComment("everyone");
    setAspectRatio("original");
    setShowAspectRatioMenu(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div 
        className="bg-white rounded-xl w-full mx-4 relative overflow-hidden flex flex-col shadow-2xl" 
        style={{ 
          maxWidth: showCaption ? '900px' : '600px',
          height: '90vh',
          maxHeight: '800px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={handleClose}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-base font-semibold absolute left-1/2 transform -translate-x-1/2">
            {showCaption ? "Tạo bài viết mới" : "Cắt"}
          </h2>
          <button
            onClick={showCaption ? handleSubmit : handleNext}
            disabled={(showCaption && (isUploading || isCreating || (!content.trim() && selectedFiles.length === 0))) || (!showCaption && selectedFiles.length === 0)}
            className="text-blue-500 font-semibold hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {(isUploading || isCreating) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {showCaption ? "Chia sẻ" : "Tiếp"}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {selectedFiles.length === 0 ? (
            // Empty state - Upload area
            <div className="flex-1 flex items-center justify-center p-8">
              <div
                className={`w-full h-full flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-lg transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="w-24 h-24 text-gray-900" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-xl font-light text-gray-900">
                    Kéo ảnh và video vào đây
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Chọn từ máy tính
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            // Has files - Show preview
            <>
              {/* Main preview area */}
              <div className={`bg-black relative flex items-center justify-center ${showCaption ? 'flex-1' : 'w-full'}`}>
                {/* Current media */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div
                    className="relative flex items-center justify-center overflow-hidden"
                    style={{
                      aspectRatio:
                        aspectRatio === "1:1" ? "1 / 1" :
                        aspectRatio === "4:5" ? "4 / 5" :
                        aspectRatio === "16:9" ? "16 / 9" :
                        "auto",
                      maxWidth: aspectRatio !== "original" ? "100%" : "auto",
                      maxHeight: aspectRatio !== "original" ? "100%" : "auto",
                      width: aspectRatio !== "original" ? "100%" : "auto",
                      height: aspectRatio !== "original" ? "auto" : "auto",
                    }}
                  >
                    {selectedFiles[currentIndex]?.type === "image" ? (
                      <img
                        src={selectedFiles[currentIndex].preview}
                        alt="Preview"
                        className={aspectRatio !== "original" ? "w-full h-full object-cover" : "max-w-full max-h-full object-contain"}
                      />
                    ) : (
                      <video
                        src={selectedFiles[currentIndex]?.preview}
                        className={aspectRatio !== "original" ? "w-full h-full object-cover" : "max-w-full max-h-full object-contain"}
                        controls
                      />
                    )}
                  </div>
                </div>

                {/* Navigation arrows */}
                {selectedFiles.length > 1 && (
                  <>
                    {currentIndex > 0 && (
                      <button
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                      </button>
                    )}
                    {currentIndex < selectedFiles.length - 1 && (
                      <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-900" />
                      </button>
                    )}
                  </>
                )}

                {/* Aspect Ratio button */}
                <div ref={aspectRatioMenuRef} className="absolute bottom-4 left-4 z-10">
                  <button
                    onClick={() => setShowAspectRatioMenu(!showAspectRatioMenu)}
                    className="w-8 h-8 bg-gray-900 bg-opacity-75 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  
                  {/* Aspect Ratio Menu */}
                  {showAspectRatioMenu && (
                    <div className="absolute bottom-10 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[160px] z-50">
                      <div className="text-xs text-gray-500 px-2 py-1 mb-1">Tỉ lệ khung hình</div>
                      {[
                        { value: "original", label: "Gốc" },
                        { value: "1:1", label: "1:1 (Vuông)" },
                        { value: "4:5", label: "4:5 (Dọc)" },
                        { value: "16:9", label: "16:9 (Ngang)" },
                      ].map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => {
                            setAspectRatio(ratio.value);
                            setShowAspectRatioMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                            aspectRatio === ratio.value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnails strip - Hiển thị khi có file */}
                {selectedFiles.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-60 px-2 py-2 rounded-lg max-w-[80%] overflow-x-auto z-20">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={file.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`relative cursor-pointer transition-all flex-shrink-0 ${
                          currentIndex === index 
                            ? 'ring-2 ring-white scale-105' 
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {file.type === "image" ? (
                          <img
                            src={file.preview}
                            alt="Thumbnail"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center relative">
                            <video
                              src={file.preview}
                              className="w-full h-full object-cover rounded"
                            />
                            <Play className="absolute w-4 h-4 text-white" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(file.id);
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-black bg-opacity-90 text-white rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all z-30"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add more button - Luôn hiển thị */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 border border-dashed border-white border-opacity-60 rounded flex items-center justify-center hover:border-opacity-100 hover:bg-white hover:bg-opacity-10 transition-all flex-shrink-0"
                      title="Thêm ảnh/video"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Caption sidebar (when showCaption is true) */}
              {showCaption && (
                <div className="w-80 border-l border-gray-200 flex flex-col bg-white flex-shrink-0">
                  <div className="p-4 flex-1 overflow-y-auto">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Viết chú thích..."
                      className="w-full h-32 resize-none focus:outline-none text-sm"
                      maxLength={2200}
                      autoFocus
                    />
                    <div className="text-xs text-gray-400 text-right mt-1">
                      {content.length}/2,200
                    </div>
                  </div>
                  
                  {/* Privacy Settings */}
                  <div className="p-4 border-t border-gray-200 space-y-3">
                    {/* Who can see */}
                      <div>
                      <p className="text-xs text-gray-500 mb-1.5">Ai có thể xem?</p>
                      <div className="relative">
                        <select
                          value={whoCanSee}
                          onChange={(e) => setWhoCanSee(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer pr-8"
                        >
                          <option value="everyone">Công khai - Mọi người có thể xem</option>
                          <option value="followers">Người theo dõi - Chỉ người theo dõi bạn</option>
                          <option value="nobody">Riêng tư - Chỉ bạn mới thấy</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    {/* Who can comment */}
                      <div>
                      <p className="text-xs text-gray-500 mb-1.5">Ai có thể bình luận?</p>
                      <div className="relative">
                        <select
                          value={whoCanComment}
                          onChange={(e) => setWhoCanComment(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer pr-8"
                        >
                          <option value="everyone">Mọi người - Ai cũng có thể bình luận</option>
                          <option value="followers">Người theo dõi - Chỉ người theo dõi bạn</option>
                          <option value="nobody">Tắt - Không ai có thể bình luận</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;