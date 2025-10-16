import { useState } from "react";
import { Maximize, X } from "lucide-react";

const FloatingDirectMessage = ({ avatarUrl, label = "Tin nhắn" }) => {
  const [open, setOpen] = useState(false);

  const messages = [
    { name: "finn", message: "Tx hà b", time: "4 tuần", avatar: "https://i.pravatar.cc/100?img=1" },
    { name: "T.Đạt3110", message: "Isao", time: "6 tuần", avatar: "https://i.pravatar.cc/100?img=2" },
    { name: "Kiểm tra iQ của bạn", message: "Chào bạn ạ! Tôi đây để giúp bạn...", time: "8 tuần", avatar: "https://i.pravatar.cc/100?img=3" },
    { name: "Thúc Nguyên", message: "hâhha", time: "9 tuần", avatar: "https://i.pravatar.cc/100?img=4" },
    { name: "Bảo Trân", message: "Nhớ nha m:))", time: "12 tuần", avatar: "https://i.pravatar.cc/100?img=5" },
    { name: "n2uynh_xx", message: "Tui nể si mới v mà sợ gì", time: "19 tuần", avatar: "https://i.pravatar.cc/100?img=6" },
    { name: "Minh Khôi", message: "Ok nha bro", time: "20 tuần", avatar: "https://i.pravatar.cc/100?img=7" },
  ];

  return (
    <div className="fixed bottom-10 right-10 z-50">
      {/* Nút mở khung chat */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-64 px-6 py-4 bg-white border border-gray-100 shadow-xl rounded-full hover:shadow-2xl transition-all duration-200 focus:outline-none"
      >
        {/* Icon + Label */}
        <div className="flex items-center gap-2">
          <svg
            aria-label="Tin nhắn trực tiếp"
            fill="currentColor"
            height={24}
            width={24}
            viewBox="0 0 24 24"
            className="text-gray-800"
          >
            <path
              d="M12.003 2.001a9.705 9.705 0 1 1 0 19.4 10.876 10.876 0 0 1-2.895-.384.798.798 0 0 0-.533.04l-1.984.876a.801.801 0 0 1-1.123-.708l-.054-1.78a.806.806 0 0 0-.27-.569 9.49 9.49 0 0 1-3.14-7.175 9.65 9.65 0 0 1 10-9.7Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.739"
            />
            <path
              d="M17.79 10.132a.659.659 0 0 0-.962-.873l-2.556 2.05a.63.63 0 0 1-.758.002L11.06 9.47a1.576 1.576 0 0 0-2.277.42l-2.567 3.98a.659.659 0 0 0 .961.875l2.556-2.049a.63.63 0 0 1 .759-.002l2.452 1.84a1.576 1.576 0 0 0 2.278-.42Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-gray-800 font-semibold text-sm">{label}</span>
        </div>

        {/* Avatar */}
        <img
          src={avatarUrl}
          alt="Avatar người dùng"
          className="w-6 h-6 rounded-full object-cover"
        />
      </button>

      {/* Khung tin nhắn */}
      {open && (
        <div className="fixed bottom-10 right-10 w-[350px] bg-white rounded-2xl shadow-2xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h2 className="text-lg font-semibold">Tin nhắn</h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-full hover:bg-gray-100">
                <Maximize className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="space-y-2 overflow-y-auto max-h-[420px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={msg.avatar}
                    alt={msg.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{msg.name}</p>
                    <p className="text-xs text-gray-500 truncate w-[180px]">
                      {msg.message}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{msg.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingDirectMessage;
