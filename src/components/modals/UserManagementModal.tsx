import { useState, useEffect } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { useAuth, AppUser } from "@/contexts/AuthContext";
import { Users, ShieldCheck, User, GraduationCap, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleIcon = ({ role }: { role: string }) => {
  if (role === "admin") return <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
  if (role === "staff") return <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
  return <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
};

export const UserManagementModal = ({ open, onOpenChange }: UserManagementModalProps) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      variant="info"
      icon={<Users className="w-6 h-6" />}
      title={isAdmin ? "จัดการบัญชีผู้ใช้งานระบบ" : "รายชื่อผู้ใช้งานในระบบ"}
      description={
        isAdmin
          ? "ตรวจสอบ สิทธิ์การใช้งาน และข้อมูลของผู้ใช้งานทั้งหมดในระบบ"
          : "ดูรายชื่อและสิทธิ์ของผู้ใช้งานในระบบ (โหมดอ่านอย่างเดียว)"
      }
      footer={
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-md shadow-indigo-600/20"
        >
          ปิดหน้าต่าง
        </Button>
      }
    >
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-medium">กำลังโหลดข้อมูลผู้ใช้งาน...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3.5">ชื่อ-นามสกุล</th>
                  <th className="px-5 py-3.5">อีเมล</th>
                  <th className="px-5 py-3.5">สิทธิ์ / Role</th>
                  <th className="px-5 py-3.5">หน่วยงาน / ข้อมูล</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">การจัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {u.profilePic ? (
                            <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-mono">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase">
                        <RoleIcon role={u.role} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">
                      {u.department && <div>{u.department}</div>}
                      {u.studentId && <div className="text-slate-400">รหัส: {u.studentId}</div>}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                            onClick={() => alert("จำลองการแก้ไขผู้ใช้")}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {u.role !== "admin" && (
                            <button
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                              onClick={() => alert("จำลองการลบผู้ใช้")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppModal>
  );
};
