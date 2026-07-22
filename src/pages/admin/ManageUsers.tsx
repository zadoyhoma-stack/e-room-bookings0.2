import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  KeyRound,
  Power,
  Trash2,
  GraduationCap,
  Mail,
  User,
  ShieldAlert
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import * as ds from "@/services/dataService";

interface StudentData {
  id: string;
  studentId: string;
  name: string;
  faculty: string;
  email: string;
  status: "active" | "disabled";
  profilePic?: string;
}

const ManageUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: () => ds.getUsers(),
  });

  // Map user data to StudentData format for the UI
  const students: StudentData[] = users.map(u => ({
    id: u.id,
    studentId: u.studentId || "-",
    name: u.name,
    faculty: u.department || "ไม่ระบุ",
    email: u.email || "-",
    status: "active", // mock status
    profilePic: u.profilePic
  }));

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (action: string, student: StudentData) => {
    toast({
      title: `การดำเนินการ: ${action}`,
      description: `ดำเนินการกับ ${student.name} แล้ว`,
    });
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-slate-500 mt-2">จัดการบัญชีผู้ใช้ สิทธิ์การเข้าถึง และข้อมูลของนักศึกษา</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 h-11 px-6">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา, หรืออีเมล..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              กรองตามคณะ
            </Button>
            <Button variant="outline" className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              สถานะ: ทั้งหมด
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">โปรไฟล์</th>
                <th className="px-6 py-4 font-semibold tracking-wider">รหัสนักศึกษา</th>
                <th className="px-6 py-4 font-semibold tracking-wider">คณะ</th>
                <th className="px-6 py-4 font-semibold tracking-wider">สถานะ</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    ไม่พบผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
                          {student.profilePic ? (
                            <img src={student.profilePic} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-[15px]">{student.name}</div>
                          <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5" /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {student.faculty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ใช้งานปกติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> ถูกระงับ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100">
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleAction("Edit", student)}>
                            <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> แก้ไขข้อมูล
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleAction("Reset Password", student)}>
                            <KeyRound className="w-4 h-4 mr-2 text-amber-500" /> รีเซ็ตรหัสผ่าน
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleAction("Toggle Status", student)}>
                            <Power className="w-4 h-4 mr-2 text-slate-500" /> 
                            {student.status === 'active' ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30" onClick={() => handleAction("Delete", student)}>
                            <Trash2 className="w-4 h-4 mr-2" /> ลบผู้ใช้
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-sm text-slate-500">แสดง 1 ถึง {filteredStudents.length} จาก {filteredStudents.length} รายการ</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="rounded-lg border-slate-200" disabled>ก่อนหน้า</Button>
            <Button variant="outline" size="sm" className="rounded-lg border-slate-200">ถัดไป</Button>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default ManageUsers;
