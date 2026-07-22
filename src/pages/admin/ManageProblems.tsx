import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Problem, ProblemStatus, ProblemUrgency } from "@/data/mockData";

type ProblemFilter = "all" | ProblemStatus;

const problemFilters: ProblemFilter[] = ["all", "pending", "resolved"];

const fetchProblems = async (): Promise<Problem[]> => {
  const res = await fetch("/api/problems");
  return res.json();
};

const updateProblemStatus = async ({ id, status }: { id: string; status: ProblemStatus }): Promise<Problem> => {
  const res = await fetch(`/api/problems/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

const ManageProblems = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ProblemFilter>("all");

  const { data: problems = [], isLoading } = useQuery({ 
    queryKey: ["admin_problems"], 
    queryFn: fetchProblems 
  });

  const mutation = useMutation({
    mutationFn: updateProblemStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_problems"] });
      toast.success("อัปเดตสถานะปัญหาสำเร็จ");
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  });

  const filteredProblems = problems.filter((p) => filter === "all" ? true : p.status === filter);

  const getUrgencyBadge = (urgency: ProblemUrgency) => {
    switch (urgency) {
      case "high":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">สูง</span>;
      case "low":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">ต่ำ</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800">ปานกลาง</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">รายการแจ้งปัญหา</h2>
        
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
          {problemFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                filter === f 
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              {f === "all" ? "ทั้งหมด" : f === "pending" ? "รอแก้ไข" : "แก้ไขแล้ว"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : filteredProblems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">ไม่พบรายการแจ้งปัญหา</div>
        ) : (
          filteredProblems.map((problem) => (
            <div key={problem.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{problem.problemType}</h3>
                    <p className="text-xs text-gray-500">{new Date(problem.reportedAt).toLocaleDateString("th-TH")}</p>
                  </div>
                </div>
                {getUrgencyBadge(problem.urgency)}
              </div>
              
              <div className="flex-1">
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  <p className="font-medium text-xs text-gray-500 mb-1">รายละเอียด:</p>
                  <p>{problem.details}</p>
                  <p className="font-medium text-xs text-gray-500 mt-2 mb-1">ห้อง:</p>
                  <p>{problem.roomId}</p>
                  
                  {problem.image && (
                    <div className="mt-3">
                      <p className="font-medium text-xs text-gray-500 mb-1">รูปภาพประกอบ:</p>
                      <a href={problem.image} target="_blank" rel="noreferrer" className="block w-full overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity">
                        <img src={problem.image} alt="Problem attachment" className="w-full h-32 object-cover bg-gray-100 dark:bg-gray-800" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-md",
                  problem.status === "resolved" 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                )}>
                  {problem.status === "resolved" ? "แก้ไขแล้ว" : "รอดำเนินการ"}
                </span>

                {problem.status === "pending" && (
                  <button 
                    onClick={() => mutation.mutate({ id: problem.id, status: "resolved" })}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    <CheckCircle size={16} /> รับทราบ/แก้ไขแล้ว
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageProblems;
