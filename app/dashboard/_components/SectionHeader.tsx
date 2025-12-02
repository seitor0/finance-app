"use client";

export default function SectionHeader({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold">{titulo}</h1>
      {descripcion && (
        <p className="text-gray-600 text-sm mt-1">{descripcion}</p>
      )}
    </div>
  );
}
