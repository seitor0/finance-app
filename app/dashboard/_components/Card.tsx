export default function Card({
  titulo,
  valor,
  color = "",
}: {
  titulo: string;
  valor: number | string;
  color?: string;
}) {
  return (
    <div className="p-5 bg-white shadow rounded">
      <p className="text-sm text-gray-500 mb-1">{titulo}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {typeof valor === "number"
          ? "$" + valor.toLocaleString()
          : valor}
      </p>
    </div>
  );
}
