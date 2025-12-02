export default function DashboardCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
