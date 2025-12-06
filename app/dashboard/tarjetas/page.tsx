"use client";
import FormTarjeta from "./_components/FormTarjeta";
import ListaTarjetas from "./_components/ListaTarjetas";

export default function TarjetasPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Gastos con Tarjeta</h1>
      <FormTarjeta />
      <ListaTarjetas />
    </div>
  );
}
