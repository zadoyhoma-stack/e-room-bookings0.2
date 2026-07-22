import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth, AppUser } from "@/contexts/AuthContext";
import { Users, ShieldCheck, User, GraduationCap, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleIcon = ({ role }: { role: string }) => {
  if (role === 'admin') return <ShieldCheck className="h-4 w-4 text-violet-400" />;
  if (role === 'staff') return <Users className="h-4 w-4 text-sky-400" />;
  return <GraduationCap className="h-4 w-4 text-emerald-400" />;
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
      const res = await fetch('/api/users');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-2xl border-white/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl text-card-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {isAdmin ? 'จัดการบัญชีผู้ใช้งาน' : 'รายชื่อผู้ใช้งานในระบบ'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base mt-1">
              {isAdmin ? 'เพิ่ม แก้ไข หรือลบสิทธิ์การใช้งานของผู้ใช้ทั้งหมด' : 'ดูรายชื่อและข้อมูลของผู้ใช้งานในระบบ (อ่านเท่านั้น)'}
            </DialogDescription>
          </div>
          {isAdmin && (
            <Button className="bg-primary text-white" onClick={() => alert('จำลองการเพิ่มผู้ใช้')}>
              + เพิ่มผู้ใช้งาน
            </Button>
          )}
        </DialogHeader>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3">อีเมล</th>
                    <th className="px-4 py-3">สิทธิ์ / Role</th>
                    <th className="px-4 py-3">ข้อมูลเพิ่มเติม</th>
                    {isAdmin && <th className="px-4 py-3 text-right">จัดการ</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-card-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {u.profilePic ? (
                              <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
                          <RoleIcon role={u.role} />
                          <span className="text-xs font-medium uppercase text-card-foreground/70">{u.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {u.department && <div>{u.department}</div>}
                        {u.studentId && <div>รหัสนศ: {u.studentId}</div>}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded-md transition-colors" onClick={() => alert('จำลองแก้ผู้ใช้')}>
                              <Edit className="h-4 w-4" />
                            </button>
                            {u.role !== 'admin' && (
                              <button className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-md transition-colors" onClick={() => alert('จำลองลบผู้ใช้')}>
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
      </DialogContent>
    </Dialog>
  );
};
