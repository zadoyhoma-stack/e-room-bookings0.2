import { useState } from "react";
import { Plus, MoreVertical, Edit2, Trash2, Image as ImageIcon, MapPin, Users, Settings2, DoorOpen, Save, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Room } from "@/data/mockData";
import * as ds from "@/services/dataService";

const RoomManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // For editing
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEquipment, setEditEquipment] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editImage, setEditImage] = useState("");

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["admin_rooms"],
    queryFn: () => ds.getRooms()
  });

  const updateMutation = useMutation({
    mutationFn: async (room: Partial<Room> & { id: string }) => {
      const { id, ...data } = room;
      return ds.updateRoom(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] }); // user side rooms might use this key
      toast({ title: "สำเร็จ", description: "อัปเดตข้อมูลห้องประชุมเรียบร้อยแล้ว" });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตข้อมูลได้", variant: "destructive" });
    }
  });

  const handleAction = (action: string, room: Room) => {
    if (action === "Edit Details" || action === "Edit Name/Capacity" || action === "Upload Images") {
      setSelectedRoom(room);
      setEditName(room.name);
      setEditCapacity(room.capacity.toString());
      setEditDescription(room.description || "");
      setEditEquipment(room.equipment?.join(", ") || "");
      setEditRules(room.rules?.join("\n") || "");
      setEditImage(room.image || "");
      setIsModalOpen(true);
    } else if (action === "Set Availability") {
      updateMutation.mutate({ 
        id: room.id, 
        status: room.status === "available" ? "maintenance" : "available" 
      });
    } else {
      toast({ title: `การดำเนินการ: ${action}`, description: `กำลังพัฒนาระบบนี้สำหรับ ${room.name}` });
    }
  };

  const handleSave = () => {
    if (!selectedRoom) return;
    updateMutation.mutate({
      id: selectedRoom.id,
      name: editName,
      capacity: parseInt(editCapacity) || 0,
      description: editDescription,
      equipment: editEquipment.split(",").map(e => e.trim()).filter(Boolean),
      rules: editRules.split("\n").map(r => r.trim()).filter(Boolean),
      image: editImage,
    });
  };

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <DoorOpen className="w-6 h-6" />
            </div>
            จัดการห้องประชุม
          </h1>
          <p className="text-slate-500 mt-2">จัดการข้อมูลห้องประชุม ความจุ และสิ่งอำนวยความสะดวก</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 h-11 px-6">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มห้องใหม่
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="ค้นหาห้องประชุม..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white backdrop-blur-md shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10 text-slate-500">กำลังโหลดข้อมูลห้องประชุม...</div>
        ) : filteredRooms.map((room) => (
          <Card key={room.id} className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-[24px] group hover:shadow-xl transition-all">
            {/* Image Thumbnail */}
            <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img src={room.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${room.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                  {room.status === 'available' ? 'ว่าง' : 'ปิดปรับปรุง'}
                </span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold">{room.name}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-300 mt-1 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {room.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> ความจุ {room.capacity} คน</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-slate-500">สิ่งอำนวยความสะดวก</div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {(room.equipment || []).slice(0, 3).map((eq, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    {eq}
                  </span>
                ))}
                {(room.equipment || []).length > 3 && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    +{room.equipment!.length - 3}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" className="rounded-xl font-semibold border-slate-200" onClick={() => handleAction("Edit Details", room)}>
                  ดู/แก้ไขรายละเอียด
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleAction("Edit Name/Capacity", room)}>
                      <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> แก้ไขข้อมูลห้อง
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleAction("Set Availability", room)}>
                      <Settings2 className="w-4 h-4 mr-2 text-slate-500" /> สลับสถานะ (ว่าง/ซ่อม)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Room Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[24px]">
          <DialogTitle className="sr-only">แก้ไขห้องประชุม</DialogTitle>
          <div className="h-48 w-full relative group/image">
            <img src={editImage || selectedRoom?.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} alt={selectedRoom?.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Image Upload Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm gap-2">
              <input 
                type="file" 
                accept="image/*" 
                id="image-upload" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // เนื่องจากไม่มี Backend บน Vercel ให้แปลงรูปเป็น Base64 Data URL เพื่อบันทึกลง LocalStorage แทน
                  // แต่เพื่อให้ LocalStorage ไม่เต็ม จึงต้องบีบอัดขนาดรูปก่อน
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement("canvas");
                      const MAX_WIDTH = 800;
                      const MAX_HEIGHT = 600;
                      let width = img.width;
                      let height = img.height;

                      if (width > height) {
                        if (width > MAX_WIDTH) {
                          height *= MAX_WIDTH / width;
                          width = MAX_WIDTH;
                        }
                      } else {
                        if (height > MAX_HEIGHT) {
                          width *= MAX_HEIGHT / height;
                          height = MAX_HEIGHT;
                        }
                      }

                      canvas.width = width;
                      canvas.height = height;
                      const ctx = canvas.getContext("2d");
                      ctx?.drawImage(img, 0, 0, width, height);
                      
                      // แปลงรูปด้วยคุณภาพ 0.6 เพื่อลดขนาดไฟล์
                      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
                      setEditImage(compressedBase64);
                      toast({ title: "อัปโหลดสำเร็จ", description: "เปลี่ยนรูปภาพห้องประชุมแล้ว กรุณากดบันทึก" });
                    };
                    img.src = event.target?.result as string;
                  };
                  reader.onerror = () => {
                    toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอ่านไฟล์รูปภาพได้", variant: "destructive" });
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <Label 
                htmlFor="image-upload" 
                className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors border border-white/40"
              >
                <ImageIcon className="w-4 h-4" />
                อัปโหลดรูปภาพใหม่
              </Label>
              <div className="text-white/70 text-xs">หรือวาง URL รูปภาพด้านล่าง</div>
            </div>

            <div className="absolute bottom-4 left-6 text-white w-full pr-12">
              <h2 className="text-2xl font-bold">แก้ไข: {selectedRoom?.name}</h2>
              <Input 
                placeholder="URL รูปภาพ..." 
                value={editImage} 
                onChange={(e) => setEditImage(e.target.value)}
                className="mt-2 bg-black/40 border-white/20 text-white placeholder:text-white/60 h-8 rounded-lg text-sm w-3/4 backdrop-blur-md focus:bg-black/60 focus:border-white/40" 
              />
            </div>
            <Button variant="outline" size="icon" className="absolute top-4 right-4 rounded-full bg-black/40 border-white/20 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md z-10" onClick={() => setIsModalOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-500 font-bold">ชื่อห้อง</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl h-11 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500 font-bold">ความจุ (คน)</Label>
                <Input type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} className="rounded-xl h-11 border-slate-200" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-500 font-bold">รายละเอียด / คำอธิบาย</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="rounded-xl resize-none border-slate-200" rows={3} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 font-bold">สิ่งอำนวยความสะดวก (คั่นด้วยลูกน้ำ)</Label>
              <Input value={editEquipment} onChange={(e) => setEditEquipment(e.target.value)} className="rounded-xl h-11 border-slate-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 font-bold">กฎการใช้งานห้อง (บรรทัดละ 1 ข้อ)</Label>
              <Textarea value={editRules} onChange={(e) => setEditRules(e.target.value)} className="rounded-xl resize-none border-slate-200" rows={4} />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">ยกเลิก</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30">
              <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
