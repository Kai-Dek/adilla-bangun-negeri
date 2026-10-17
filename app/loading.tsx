export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50/50">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-[#f97316] animate-spin" />
      </div>
      <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">
        Memuat halaman...
      </p>
    </div>
  );
}
