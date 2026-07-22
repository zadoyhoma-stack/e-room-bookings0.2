import { GlassCard } from "@/components/shared/GlassCard";
import { LogIn, Search, Send, Bell } from "lucide-react";

const steps = [
  { icon: LogIn, title: 'เข้าสู่ระบบ', desc: 'เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย' },
  { icon: Search, title: 'เลือกห้องและเวลา', desc: 'ค้นหาห้องว่างที่ตรงกับความต้องการ' },
  { icon: Send, title: 'ส่งคำขอและรออนุมัติ', desc: 'ส่งคำขอจองและรอการอนุมัติจากเจ้าหน้าที่' },
  { icon: Bell, title: 'ได้รับแจ้งเตือน', desc: 'รับแจ้งเตือนผลการอนุมัติและเพิ่มลงปฏิทิน' },
];

export const HowItWorks = () => (
  <section id="how" className="py-20 bg-blue-50/40">
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800">วิธีจองห้องประชุม</h2>
        <p className="mt-2 text-slate-500">เพียง 4 ขั้นตอนง่าย ๆ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="p-6 text-center hover-lift rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <step.icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-xs font-bold text-slate-400 mb-1">ขั้นตอนที่ {i + 1}</div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-slate-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
