import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import MyBookingsPage from "./pages/MyBookingsPage";

// ตั้งค่า QueryClient ให้ cache data อย่างเหมาะสม ลด re-fetch ซ้ำซ้อน
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // ข้อมูลยัง "สด" อยู่ 30 วินาที ไม่ต้อง fetch ซ้ำ
      gcTime: 5 * 60 * 1000,       // เก็บ cache ไว้ 5 นาที
      refetchOnWindowFocus: false,  // ไม่ fetch ซ้ำตอนกลับมาที่หน้าต่าง
      retry: 1,                    // retry แค่ 1 ครั้งถ้า fail
    },
  },
});

// Loading fallback ที่สวยงาม
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-400 animate-pulse">กำลังโหลด...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/staff/*" element={<Staff />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
