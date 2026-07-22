import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Evaluation } from "@/data/mockData";

const fetchEvaluations = async (): Promise<Evaluation[]> => {
  const res = await fetch("/api/evaluations");
  return res.json();
};

const ViewEvaluations = () => {
  const { data: evaluations = [], isLoading } = useQuery({ 
    queryKey: ["admin_evaluations"], 
    queryFn: fetchEvaluations 
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">ผลประเมินความพึงพอใจ</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : evaluations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">ไม่มีข้อมูลการประเมิน</div>
        ) : (
          evaluations.map((evalItem) => (
            <div key={evalItem.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                {renderStars(evalItem.rating)}
                <span className="text-xs text-gray-400">
                  {new Date(evalItem.submittedAt).toLocaleDateString("th-TH")}
                </span>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg italic text-gray-600 dark:text-gray-300 text-sm">
                "{evalItem.feedback || "ไม่มีข้อเสนอแนะเพิ่มเติม"}"
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewEvaluations;
