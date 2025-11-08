import React from "react";

/**
 * DateSeparator - Component hiển thị phân cách ngày giữa các tin nhắn
 * @param {Object} props
 * @param {string} props.date - Ngày cần hiển thị (ISO string hoặc Date)
 */
const DateSeparator = ({ date }) => {
  if (!date) return null;

  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
        {new Date(date).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
};

export default DateSeparator;

