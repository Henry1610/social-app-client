import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const FloatingInput = ({
  type = "text",
  id,
  value,
  onChange,
  label,
  required = false,
  showToggle = false, // cho password
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showToggle && showPassword ? "text" : type;
  const hasValue = value && value.length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={inputType}
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className={`peer w-full border border-gray-300 rounded-md px-3 pt-4 pb-2 text-sm bg-gray-50
          focus:outline-none focus:ring-1 focus:ring-gray-400 ${showToggle ? "pr-10" : ""}`}
      />

      <label
        htmlFor={id}
        className={`absolute left-3 text-gray-400 text-xs pointer-events-none
          transition-all duration-200
          ${
            hasValue
              ? "top-1 text-[10px] translate-y-0"
              : "top-1/2 -translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2"
          }
          peer-focus:top-1 peer-focus:text-[10px] peer-focus:translate-y-0`}
      >
        {label}
      </label>

      {showToggle && hasValue && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};

export default FloatingInput;
