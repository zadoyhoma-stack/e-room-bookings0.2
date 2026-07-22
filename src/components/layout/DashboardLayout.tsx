import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export const DashboardLayout = ({ children, sidebar }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </main>
        
        {/* Right Sidebar */}
        {sidebar && (
          <aside className="hidden xl:block w-[360px] min-h-screen sticky top-0 border-l border-slate-200/50 bg-white/40 backdrop-blur-xl pt-20 px-6 shrink-0">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
};
