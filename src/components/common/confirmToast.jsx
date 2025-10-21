import { toast, Toaster } from "sonner";
import { Info } from "lucide-react";
const confirmToast = (message) => {
    return new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <Info className="text-primary-btn" size={18} />
            <span className="flex-1 text-sm font-medium">{message}</span>
            <div className="flex gap-2 w-32">
              <button
                onClick={() => {
                  resolve(true);
                  toast.dismiss();
                }}
                className="flex-1 px-2 py-1.5 bg-primary-btn hover:bg-primary-btn-hover text-white text-sm rounded-md transition"
              >
                Có
              </button>
              <button
                onClick={() => {
                  resolve(false);
                  toast.dismiss();
                }}
                className="flex-1 px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition"
              >
                Không
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });
  };
  export default confirmToast;