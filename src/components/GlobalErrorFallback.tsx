import { AlertTriangle, RefreshCw } from "lucide-react";
import { FallbackProps } from "react-error-boundary";

export const GlobalErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
        <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">ไม่สามารถเชื่อมต่อได้</h1>
        <p className="text-slate-500 mb-6">
          อาจเกิดจากอินเทอร์เน็ตหลุด หรือเซิร์ฟเวอร์ไม่ตอบสนอง กรุณาตรวจสอบการเชื่อมต่อของคุณแล้วลองใหม่อีกครั้ง
        </p>
        <p className="text-xs text-slate-400 mb-8 bg-slate-50 p-3 rounded-lg overflow-x-auto text-left">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-sky-500/20"
        >
          <RefreshCw className="h-5 w-5" />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
};
