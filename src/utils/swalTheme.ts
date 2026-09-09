import Swal from "sweetalert2";

export const swalCustomClass = {
  popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 font-sans p-6 text-slate-800 dark:text-slate-100",
  title: "text-xl font-bold tracking-tight text-slate-900 dark:text-white pt-2",
  htmlContainer: "text-sm text-slate-600 dark:text-slate-300 font-medium py-2",
  confirmButton: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-indigo-500/20 transition-all mx-1",
  cancelButton: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-5 py-2.5 font-bold text-sm transition-all mx-1",
  denyButton: "bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-rose-500/20 transition-all mx-1",
};

export const createSwal = Swal.mixin({
  customClass: swalCustomClass,
  buttonsStyling: false,
  backdrop: `rgba(15, 23, 42, 0.4)`,
});
