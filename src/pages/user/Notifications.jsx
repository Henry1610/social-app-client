import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationCenter } from "../../components/common/NotificationCenter";

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-white md:hidden overflow-y-auto z-50" style={{ width: '100vw', left: 0, right: 0, marginLeft: 0 }}>
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-1 mr-3"
            aria-label="Quay lại"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold">Thông báo</h1>
        </div>
      </header>

      {/* Notifications List */}
      <div className="pb-20 w-full">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default Notifications;

