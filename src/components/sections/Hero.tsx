import { Button } from "@/components/ui/button";
import { CalendarDays, Users, ArrowRight } from "lucide-react";

export const Hero = () => (
  <section 
    className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('/hero-bg.jpg')" }}
  >
    {/* Dark overlay for text readability */}
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

    {/* Decorative blobs */}
    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl" />

    <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
      {/* Text */}
      <div className="flex-1 text-center lg:text-left animate-fade-in-up">
        <h1 className="text-6xl sm:text-7xl lg:text-[6.5rem] font-black leading-[1.1] tracking-tighter mb-6 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-1 sm:gap-5">
          <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">ARIT</span>
          <span className="relative inline-block group whitespace-nowrap">
            {/* Subtle glow effect behind the text */}
            <span className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 blur-2xl opacity-50 rounded-full group-hover:opacity-70 transition-opacity duration-700"></span>
            {/* The actual text with shiny gradient */}
            <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-blue-400 drop-shadow-sm">
              E-ROOMs
            </span>
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/85 max-w-lg mx-auto lg:mx-0 leading-relaxed">
          ระบบจองห้องประชุมออนไลน์ สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฎมหาสารคาม
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
          <a href="#booking">
            <Button size="lg" className="rounded-2xl text-base px-8 glow-primary shadow-lg hover-lift">
              เริ่มจองห้อง
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <a href="#calendar">
            <Button size="lg" variant="outline" className="rounded-2xl text-base px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 hover-lift">
              ดูห้องว่างวันนี้
            </Button>
          </a>
        </div>
      </div>

      {/* Floating glass elements */}
      <div className="flex-1 relative hidden lg:flex items-center justify-center min-h-[340px]">
        {/* Card 1: Today */}
        <div
          className="absolute top-0 right-16 p-4 rounded-3xl animate-float shadow-2xl backdrop-blur-md"
          style={{
            animationDelay: '0s',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85), rgba(59, 130, 246, 0.95))',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}
        >
          <div className="flex items-center gap-3 text-white">
            <CalendarDays className="h-6 w-6" />
            <div>
              <div className="text-sm font-bold">วันนี้</div>
              <div className="text-xs text-white/90">4 มี.ค. 2569</div>
            </div>
          </div>
        </div>

        {/* Card 2: Room Status */}
        <div
          className="absolute top-[100px] left-8 p-5 rounded-3xl animate-float shadow-2xl backdrop-blur-md w-56"
          style={{
            animationDelay: '1s',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85), rgba(59, 130, 246, 0.95))',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}
        >
          <div className="text-white space-y-1">
            <div className="text-sm font-bold">ห้องประชุม B205</div>
            <div className="text-xs text-white/90 flex items-center gap-1"><Users className="h-3 w-3" /> 8 คน</div>
            <span className="inline-flex mt-1 px-3 py-0.5 rounded-full bg-emerald-400 text-white text-[10px] font-medium shadow-sm">
              ว่าง
            </span>
          </div>
        </div>

        {/* Card 3: Success */}
        <div
          className="absolute bottom-8 right-8 p-4 rounded-3xl animate-float shadow-2xl backdrop-blur-md"
          style={{
            animationDelay: '2s',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85), rgba(59, 130, 246, 0.95))',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}
        >
          <div className="text-white text-xs space-y-1">
            <div className="font-bold text-sm">คำขอจองสำเร็จ ✓</div>
            <div className="text-white/90">13:00 – 15:00 • ห้อง C310</div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom wave transition to white */}
    <div className="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V100H0V40Z" fill="white" />
      </svg>
    </div>
  </section>
);
