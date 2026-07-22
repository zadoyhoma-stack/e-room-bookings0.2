import { useState } from "react";
import { ComingSoonModal } from "@/components/modals/ComingSoonModal";

const footerLinks = [
  { label: 'คำถามที่พบบ่อย (FAQ)', key: 'faq' },
  { label: 'นโยบายการใช้ห้อง', key: 'policy' },
  { label: 'ข้อกำหนดการให้บริการ', key: 'terms' },
  { label: 'นโยบายความเป็นส่วนตัว', key: 'privacy' },
];

export const Footer = () => {
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <>
      <footer id="contact" className="section-primary text-white/90 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-125" />
                  <img
                    src="/ตรามหาลัย.png"
                    alt="มหาวิทยาลัยราชภัฎมหาสารคาม"
                    className="relative h-16 w-auto object-contain drop-shadow-lg"
                  />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight ml-1">
                  ARIT E-ROOMs<br />
                  <span className="text-xs font-normal text-white/60">ม.ราชภัฎมหาสารคาม</span>
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                ระบบจองห้องประชุมออนไลน์ สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฎมหาสารคาม
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">ติดต่อเรา</h3>
              <p className="text-sm leading-relaxed">
                📧 663170010124@rmu.ac.th<br />
                📞 0956938410<br />
                📍 อาคารสำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฎมหาสารคาม
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">ลิงก์ที่เกี่ยวข้อง</h3>
              <ul className="space-y-2">
                {footerLinks.map(link => (
                  <li key={link.key}>
                    <button
                      onClick={() => setComingSoon(true)}
                      className="text-sm text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
            © 2569 ARIT E-ROOMs — ระบบจองห้องประชุมออนไลน์ (Prototype)
          </div>
        </div>
      </footer>
      <ComingSoonModal open={comingSoon} onOpenChange={setComingSoon} />
    </>
  );
};
